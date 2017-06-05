/**
 * Module to encapsulate all authentication logic. This logic consists of four major functionalities:
 *
 * USER LOGIN
 * ==========
 * A user can login with his credentials (currently only username/password). There are two outcomes:
 * - login fail: the user is redirected to a page with information that the login failed
 * - login success: The following things are made
 *   - an autologin cookie is set, which can be queried by the legacy backend
 *   - (optional) if the login was triggered by an attempt to follow an entity (i.e. after clicking a `Follow`-button),
 *     a backend request to follow the entity ==> see AUTOFOLLOW section below
*    - redirect user to target page (page of origin or other page)
 *
 * USER LOGOUT
 * ===========
 * A logout can be triggered by user interaction (clicking the logout-button), expired token or
 * because the logout was performed on the legacy backend. In any case, the logout will invalidate any session and/or
 * stored token on the backend. After logout, the user is taken to the same screen where he came from.
 *
 *
 * AUTOLOGIN
 * =========
 * Because the new MH-frontend needs to co-exist with the legacy-frontend (at least for some time), measures need to be taken
 * to keep user sessions in sync for the old and new backend. This means that the user can log in from any frontend and
 * will automatically be recognized by the other frontend. The same applies for logout.
 * Autologin detection is based on a cookie called `al` whose value is a token that can be used to retrieve a user from
 * the backend. After the user has been retrieved, a login is performed using passportio.js.
 * See the `./mhpassport` module for details.
 *
 * AUTOFOLLOW
 * ==========
 * Some functionality can be carried out automatically after a login, based on the request body, such as the
 * autofollow feature. When logged-out, clicking the `follow`-button should open the login modal and after
 * successful login automatically trigger the follow functionality, without having the user to manually click the button
 * again.
 * Currently the only functionality is the autofollow functionality, but other functionalities may follow.
 */

var express = require('express')
  , router = express.Router()
  , debug = require('debug')('mh-auth')
  , api = require('./api')
  , User = require('./models/user')
  , qs = require('query-string')
  , url = require('url')
  , passport = require('./mhpassport')

/**
 * Constants
 */
var TEN_YEARS_IN_MS = 315569260000;


module.exports = router;

/*
 Requests to AJAX-Routes are not authenticated for performance:
 - /jx/instasearch
 - /jx/search
 */
module.exports.EXCLUDED_ROUTES = /^(?!\/jx\/(insta)?search).*$/

/**
 * Perform autologin or initialize req.user
 */
router.all(module.exports.EXCLUDED_ROUTES, function(req, res, next){
  debug('Using auth')
  if (!req.user && req.cookies.al){
    debug('Autologin cookie detected, attempting to perform autologin: ', req.cookies.al)
    autologin(req, '', res, next)
  }
  else{
    //debug('no autologin, initializing default user')
    res.locals.user = req.user || new User({})
    next()
  }
})

/**
 * Perform login for user, triggering an automatic entity-follow if necessary
 */
router.all('/login', function(req, res, next){
  //debug('login called')
  passport.authenticate('local', function(err, user){
    if (err || !user || user.isInvalid() ) {
      debug('Authentication failed', err)

      if (req.accepts('json')) {
        return res.status(401).json({ error: getAuthErrorMessage(user)})
      } else {
        return res.redirect('/?login=fail')
      }
    }

    req.login(user, function(err) {
      if (err) {
        debug('login failed for user: ', user.id)
        return next(err)
      }

      debug('login success for user: ', user.id , 'attempt to write autologin token: ', user.phpAutologinToken)
      // al cookie should not expire together with the session - Set 10 years in the future expire Date
      res.cookie('al', user.phpAutologinToken, {domain: '.moneyhouse.ch', path: '/', secure: false, expires: new Date(Date.now() + TEN_YEARS_IN_MS) })

      // if autofollow property and entityType are set: check if user follows the entity
      if (req.body.autofollow && req.body.entityType){
        autoFollow(user, req, res, next)
      }
      else{
        finishLogin(req, res)
      }
    });
  })(req, res, next)
})

/**
 * Perform logout of user invalidating the token on the backend and redirecting the user
 */
router.all('/logout', function(req, res, next){
  debug('logout called')
  var token = req.user ? req.user.token : null
  forceLogout(req, res)
  var referrer = req.header('Referrer') || '/'
  var urlObj = url.parse(referrer)
  var query = qs.parse(urlObj.query || {})

  // delete any login oder reference query params and add logout=success param
  delete query.login, delete query.autologin, delete query.toggleMessage
  query.logout='success'

  // invalidate token on backend
  api.logout(token, '', function(err){
    if(err){
      return next(err)
    }
    // redirect to referrer preserving any existing query params
    var redirectUrl = urlObj.pathname + '?' + qs.stringify(query)
    return res.redirect(redirectUrl)
  })
})

/**
 * Handler for expired tokens
 * @param req request object
 * @param res response object
 */
module.exports.handleExpiredToken = function(req, res){
  forceLogout(req, res)
  return res.redirect(req.path)
}

/**
 * Create redirect URL for after login
 * @param opts Object containing
 *    status status of login
 *    autoredirect (optional) redirect url after the login
 *    autofollowError (optional) whether an error occurred in the autofollow process
 *    referrer (optional) referrer of the login
 *    autologin (optional) whether the login took place reading the autologin cookie
 * @return {string}
 */
module.exports.createLoginRedirectUrl = function(opts){
  var queryParams = {}
  var path = ''
  // prefer autoredirect over referrer
  var targetUrl = opts.autoredirect || opts.referrer
  if (targetUrl){
    if (targetUrl.indexOf('www.') > -1) {
      // Allow external redirects
      debug('external autoredirect detected:', targetUrl)
      return targetUrl
    }
    var urlObj = url.parse(targetUrl)
    path = urlObj.pathname
    if (urlObj.query){
      queryParams = qs.parse(urlObj.query)
    }
  }
  if (opts.autofollowError) {
    queryParams.autofollowError = opts.autofollowError
  }
  if (opts.autologin) {
    queryParams.autologin = opts.autologin
  }
  delete queryParams['logout']
  queryParams.login = opts.status
  return path + '?' + qs.stringify(queryParams)
}

/**
 *
 * @param request
 * @param response
 * @return {*}
 */
function finishLogin(request, response){
  debug('finishing login')
  var jsonResp = {
    status: 'ok',
    autoredirect: module.exports.createLoginRedirectUrl({
        status: 'success',
        autoredirect: request.body.autoredirect,
        autofollowError: request.body.autofollowError,
        referrer: request.body.referrer
      })
  }
  if (request.accepts('json')) {
    return response.status(200).json(jsonResp)
  } else {
    return response.redirect(jsonResp.autoredirect)
  }
}

/**
 * Log out user, clearing all sessions and cookies
 * @param req the request to use for the logout
 * @param res the response to use for the logout
 */
function forceLogout(req, res) {
  req.logout()
  req.session = null
  res.clearCookie('al', {domain: '.moneyhouse.ch', path: '/', secure: false })
}

/**
 * Function to perform an autologin based on a request cookie
 * Autologin will fail if the user associated with the autologin token is disabled or has an invalid token
 * @param req request with cookie to use for autologin
 * @param userIP user IP
 * @param res response object
 * @param next function to let the request go through the next middleware
 */
function autologin(req, userIP, res, next){
  api.getUserByAutologinToken(req.cookies.al, userIP, function(err, user){
    if (err || !user || user.isInvalid()) {
      autologinFail(res)
      return next()
    }
    // Perform login with redirect
    debug('Attempt to log in retrieved user:', user.id)
    req.login(user, function(err) {
      if (err) {
        debug('Login Error:', err)
        autologinFail(res)
        return next()
      }
      var redirectUrl = module.exports.createLoginRedirectUrl({referrer: req.url, autologin: true})
      debug('Autologin successful for user: ', user.id, ' Attempt to redirect to: ', redirectUrl)
      return res.redirect(redirectUrl)
    })
  })
}

/**
 * Perform autofollow of user for a given entity
 * @param user the user to follow the entity
 * @param req request object
 * @param res response object
 * @param next error handler
 */
function autoFollow(user, req, res, next){
  var entityId = req.body.autofollow
  var entityType = req.body.entityType
  // check if user already follows the entity
  api.follows(entityId, user, entityType, function(err, userFollows){
    if (err){
      debug('Error while checking user follow status!', err)
      next(err)
    }

    // user does not yet follow the entity: trigger the autofollow functionality
    if (!userFollows){
      // the follows API method uses another API Endpoint where the api path is 'company' instead of 'organisation'
      api.follow(entityId, user, entityType, function(err, response){
        debug('FOLLOW RESPONSE: ', err, response)
        if (err || response != 200){
          debug('Error while triggering autofollow!', err)
          req.body.autofollowError = true
          req.flash('info', err.message)
        }
        finishLogin(req, res)
      })
    }
    // user already follows the entity: redirect to login success
    else{
      finishLogin(req, res)
    }

  });
}

/**
 * Autologin callback for invalid tokens, remove cookie and let req go through to next middleware attaching an empty user to res
 * @param res
 * @return {*}
 */
function autologinFail(res) {
  debug('Autologin failed, clearing autologin cookie')
  res.clearCookie('al', {domain: '.moneyhouse.ch', path: '/', secure: false })
  res.locals.user = new User({})
}

/**
 * Get Auth Error message to be displayed in UI
 * @param user
 * @return {string}
 */
function getAuthErrorMessage(user) {
  if (user && user.isDisabled()) {
    return 'account_blocked'
  }
  return 'unauthorized'
}
