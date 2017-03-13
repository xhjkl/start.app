//
// Starting point for the server side
//
const fs = require('fs');
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

const StaticDir = 'static';

let app = express();
app.disable('x-powered-by');

app.use(express.static(path.resolve(__dirname, StaticDir)));

const cookieSecret = process.env.COOKIE_SECRET;
let cookie = cookieParser(cookieSecret);
let sessionStore = new expressSession.MemoryStore();
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
  res.sendFile('default.html', { root: StaticDir })
});

app.get('/auth/github', auth.authenticate('github'));
app.get('/auth/github/callback',
  auth.authenticate('github', { failureRedirect: '/' }),
  (req, res) => { res.redirect('/') }
);

app.get('/auth/twitter', auth.authenticate('twitter'));
app.get('/auth/twitter/callback',
  auth.authenticate('twitter', { failureRedirect: '/' }),
  (req, res) => { res.redirect('/') }
);

app.get('/deauth', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.use((req, res) => {
  res.sendFile('notfound.html', { root: StaticDir });
});

let server = http.createServer(app);

let wss = new ws.Server({ server });
wss.on('connection', (channel) => {
  cookie(channel.upgradeReq, null, (error) => {
    if (error != null) {
      console.error(error);
      return;
    }

    let sessionId = channel.upgradeReq.signedCookies.a;
    sessionStore.get(sessionId, (error, sessionData) => {
      if (error != null) {
        console.error(error);
        return;
      }

      let encodedAuthToken = sessionData.passport.user;
      if (encodedAuthToken == null) {
        // User is logged out. We may want to provide read-only access here.
        return;
      }
      let authToken = db.decodeToken(encodedAuthToken);
      db.rememberUser(authToken).then((user) => {
        if (user == null) {
          console.error('db returned empty user');
          return;
        }

        channel.user = user;
        channel.on('message', (message) => {
          channel.send(`hey, ${JSON.stringify(channel.user)}`);
        });
      });
    });
  });
});

// Go
server.listen(31337, () => {
  console.log(server.address());
});
