/*
Setup for winston logger. Default logger setup is to console and to file. Common
config (like desired log level, or log file location) is already controlled by config 
files (see config/default.js) so they can be easily configured per environment.
*/
import path from 'path';
import winston, { config as winstonConfig } from 'winston';
import callerCallsite from 'caller-callsite';
import util from 'util';
import FileRotateTransport from 'fast-file-rotate';

import colors from './terminalColors';

const { CONSOLE_LOG_LEVEL } = process.env;

winston.addColors({
    debug: 'grey',
    error: 'red',
    info: 'white',
    warn: 'yellow',
});

function isEmptyObjectOrUndefined(obj) {
    return !obj || (Object.keys(obj).length === 0 && obj.constructor === Object);
}

function formatLogMessage(options, context = '') {
    const time = new Date().toISOString();
    const logLevel = winstonConfig.colorize(options.level, options.level.toUpperCase().padEnd(5));
    const meta = isEmptyObjectOrUndefined(options.meta) ? '' : util.format(options.meta);
    return `${colors.dim}${time}${colors.reset} ${logLevel} ${colors.dim}[${context}]${colors.reset} ${options.message} ${meta}`;
}

export default function getLog(context) {
    const filePath = context || path.basename(callerCallsite().getFileName());

    return winston.createLogger({
        exitOnError: false,
        transports: [
            new winston.transports.Console({
                colorize: true,
                formatter: (options) => {
                    return formatLogMessage(options, filePath);
                },
                handleExceptions: true,
                json: false,
                level: CONSOLE_LOG_LEVEL,
            }),

            new FileRotateTransport({
                dateFormat: 'YYYY-MM-DD-HH:mm',
                fileName: `${__dirname}/logs/%DATE%.log`,
            }),
        ],
    });
}
