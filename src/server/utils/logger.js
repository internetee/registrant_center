/*
Setup for winston logger. Default logger setup is to console and to file. Common
config (like desired log level, or log file location) is already controlled by config 
files (see config/default.js) so they can be easily configured per environment.
*/
import path from 'path';
import winston, {config as winstonConfig} from 'winston';
import callerCallsite from 'caller-callsite';
import util from 'util';

import colors from './terminalColors';


const BYTES_PER_MEGABYTE = 1024*1024;

const { 
  CONSOLE_LOG_LEVEL, 
  LOG_FILE_LOG_LEVEL, 
  LOG_FILE_PATH, 
  MAX_LOG_FILE_SIZE_IN_MB, 
  MAX_LOG_FILE_COUNT 
} = process.env;

winston.addColors({
  'debug':'grey',
  'info':'white',
  'warn':'yellow',
  'error':'red'
});

function isEmptyObjectOrUndefined(obj){
  return !obj || (Object.keys(obj).length === 0 && obj.constructor === Object);
}

function formatLogMessage(options, context = ''){
  const time = (new Date()).toISOString();
  const logLevel = winstonConfig.colorize(options.level, options.level.toUpperCase().padEnd(5));
  const meta = isEmptyObjectOrUndefined(options.meta) ? '' : util.format(options.meta);
  return `${colors.dim}${time}${colors.reset} ${logLevel} ${colors.dim}[${context}]${colors.reset} ${options.message} ${meta}`;
}

export default function getLog(context) {
  const filePath = context || path.basename(callerCallsite().getFileName());

  return winston.createLogger({
    transports: [

      new (winston.transports.Console)({
        level: CONSOLE_LOG_LEVEL,
        handleExceptions: true,
        json: false,
        colorize: true,
        formatter: (options)=>{
          return formatLogMessage(options, filePath);
        }
      }),

      new (winston.transports.File)({
        level: LOG_FILE_LOG_LEVEL,
        filename: LOG_FILE_PATH,
        handleExceptions: true,
        json: false,
        maxsize: MAX_LOG_FILE_SIZE_IN_MB * BYTES_PER_MEGABYTE,
        maxFiles: MAX_LOG_FILE_COUNT,
        colorize: false,
        formatter: (options)=>{
          return formatLogMessage(options, filePath);
        }
      })
      
    ],
    exitOnError: false
  });

}
