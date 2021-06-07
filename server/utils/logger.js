import winston from 'winston';
import 'winston-daily-rotate-file';

const ignorePaths = [
	'/service-worker.js',
	'/favicon.ico',
	'/static',
	'/eis-logo-white.svg',
	'/auth',
];

const ignoreRoute = (req) => !!ignorePaths.find((path) => req.url.includes(path));

const logger = {
	exitOnError: false,
	format: winston.format.simple(),
	ignoreRoute,
	meta: false,
	msg: (req, res) => {
		return `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl} (${
			res.statusCode
		}) ${Math.floor(res.responseTime / 1000)}, User-Agent: ${req.get(
			'User-Agent'
		)}, Referrer: ${req.get('Referrer')}, IP: ${
			req.ip.indexOf(':') >= 0 ? req.ip.substring(req.ip.lastIndexOf(':') + 1) : req.i
		}`;
	},
};

export const accessLog = {
	...logger,
	transports: [
		new winston.transports.DailyRotateFile({
			datePattern: 'YYYY-MM-DD',
			dirname: 'logs',
			filename: 'access-%DATE%.log',
			level: 'debug',
		}),
	],
};

export const errorLog = {
	...logger,
	transports: [
		new winston.transports.DailyRotateFile({
			datePattern: 'YYYY-MM-DD',
			dirname: 'logs',
			filename: 'error-%DATE%.log',
			level: 'error',
		}),
	],
};

export const consoleLog = {
	baseMeta: null,
	colorize: true,
	expressFormat: true,
	format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
	ignoreRoute,
	meta: false,
	metaField: null,
	transports: [new winston.transports.Console()],
};
