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
import callbackPage from './routes/callbackPageRoute';
import renderPageRoute from './routes/renderPageRoute';
import banner from './utils/banner';
import getLog from './utils/logger';
import API from './routes/apiRoute';

dotenv.config();

const privateKey = fs.readFileSync('./server.key', 'utf8');
const certificate = fs.readFileSync('./server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const { HOST, PORT, CLIENT_ID, CLIENT_SECRET, REDIRECT_URL,
  TOKEN_PATH, AUTH_PATH, ISSUER_URL, DB_NAME, DB_USER, DB_PASS, NODE_ENV } = process.env;
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
    'authorize_url': ISSUER_URL + AUTH_PATH,
    'access_url': ISSUER_URL + TOKEN_PATH,
    'oauth': 2,
    'key': CLIENT_ID,
    'secret': CLIENT_SECRET,
    'scope': 'openid',
    'redirect_uri': `${HOST}:${PORT}${REDIRECT_URL}`,
    'response_type': 'code',
    'callback': REDIRECT_URL,
    'custom_params': {
      'locale': LOCALE,
      'ui_locales': LOCALE,
    }
  }
}));

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
app.get('/api/contacts/:uuid', API.getContacts);
app.patch('/api/contacts/:uuid', API.setContact);

// all page rendering
app.get(REDIRECT_URL, callbackPage);
app.get('*', renderPageRoute);

const server = https.createServer(credentials, app).listen(PORT, () => {
  banner();
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
});

// export server instance so we can hook into it in e2e tests etc
export default server;