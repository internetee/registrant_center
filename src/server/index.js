import dotenv from 'dotenv';
import config from 'config';
import auth from 'http-auth';
import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import connectMongo from 'connect-mongo';
import grant from 'grant-express';
import jwkToPem from 'jwk-to-pem';
import cookieParser from 'cookie-parser';
import https from 'https';
import favicon from 'serve-favicon';
import compression from 'compression';
import path from 'path';
import morgan from 'morgan';
import fs from 'fs';
import axios from 'axios';
import callbackPage from './routes/callbackPageRoute';
import renderPageRoute from './routes/renderPageRoute';
import banner from './utils/banner';
import getLog from './utils/logger';
import API from './routes/apiRoute';

dotenv.config();

console.log(config);

const privateKey = fs.readFileSync('./server.key', 'utf8');
const certificate = fs.readFileSync('./server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const { HOST, PORT, CLIENT_ID, CLIENT_SECRET, REDIRECT_URL,
  TOKEN_URL, AUTH_URL, JWKS_URL, DB_NAME, DB_USER, DB_PASS, NODE_ENV } = process.env;
const logIncoming = process.env.LOG_INCOMING;

const app = express();

if (NODE_ENV === 'development') {
  const htpasswd = auth.basic({
    realm: 'EIS Registreerijaportaal',
    file: `${__dirname}/../../.htpasswd`
  });
  app.use(auth.connect(htpasswd));
}

app.enable('trust proxy');

app.use(bodyParser.json());

app.use(cookieParser());

// logging
if(logIncoming){
  const incomingLog = getLog('INCOMING');
  app.use(morgan('short', { stream: { write: message => incomingLog.info(message.trim()) }}));
}

// compression
app.use(compression()); // GZip compress responses

// static files
app.use(favicon(path.join(__dirname, '../static/favicon.ico')));
app.use('/', express.static(path.join(__dirname, '../static')));
// bundles are mapped like this so dev and prod builds both work (as dev uses src/static while prod uses dist/static)
app.use('/bundles', express.static(path.join(__dirname, '../../dist/bundles')));

const buildErrors = [];

// db
const MongoStore = connectMongo(session);
mongoose.Promise = global.Promise;

mongoose.connect(`mongodb://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASS)}@localhost:27017/${encodeURIComponent(DB_NAME)}`, { useNewUrlParser: true });

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
    maxAge: 7200000
  },
});

app.use(sessionMiddleware);

// middlewares
let LOCALE = 'et';
app.use((req, res, next) => {
  LOCALE = req.cookies.locale || 'et';
  next();
});

// grant auth
app.use(grant({
  'defaults': {
    'protocol': 'https',
    'host': `${HOST}:${PORT}`,
    'state': true,
    'callback': '/auth/callback',
    'transport': 'querystring'
  },
  'openid': {
    'authorize_url': AUTH_URL,
    'access_url': TOKEN_URL,
    'oauth': 2,
    'key': CLIENT_ID,
    'secret': CLIENT_SECRET,
    'scope': 'openid',
    'redirect_uri': REDIRECT_URL,
    'response_type': 'code',
    'callback': '/auth/callback',
    'custom_params': {
      'locale': LOCALE,
      'ui_locales': LOCALE,
    }
  }
}));

const publicKeyPem = [];

const getPublicKeyPem = (publicKey) => {
  publicKeyPem.push(jwkToPem(publicKey));
};

axios.get(JWKS_URL)
  .then(res => {
    console.log('Received public key from TARA'); // eslint-disable-line no-console
    getPublicKeyPem(res.data.keys[0]);
  })
  .catch(e => {
    console.log(`Public key request error: ${e}`); // eslint-disable-line no-console
  });

export { publicKeyPem };

app.use(helmet());

// api
app.get('/api/menu/:type', API.getMenu);
app.get('/api/user', API.getUser);
app.post('/api/destroy', API.destroyUser);
app.get('/api/domains', API.getDomains);
app.get('/api/domains/:uuid', API.getDomain);
app.post('/api/domains/:uuid/registry_lock', API.setDomainRegistryLock);
app.delete('/api/domains/:uuid/registry_lock', API.deleteDomainRegistryLock);
app.get('/api/contacts', API.getContacts);
app.patch('/api/contacts/:uuid', API.setContact);

// all page rendering
app.get('/auth/callback', callbackPage);
app.get('*', renderPageRoute);

const server = https.createServer(credentials, app).listen(process.env.PORT, () => {
  banner();
  if (buildErrors.length > 0) {
    server.close(() => {
      console.log('BUILD FAILED!', buildErrors); // eslint-disable-line no-console
    });
  } else {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({
      'Host': HOST,
      'Port': PORT,
      'Environment': NODE_ENV,
      'Commands': {
        'rs': 'Restart server',
        'ctrl+c': 'Stop server'
      },
    }, null, 2));
    // 'ready' is a hook used by the e2e (integration) tests (see node-while)
    server.emit('ready');
  }
});

// export server instance so we can hook into it in e2e tests etc
export default server;