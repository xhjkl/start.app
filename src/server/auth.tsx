//
//  Granting privileges.
//
import * as passport from 'passport'
import * as passportTwitter from 'passport-twitter'
import * as passportGitHub from 'passport-github'

import { Router, Request } from 'express' // eslint-disable-line no-unused-vars
import * as cookieParser from 'cookie-parser'
import * as expressSession from 'express-session'

import * as db from '../database'

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
  clientID: process.env.GITHUB_KEY!,
  clientSecret: process.env.GITHUB_SECRET!,
  callbackURL: `//${baseURL}/auth/github/callback`
}, (_accessToken, _refreshToken, profile, done) => {
  return done(null, profile)
}))

passport.use(new passportTwitter.Strategy({
  consumerKey: process.env.TWITTER_KEY!,
  consumerSecret: process.env.TWITTER_SECRET!,
  callbackURL: `//${baseURL}/auth/twitter/callback`
}, (_token, _secretToken, profile, done) => {
  return done(null, profile)
}))

const cookieSecret = process.env.COOKIE_SECRET!
const cookie = cookieParser(cookieSecret)
const sessionStore = new db.PGSessionStore({ pool: db.pool })
const session = expressSession({
  store: sessionStore,
  name: 'a',
  secret: cookieSecret,
  resave: true,
  saveUninitialized: true
})

const createAuthRouter = () => {
  const router = Router()

  router.use(cookie)
  router.use(session)

  router.use(passport.initialize())
  router.use(passport.session())

  router.get('/auth/github', passport.authenticate('github'))
  router.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (_req, res) => res.redirect('/')
  )

  router.get('/auth/twitter', passport.authenticate('twitter'))
  router.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/' }),
    (_req, res) => res.redirect('/')
  )

  router.get('/deauth', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  return router
}

const getUserFromRequest = (req: Request): { [k: string]: string } | null => {
  if (
    req.session == null ||
    req.session.passport == null ||
    req.session.passport.user == null
  ) {
    return null
  }

  return req.session.passport.user
}

export default createAuthRouter
export { cookie, sessionStore, getUserFromRequest }
