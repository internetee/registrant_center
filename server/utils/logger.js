import winston from 'winston';
import 'winston-daily-rotate-file';
import dotenv from 'dotenv';

dotenv.config();

import { sanitizeData } from './maskData.js';

// Constants
const IGNORE_PATHS = [
    '/service-worker.js',
    '/favicon.ico',
    '/public',
    '/assets',
    '/eis-logo-white.svg',
    '/auth',
    '/api/health',
    '/robots.txt',
    '/.well-known',
    '/manifest.json',
];

// Get log level from environment variable, default to 'info' if not set
const LOG_LEVEL = process.env.LOG_LEVEL?.toLowerCase() || 'info';

// Format constants
const timestampFormat = winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });

// Helper functions
const ignoreRoute = (req) => IGNORE_PATHS.some((path) => req.url.includes(path));

const getUserFromSession = (req) => {
    if (!req.session?.user) return 'anonymous';
    const maskedIdent = sanitizeData(req.session.user.ident, 'ident');
    return `${req.session.user.first_name} ${req.session.user.last_name} [${maskedIdent}]`;
};

const printFormat = winston.format.printf(({ timestamp, level, message, meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;

    if (meta) {
        const filteredMeta = { ...meta };
        logMessage = `${timestamp} [${level}]: ${filteredMeta.user} - ${message}`;

        // Store response data for later if it exists
        const responseData = LOG_LEVEL === 'debug' ? filteredMeta.response : null;
        delete filteredMeta.response;

        if (LOG_LEVEL !== 'debug') {
            delete filteredMeta.res;
            delete filteredMeta.responseTime;
            delete filteredMeta.user;
        }

        const metaStr = Object.entries(filteredMeta)
            .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
            .join(' ');
        if (metaStr) {
            logMessage += ` | ${metaStr}`;
        }

        // Add response data at the end if it exists
        if (responseData) {
            logMessage +=
                '\nResponse Data:\n' +
                JSON.stringify(responseData, null, 2)
                    .split('\n')
                    .map((line) => '  ' + line)
                    .join('\n');
        }
    }
    return logMessage;
});

const expressLogger = {
    exitOnError: false,
    format: winston.format.combine(timestampFormat, printFormat),
    ignoreRoute,
    meta: true,
    metaField: 'meta',
    dynamicMeta: (req, res) => ({
        ip: req.ip.indexOf(':') >= 0 ? req.ip.substring(req.ip.lastIndexOf(':') + 1) : req.ip,
        'User-Agent': req.get('User-Agent'),
        Referrer: req.get('Referrer') || '',
        user: getUserFromSession(req),
        req: {
            url: req.originalUrl,
            method: req.method,
            ...(req.method !== 'GET' && req.body && { body: sanitizeData(req.body) }),
            ...(Object.keys(req.query).length > 0 && { query: sanitizeData(req.query) }),
        },
        ...(LOG_LEVEL === 'debug' &&
            res.locals.responseData && {
                response: sanitizeData(
                    typeof res.locals.responseData === 'string'
                        ? JSON.parse(res.locals.responseData)
                        : res.locals.responseData
                ),
            }),
    }),
    msg: (req, res) => {
        return `${req.method} ${sanitizeUrl(req.originalUrl)} ${res.statusCode} ${res.responseTime}ms`;
    },
};

function sanitizeUrl(url) {
    // Implement URL sanitization logic here
    // For example, removing or encoding certain characters
    if (typeof url === 'string') {
        return url.replace(/[{}]/g, (match) => encodeURIComponent(match));
    } else {
        return '';
    }
}

// Helper function to determine if we should use file logging
const shouldUseFileLogging = () => {
    return ['development', 'test'].includes(process.env.NODE_ENV);
};

export const accessLog = {
    ...expressLogger,
    transports: shouldUseFileLogging()
        ? [
              new winston.transports.DailyRotateFile({
                  datePattern: 'YYYY-MM-DD',
                  dirname: 'logs',
                  filename: 'access-%DATE%.log',
                  level: LOG_LEVEL,
                  format: winston.format.combine(timestampFormat, printFormat),
              }),
          ]
        : [],
};

export const errorLog = {
    ...expressLogger,
    transports: shouldUseFileLogging()
        ? [
              new winston.transports.DailyRotateFile({
                  datePattern: 'YYYY-MM-DD',
                  dirname: 'logs',
                  filename: 'error-%DATE%.log',
                  level: 'error',
                  format: winston.format.combine(timestampFormat, printFormat),
              }),
          ]
        : [],
};

export const consoleLog = {
    ...expressLogger,
    colorize: true,
    expressFormat: true,
    format: winston.format.combine(
        timestampFormat,
        winston.format.colorize({ all: true }),
        printFormat
    ),
    transports: [
        new winston.transports.Console({
            level: LOG_LEVEL,
        }),
    ],
};

// Manual logger instance
export const logger = winston.createLogger({
    format: winston.format.combine(timestampFormat, printFormat),
    transports: [
        // Console transport with colors
        new winston.transports.Console({
            level: LOG_LEVEL,
            format: winston.format.combine(
                timestampFormat,
                winston.format.colorize({ all: true }),
                printFormat
            ),
        }),
        // File transports without colors - only in dev/test
        ...(shouldUseFileLogging()
            ? [
                  new winston.transports.DailyRotateFile({
                      datePattern: 'YYYY-MM-DD',
                      dirname: 'logs',
                      filename: 'app-%DATE%.log',
                      level: LOG_LEVEL,
                      format: winston.format.combine(timestampFormat, printFormat),
                  }),
                  new winston.transports.DailyRotateFile({
                      datePattern: 'YYYY-MM-DD',
                      dirname: 'logs',
                      filename: 'error-%DATE%.log',
                      level: 'error',
                      format: winston.format.combine(timestampFormat, printFormat),
                  }),
              ]
            : []),
    ],
});

// Add convenience methods for logging
export const logDebug = (message, data = {}) => {
    logger.debug(message, { meta: data });
};

export const logInfo = (message, data = {}) => {
    logger.info(message, { meta: data });
};

export const logWarn = (message, data = {}) => {
    logger.warn(message, { meta: data });
};

export const logError = (message, error = null) => {
    const data = error
        ? {
              error: {
                  message: error.message,
                  stack: error.stack,
                  ...error,
              },
          }
        : {};
    logger.error(message, { meta: data });
};
