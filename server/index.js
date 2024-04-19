/* eslint-disable sort-keys */
import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import session from 'cookie-session';
import bodyParser from 'body-parser';
import grant from 'grant-express';
import cookieParser from 'cookie-parser';
import https from 'https';
import favicon from 'serve-favicon';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import expressWinston from 'express-winston';
import jwkToPem from 'jwk-to-pem';
import callbackPage from './routes/callbackPageRoute';
import banner from './utils/banner';
import API from './routes/apiRoute';
import { accessLog, consoleLog, errorLog } from './utils/logger';

dotenv.config();

const privateKey = fs.readFileSync('./server.key', 'utf8');
const certificate = fs.readFileSync('./server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const {
    AUTH_PATH,
    CLIENT_ID,
    CLIENT_SECRET,
    HOST,
    ISSUER_URL,
    JWKS_PATH,
    NODE_ENV,
    REACT_APP_SERVER_PORT,
    REDIRECT_URL,
    SESSION_SECRET,
    TOKEN_PATH,
    REACT_APP_SCOPE,
    RESPONSE_TYPE,
} = process.env;

let publicKey = '';

const app = express();

app.disable('x-powered-by');
app.enable('trust proxy');

app.use(bodyParser.json());

app.use(cookieParser());

// logging
app.use(expressWinston.logger(consoleLog));
app.use(expressWinston.logger(accessLog));
app.use(expressWinston.errorLogger(errorLog));

// compression
app.use(compression()); // GZip compress responses

// static files
if (NODE_ENV !== 'development') {
    app.use(express.static(path.join(__dirname, 'build')));
}
app.use(favicon(path.join(__dirname, '../public/favicon.ico')));

app.use(
    session({
        httpOnly: true,
        maxAge: 7200000,
        secret: SESSION_SECRET,
        secure: true,
    })
);

(async () => {
    try {
        const { data } = await axios.get(ISSUER_URL + JWKS_PATH);
        console.log('Received public key from TARA'); // eslint-disable-line no-console
        publicKey = data.keys[0]; // eslint-disable-line prefer-destructuring
    } catch (e) {
        console.log(`Public key request error: ${e}`); // eslint-disable-line no-console
    }
})();

// middlewares
let LOCALE = 'et';
app.use((req, res, next) => {
    LOCALE = req.cookies.locale || 'et';
    next();
});

const redirect_uri =
    NODE_ENV === 'development'
        ? `https://${HOST}:${REACT_APP_SERVER_PORT}${REDIRECT_URL}`
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
        scope: REACT_APP_SCOPE,
        redirect_uri,
        response_type: RESPONSE_TYPE,
        callback: REDIRECT_URL,
        custom_params: {
            ui_locales: LOCALE,
        },
    }
};

if (REACT_APP_SCOPE.includes('webauthn')) {
    grantConfig.openid.scope = REACT_APP_SCOPE.replace(/(?:^|\s)webauthn(?:\s|$)/, ' ').trim();
    grantConfig.openid.overrides = {
        webauthn: {
            scope: REACT_APP_SCOPE,
        },
    };
  }
  
app.use(grant(grantConfig));

app.use(helmet());
// api
app.get('/api/menu/:type', API.getMenu);
app.get('/api/user', API.getUser);
app.post('/api/destroy', API.destroyUser);
app.get('/api/confirms/:name/:type/:token', API.getRegistrantUpdate);
app.post('/api/confirms/:name/:type/:token/:action', API.sendVerificationStatus);
app.all('/api/*', API.checkAuth);
app.get('/api/domains', API.getDomains);
app.get('/api/domains/:uuid', API.getDomain);
app.post('/api/domains/:uuid/registry_lock', API.setDomainRegistryLock);
app.delete('/api/domains/:uuid/registry_lock', API.deleteDomainRegistryLock);
app.get('/api/contacts/:uuid/do_need_update_contacts', API.doNeedUpdateContacts);
app.post('/api/contacts/:uuid/update_contacts', API.updateContacts);
app.get('/api/companies', API.getCompanies);
app.get('/api/contacts', API.getContacts);
app.get('/api/contacts/:uuid', API.getContacts);
app.patch('/api/contacts/:uuid', API.setContact);

// all page rendering
app.get(REDIRECT_URL, (req, res) => callbackPage(req, res, jwkToPem(publicKey).trim()));

app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));

const server = https
    .createServer(credentials, app)
    .listen(NODE_ENV === 'test' ? 4000 : REACT_APP_SERVER_PORT, () => {
        banner();
        // eslint-disable-next-line no-console
        console.log(`Environment: ${NODE_ENV}`);
        // 'ready' is a hook used by the e2e (integration) tests (see node-while)
        server.emit('ready');
    });

// export server instance so we can hook into it in e2e tests etc
export default server;
