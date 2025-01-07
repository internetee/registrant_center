import winston from 'winston';
import 'winston-daily-rotate-file';
import 'winston-syslog';
import { sanitizeData } from './maskData.js';

const ignorePaths = [
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

const ignoreRoute = (req) => !!ignorePaths.find((path) => req.url.includes(path));

const LOG_LEVEL =
    process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function sanitizeUrl(url) {
    // Implement URL sanitization logic here
    // For example, removing or encoding certain characters
    if (typeof url === 'string') {
        return url.replace(/[{}]/g, (match) => encodeURIComponent(match));
    } else {
        return '';
    }
}

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, meta }) => {
        let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

        if (meta) {
            // Create a filtered copy of meta for info level
            const filteredMeta = { ...meta };

            // Remove response-related fields if not in debug mode
            if (level !== 'debug') {
                delete filteredMeta.response;
                delete filteredMeta.res;
                delete filteredMeta.responseTime;
                delete filteredMeta.user;
            }

            if (level === 'debug') {
                // In debug mode, format metadata in multiple lines
                logMessage +=
                    '\n' +
                    Object.entries(filteredMeta)
                        .map(([key, value]) => {
                            const valueStr =
                                typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
                            return `  ${key}: ${valueStr}`;
                        })
                        .join('\n');
            } else {
                // In info mode, show only essential data in one line
                const metaStr = Object.entries(filteredMeta)
                    .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
                    .join(' ');
                if (metaStr) {
                    logMessage += ` | ${metaStr}`;
                }
            }
        }
        return logMessage;
    })
);

// Add this helper function at the top with other helpers
const getUserFromSession = (req) => {
    if (!req.session?.user) return 'anonymous';
    const maskedIdent = sanitizeData(req.session.user.ident, 'ident');
    return `${req.session.user.first_name} ${req.session.user.last_name} [${maskedIdent}]`;
};

const expressLogger = {
    exitOnError: false,
    format: logFormat,
    ignoreRoute,
    meta: true,
    metaField: 'meta',
    dynamicMeta: (req, res) => {
        // Basic metadata for info level
        const meta = {
            ip: req.ip.indexOf(':') >= 0 ? req.ip.substring(req.ip.lastIndexOf(':') + 1) : req.ip,
            'User-Agent': req.get('User-Agent'),
            Referrer: req.get('Referrer') || '',
            user: getUserFromSession(req), // Use helper function
            req: {
                url: req.originalUrl,
                method: req.method,
                // Include body for non-GET requests
                ...(req.method !== 'GET' &&
                    req.body && {
                        body: sanitizeData(req.body),
                    }),
                // Include query parameters if present
                ...(Object.keys(req.query).length > 0 && {
                    query: sanitizeData(req.query),
                }),
            },
        };

        // Remove the duplicate user setting in debug level
        if (LOG_LEVEL === 'debug') {
            if (res.locals.responseData) {
                try {
                    const responseData =
                        typeof res.locals.responseData === 'string'
                            ? JSON.parse(res.locals.responseData)
                            : res.locals.responseData;
                    meta.response = sanitizeData(responseData);
                } catch (error) {
                    meta.response = 'Error processing response data';
                }
            }
        }

        return meta;
    },
    msg: (req, res) => {
        return `${getUserFromSession(req)} ${req.method} ${sanitizeUrl(req.originalUrl)} ${res.statusCode} ${Math.floor(res.responseTime)}ms`;
    },
};

// Helper function to get appropriate transport based on environment
const getTransport = (options) => {
    if (process.env.NODE_ENV === 'production') {
        // In production, only return syslog transport
        return new winston.transports.Syslog({
            app_name: 'registrant-center',
            level: options.level,
        });
    }

    // In development, return file transport
    return new winston.transports.DailyRotateFile({
        datePattern: 'YYYY-MM-DD',
        dirname: 'logs',
        filename: options.filename,
        level: options.level,
        levels: winston.config.npm.levels,
        maxFiles: '14d',
        zippedArchive: true,
    });
};

export const accessLog = {
    ...expressLogger,
    transports: [
        getTransport({
            filename: 'access-%DATE%.log',
            level: LOG_LEVEL,
        }),
    ],
};

export const errorLog = {
    ...expressLogger,
    transports: [
        getTransport({
            filename: 'error-%DATE%.log',
            level: 'error',
        }),
    ],
};

export const consoleLog = {
    baseMeta: null,
    colorize: true,
    expressFormat: true,
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
        })
    ),
    ignoreRoute,
    meta: false,
    metaField: null,
    transports: [
        new winston.transports.Console({
            level: LOG_LEVEL,
            levels: winston.config.npm.levels,
        }),
    ],
};

export const logger = winston.createLogger({
    format: logFormat,
    levels: winston.config.npm.levels,
    level: LOG_LEVEL,
    transports: [
        // Only add file transport in development
        ...(process.env.NODE_ENV !== 'production'
            ? [
                  getTransport({
                      filename: 'app-%DATE%.log',
                      level: LOG_LEVEL,
                  }),
              ]
            : []),
        // In production, only use syslog
        ...(process.env.NODE_ENV === 'production'
            ? [
                  new winston.transports.Syslog({
                      app_name: 'registrant-center',
                      level: LOG_LEVEL,
                  }),
              ]
            : []),
        // Console transport for both environments
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
            level: LOG_LEVEL,
        }),
    ],
});
