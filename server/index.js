/* eslint-disable sort-keys */
import axios from 'axios';
import dotenv from 'dotenv';
import auth from 'http-auth';
import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import connectMongo from 'connect-mongo';
import grant from 'grant-express';
import cookieParser from 'cookie-parser';
import https from 'https';
import favicon from 'serve-favicon';
import compression from 'compression';
import path from 'path';
import morgan from 'morgan';
import fs from 'fs';
import jwkToPem from 'jwk-to-pem';
import callbackPage from './routes/callbackPageRoute';
import banner from './utils/banner';
import getLog from './utils/logger';
import API from './routes/apiRoute';

dotenv.config();

const privateKey = fs.readFileSync('./server.key', 'utf8');
const certificate = fs.readFileSync('./server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const {
    HOST,
    PORT,
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL,
    TOKEN_PATH,
    AUTH_PATH,
    ISSUER_URL,
    JWKS_PATH,
    DB_NAME,
    DB_USER,
    DB_PASS,
    LOG_INCOMING: logIncoming,
    NODE_ENV,
    SESSION_SECRET,
} = process.env;

let publicKey = '';

const app = express();

/*
if (NODE_ENV === 'development') {
  const htpasswd = auth.basic({
    realm: 'EIS Registreerijaportaal',
    file: `${__dirname}/../../.htpasswd`
  });
  app.use(auth.connect(htpasswd));
}
 */

app.enable('trust proxy');

app.use(bodyParser.json());

app.use(cookieParser());

// logging
if (logIncoming) {
    const incomingLog = getLog('INCOMING');
    app.use(
        morgan('short', {
            stream: { write: (message) => incomingLog.info(message.trim()) },
        })
    );
}

// compression
app.use(compression()); // GZip compress responses

// static files
app.use(express.static(path.join(__dirname, 'build')));
app.use(favicon(path.join(__dirname, '../public/favicon.ico')));

const MongoStore = connectMongo(session);
mongoose.Promise = global.Promise;

mongoose.connect(
    `mongodb://${encodeURIComponent(DB_USER)}:${encodeURIComponent(
        DB_PASS
    )}@localhost:27017/${encodeURIComponent(DB_NAME)}`,
    { useNewUrlParser: true }
);

const sessionMiddleware = session({
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
        maxAge: 7200000,
    },
});

app.use(sessionMiddleware);

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

// grant auth
app.use(
    grant({
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
            scope: 'openid',
            redirect_uri: `https://${HOST}:${PORT}${REDIRECT_URL}`,
            response_type: 'code',
            callback: REDIRECT_URL,
            custom_params: {
                ui_locales: LOCALE,
            },
        },
    })
);

app.use(helmet());
// api
app.get('/api/menu/:type', API.getMenu);
app.get('/api/user', API.getUser);
app.post('/api/destroy', API.destroyUser);
app.all('/api/*', API.checkAuth);
app.get('/api/domains', API.getDomains);
app.get('/api/domains/:uuid', API.getDomain);
app.post('/api/domains/:uuid/registry_lock', API.setDomainRegistryLock);
app.delete('/api/domains/:uuid/registry_lock', API.deleteDomainRegistryLock);
app.get('/api/contacts', API.getContacts);
app.get('/api/contacts/:uuid', API.getContacts);
app.patch('/api/contacts/:uuid', API.setContact);
// all page rendering
app.get(REDIRECT_URL, (req, res) => callbackPage(req, res, jwkToPem(publicKey).trim()));

app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));

const server = https
    .createServer(credentials, app)
    .listen(NODE_ENV === 'test' ? 3000 : PORT, () => {
        banner();
        // eslint-disable-next-line no-console
        console.log(
            JSON.stringify(
                {
                    Host: HOST,
                    Environment: NODE_ENV,
                },
                null,
                2
            )
        );
        // 'ready' is a hook used by the e2e (integration) tests (see node-while)
        server.emit('ready');
    });

// export server instance so we can hook into it in e2e tests etc
export default server;
