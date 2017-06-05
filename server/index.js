var express = require('express')
  , moment = require('moment')
  , path = require('path')
  , cookieParser = require('cookie-parser')
  , flash = require('connect-flash')
  , app = express()
  , cluster = require('cluster')
  , config = require('../config/config')
  , i18n = require('./i18n')
  , staticroutes = require('./routes/static')
  , companyroutes = require('./routes/companies')
  , ajaxRoutes = require('./routes/ajax')
  , constants = require('./constants')
  , debug = require('debug')('mh-server')
  , auth = require('./auth')
  , passport = require('./mhpassport')
  , url = require('url')
  , qs = require('querystring')
  , assets = require('./routes/assets')
  , User = require('./models/user')


//Let Express generate pretty HTML
app.locals.pretty = true;

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '../client/pages'))

app.set('x-powered-by', false)


// use cookieParser to expose cookies to req.cookies
app.use(cookieParser(config.appSecret));
app.use(require('body-parser').json())
app.use(require('cookie-session')({
  secret: config.appSecret
}))
app.use(flash())

// Add browser config
app.use(function(req, res, next) {
  moment.locale('de');
  res.locals = Object.assign(res.locals, config.browser)
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.locals.urlObj = url.parse(fullUrl)
  if (req.header('Referer')){
    res.locals.referrer = qs.escape(req.header('Referer'))
  }
  res.locals.mainJs = require('./webpack-assets.json').main.js
  res.locals.stylesCSS = require('./rev-manifest.json')['styles.css']

  constants(res.locals)
  res.locals.moment = moment
  res.locals.flashMessages = req.flash()
  next()
})

// i18n init parses req for language headers, cookies, etc.
app.use(i18n)

/**
 * Route non-localized URLs that can be localized to their localized versions
 * - \/(companies) matches /companies
 * - (\/?.*)? greedily matches the rest (if present)
 */
app.all(/^\/(companies)(\/?.*)?/, function(req, res, next){
  if (req.url == req.originalUrl) {
    var newUrl = '/' + res.getLocale() + req.url
    debug('localized redirect: ' + req.url + ' ==> ' + newUrl)
    return res.redirect(301, newUrl)
  }
  return next()
})

// APP static assets
app.all(/^\/(js|assets|css|favicon.ico)(\/?.*)?/, assets)

app.use(auth.EXCLUDED_ROUTES, passport.initialize());
app.use(auth.EXCLUDED_ROUTES, passport.session());
app.use(auth)

//Using routes
app.use('/companies/', companyroutes);
app.use('/jx/', ajaxRoutes)
app.use('/', staticroutes);

app.use(function(req, res, next){
  var err = new Error('Not Found')
  debug('404: ', req.url)
  err.statusCode = 404
  next(err);
})

//Using Error Handler
app.use(function(err, req, res, next) {
  //delegate to the default error handling mechanisms in Express, when the headers have already been sent to the client
  if (res.headersSent) {
    return next(err);
  }
  debug('Error:', req.url, err.message)
  if (err.status == 401 || err.statusCode == 401){
    return auth.handleExpiredToken(req, res);
  }

  if (err.statusCode == 404 || err.statusCode == 400 || (err.message && err.message.indexOf('Failed to lookup view') > -1)) {
    return res.status(404).render('error', {error: err});
  }

  res.locals.user = req.user || new User({})
  console.log("Unhandled Error: ", err.message, err.stack);
  res.status(500).render('error', {error: err});
})

app.use(function(req, res, next) {
  res.status(404).render('error', {message: 'Sorry cant find that!'});
})

module.exports = app

if (!module.parent) {
  // only if run directly

  if (cluster.isMaster) {
    // Code to run if we're in the master process
    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
      cluster.fork();
    }

    cluster.on('listening', function(worker, address) {
      //debug('Worker id: %d listening at: %s', worker.id, JSON.stringify(address));
    });

    Object.keys(cluster.workers).forEach(function (id) {
      debug('Worker %d with pid: %d', id, cluster.workers[id].process.pid);
    });

    cluster.on('exit', function(worker, code, signal) {
      debug('Worker %d died: Respawning...', worker.process.pid);
      cluster.fork();
    });
    debug('Application running and listening on port %d', config.port);
    debug(config)

  } else {
    // Code to run if we're in a worker process
    app.listen(config.port);
    debug('Worker %d running!', cluster.worker.id);
  }
}
