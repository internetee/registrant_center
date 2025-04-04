/* eslint-disable sort-keys */
/* eslint-disable no-unused-vars */
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import banner from './utils/banner.js';
import express from 'express';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import grant from 'grant-express';
import fs from 'fs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressWinston from 'express-winston';
import jwkToPem from 'jwk-to-pem';
import callbackPage from './routes/callbackPageRoute.js';
import { appLog, consoleLog, logError } from './utils/logger.js';
import compression from 'compression';
import session from 'cookie-session';
import API from './routes/apiRoute.js';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load SSL certificates with error handling
let privateKey, certificate, credentials;
try {
    privateKey = fs.readFileSync(path.join(__dirname, '../server.key'), 'utf8');
    certificate = fs.readFileSync(path.join(__dirname, '../server.crt'), 'utf8');
    credentials = { key: privateKey, cert: certificate };
    console.log('✅ SSL certificates loaded successfully');
} catch (error) {
    console.error('❌ Failed to load SSL certificates:', error.message);
    console.error('Please ensure server.key and server.crt exist in the project root');
    process.exit(1);
}

const {
    AUTH_PATH,
    CLIENT_ID,
    CLIENT_SECRET,
    HOST,
    ISSUER_URL,
    JWKS_PATH,
    NODE_ENV,
    VITE_SERVER_PORT,
    REDIRECT_URL,
    SESSION_SECRET,
    TOKEN_PATH,
    VITE_SCOPE,
    RESPONSE_TYPE,
} = process.env;

let publicKey = '';

const app = express();

app.disable('x-powered-by');
app.enable('trust proxy');

app.use(bodyParser.json());
app.use(cookieParser());

// Add response capture middleware BEFORE routes and logging
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        res.locals.responseData = data;
        return originalSend.apply(res, arguments);
    };
    next();
});

// Regular request logging
app.use(expressWinston.logger(consoleLog));
app.use(expressWinston.logger(appLog));

// Error logging - catches unhandled errors
app.use(expressWinston.errorLogger(consoleLog));

// compression
app.use(compression()); // GZip compress responses

// static files
if (NODE_ENV !== 'development') {
    app.use(express.static(path.join(__dirname, '../dist')));
}

// API routes need to be defined before the catch-all route
app.use(
    session({
        name: 'session',
        keys: [SESSION_SECRET],
        httpOnly: true,
        maxAge: 7200000,
        secure: true,
    })
);

if (NODE_ENV !== 'test') {
    (async () => {
        try {
            const { data } = await axios.get(ISSUER_URL + JWKS_PATH);
            if (!data?.keys?.[0]) {
                throw new Error('Invalid JWKS response format');
            }
            publicKey = data.keys[0];
            console.log(
                'Successfully initialized public key from eeID! -> ' + ISSUER_URL + JWKS_PATH
            );
        } catch (e) {
            console.error(`Failed to fetch public key: ${e}`);
            // Optionally, you might want to retry the fetch after a delay
            // setTimeout(() => { /* retry logic */ }, 5000);
        }
    })();
}

// middlewares
let LOCALE = 'et';
app.use((req, res, next) => {
    LOCALE = req.cookies.locale || 'et';
    next();
});

const redirect_uri =
    NODE_ENV === 'development'
        ? `https://${HOST}:${VITE_SERVER_PORT}${REDIRECT_URL}`
        : `https://${HOST}${REDIRECT_URL}`;

// grant auth
const grantConfig = {
    defaults: {
        protocol: 'https',
        host: HOST,
        state: true,
        callback: '/auth/callback',
        transport: 'querystring',
    },
    openid: {
        authorize_url: ISSUER_URL + AUTH_PATH,
        access_url: ISSUER_URL + TOKEN_PATH,
        oauth: 2,
        key: CLIENT_ID,
        secret: CLIENT_SECRET,
        scope: VITE_SCOPE,
        redirect_uri,
        response_type: RESPONSE_TYPE,
        callback: REDIRECT_URL,
        overrides: {
            en: {
                custom_params: { ui_locales: 'en' },
            },
            et: {
                custom_params: { ui_locales: 'et' },
            },
        },
    },
};

// Create grant middleware instance
const grantMiddleware = grant(grantConfig);
app.use(grantMiddleware);

app.use(helmet());
// api
app.get('/api/menu/:type', API.getMenu);
app.get('/api/user', API.getUser);
app.post('/api/destroy', API.destroyUser);
app.get('/api/confirms/:name/:type/:token', API.getRegistrantUpdate);
app.post('/api/confirms/:name/:type/:token/:action', API.sendVerificationStatus);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.all('/api/*', API.checkAuth);

// Protected routes below
app.get('/api/domains', API.getDomains);
app.get('/api/domains/:uuid', API.getDomains);
app.post('/api/domains/:uuid/registry_lock', API.setDomainRegistryLock);
app.delete('/api/domains/:uuid/registry_lock', API.deleteDomainRegistryLock);
app.get('/api/contacts/:uuid/do_need_update_contacts', API.doNeedUpdateContacts);
app.post('/api/contacts/:uuid/update_contacts', API.updateContacts);
app.get('/api/companies', API.getCompanies);
app.get('/api/contacts', API.getContacts);
app.get('/api/contacts/:uuid', API.getContacts);
app.patch('/api/contacts/:uuid', API.setContact);

// Auth callback route
app.get(REDIRECT_URL, (req, res) => callbackPage(req, res, jwkToPem(publicKey).trim()));

// Global error handler
app.use((err, req, res, next) => {
    // Set status code
    const statusCode = err.status || 500;

    // Log if it's a 500 error since it's unexpected
    if (statusCode === 500) {
        logError('Unhandled server error', err);
    }

    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});

// Keep your catch-all route last
if (NODE_ENV !== 'development') {
    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

const PORT = process.env.NODE_ENV === 'test' ? 4000 : process.env.VITE_SERVER_PORT;
const LOG_LEVEL = process.env.LOG_LEVEL;

const server = https.createServer(credentials, app).listen(PORT, () => {
    banner();
    console.log('🔧 Server Configuration:');
    console.log('------------------------');
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`📝 Log Level: ${LOG_LEVEL}`);
    console.log(`🔒 HTTPS: Enabled`);
    console.log(`🚀 Server Port: ${PORT}`);
    console.log(`🌐 Host: ${HOST}`);
    console.log(`🔑 OAuth Provider: ${ISSUER_URL}`);
    console.log(`🔄 Callback URL: ${redirect_uri}`);
    console.log('');
    console.log('✨ Server is ready and listening for requests!');
    server.emit('ready');
});

// export server instance so we can hook into it in e2e tests etc
export default server;
