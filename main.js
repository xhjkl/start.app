//
// Starting point for the server side
//
const ws = require('ws');
const path = require('path');
const http = require('http');

const babelRegister = require('babel-register');
const dotenv = require('dotenv').config();
if (dotenv.error != null) {
  console.error('check dotenv');
  process.exit(3);
}
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');

const db = require('./lib/db').default;
const auth = require('./lib/auth').default;

const serveComponent = require('./lib/serve-component').default;
const DocumentStyling = require('./client/document-styling').default;
const Root = require('./client/root').default;

const StaticDir = 'static';

let app = express();
app.disable('x-powered-by');

app.use(express.static(path.resolve(__dirname, StaticDir)));

const cookieSecret = process.env.COOKIE_SECRET;
const SessionStore = db.createSessionStore(expressSession);
let cookie = cookieParser(cookieSecret);
let sessionStore = new SessionStore({ pool: db.pool });
let session = expressSession({
  store: sessionStore,
  name: 'a',
  secret: cookieSecret,
  resave: true,
  saveUninitialized: true,
});
app.use(cookie);
app.use(session);

app.use(auth.initialize());
app.use(auth.session());

app.get('/', (req, res) => {
  let user = (req.session.passport && req.session.passport.user) || null;

  res.title = 'insert something meaningful here';
  serveComponent(res, Root, { loggedIn: (user != null) });
});

app.get('/auth/github', auth.authenticate('github'));
app.get('/auth/github/callback',
  auth.authenticate('github', { failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);

app.get('/auth/twitter', auth.authenticate('twitter'));
app.get('/auth/twitter/callback',
  auth.authenticate('twitter', { failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);

app.get('/deauth', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.use((req, res) => {
  res.sendFile('notfound.html', { root: StaticDir });
});

let onWebsocketConnection = (channel) => {
  channel.on('message', (message) => {
    channel.send(`hey, ${ JSON.stringify(channel.user) }`);
  });
};

let server = http.createServer(app);

let wss = new ws.Server({ server });
wss.on('connection', (channel, upgradeReq) => {
  cookie(upgradeReq, null, (error) => {
    if (error != null) {
      console.error(error);
      return;
    }

    let sessionId = upgradeReq.signedCookies.a;
    sessionStore.get(sessionId, (error, sessionData) => {
      if (error != null) {
        console.error(error);
        return;
      }

      channel.session = sessionData;
      channel.user = (sessionData.passport && sessionData.passport.user) || null;
      onWebsocketConnection(channel);
    });
  });
});

// Go
db.check((error) => {
  if (error != null) {
    console.error(error);
    return;
  }

  server.listen(31337, () => {
    console.log(server.address());
  });
});
