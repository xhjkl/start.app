//
// Granting privileges
//

import passport from 'passport';
import passportTwitter from 'passport-twitter';
import passportGitHub from 'passport-github';

import db from './db';

passport.serializeUser((user, done) => {
  db.connectUser(user).then((uid) => {
    done(null, uid);
  }).catch((error) => {
    console.error('error in serializeUser:', error);
    done(error, null);
  });
});

passport.deserializeUser((uid, done) => {
  done(null, uid);
});

passport.use(new passportGitHub.Strategy({
  clientID: process.env.GITHUB_KEY,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: 'http://127.0.0.1:31337/auth/github/callback',
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.use(new passportTwitter.Strategy({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: 'http://127.0.0.1:31337/auth/twitter/callback',
}, (token, secretToken, profile, done) => {
  return done(null, profile);
}));

export default passport;
