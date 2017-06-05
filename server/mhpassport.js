/**
 * Module to encapsulate passport.io-configuration.
 * http://passportjs.org/docs/username-password
 */

var express = require('express')
  , debug = require('debug')('mh-passport')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , api = require('./api')

/**
 * passport callback to lookup user by username & password
 * @param req request object
 * @param username username
 * @param password password
 * @param done callback
 */
var lookupUser = function(req, username, password, done) {
  debug('lookup username', username)
  var userIP = ''
  try {
    api.getUserByUsernamePassword(username, password, userIP, function(err, user){
      if (err || !user) {
        if (err) {
          debug('Auth API error')
          return done(err, null)
        }
        debug('Auth failure')
        return done(null, false);
      }

      debug('User login', JSON.stringify(user))

      return done(null, user)
    })
  } catch (e) {
    console.log('lookupUser ERROR:', e)
  }
}

/**
 * Passport function to serialize a user
 * @param user the user to serialize
 * @param done callback
 */
function serializeUser(user, done){
  //debug('serialize', user)
  done(null,JSON.stringify({id: user.id, token: user.token, phpAutologinToken: user.phpAutologinToken}));
}

/**
 * Passport function to deserialize a user
 * @param req request object
 * @param userString user information as string
 * @param done callback
 */
function deserializeUser(req, userString, done) {
  debug('deserialize', userString)
  var parsed = JSON.parse(userString)

  //debug('deserialize: authenticating')
  api.getUserByToken(parsed.token, req.cookies.al || parsed.phpAutologinToken, '', done)
}

// passport setup
passport.use(new LocalStrategy({passReqToCallback: true}, lookupUser));
passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser)

module.exports = passport
