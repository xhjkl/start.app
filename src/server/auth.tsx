//
//  Granting privileges
//
import passport from 'passport'
import passportTwitter from 'passport-twitter'
import passportGitHub from 'passport-github'

import bodyParser from 'body-parser' // eslint-disable-line no-unused-vars
import cookieParser from 'cookie-parser'
import expressSession from 'express-session'

import db from './db'

const baseURL = '127.0.0.1:31337'

passport.serializeUser((user, done) => {
  db.connectUser(user).then((uid) => {
    done(null, uid)
  }).catch((error) => {
    console.error('error in serializeUser:', error)
    done(error, null)
  })
})

passport.deserializeUser((uid, done) => {
  done(null, uid)
})

passport.use(new passportGitHub.Strategy({
  clientID: process.env.GITHUB_KEY,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: `//${ baseURL }/auth/github/callback`,
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile)
}))

passport.use(new passportTwitter.Strategy({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: `//${ baseURL }/auth/twitter/callback`,
}, (token, secretToken, profile, done) => {
  return done(null, profile)
}))

const cookieSecret = process.env.COOKIE_SECRET
const SessionStore = db.createSessionStore(expressSession)
let cookie = cookieParser(cookieSecret)
let sessionStore = new SessionStore({ pool: db.pool })
let session = expressSession({
  store: sessionStore,
  name: 'a',
  secret: cookieSecret,
  resave: true,
  saveUninitialized: true,
})

passport.setRoutes = (app) => {
  app.use(cookie)
  app.use(session)

  app.use(passport.initialize())
  app.use(passport.session())

  app.get('/auth/github', passport.authenticate('github'))
  app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => res.redirect('/')
  )

  app.get('/auth/twitter', passport.authenticate('twitter'))
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/' }),
    (req, res) => res.redirect('/')
  )

  app.get('/deauth', (req, res) => {
    req.logout()
    res.redirect('/')
  })
}

passport.cookie = cookie
passport.sessionStore = sessionStore

export default passport
