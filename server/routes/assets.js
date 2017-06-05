var express = require('express')
  , debug = require('debug')('mh-assets')
  , app = express()
  , path = require('path')
  , config = require('../../config/config')
  , compression = require('compression')
  , proxy = require('express-http-proxy')

var ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60 /* 1 year  */

// CMS Assets
app.get('/dam/*', proxy(config.api.cms))
app.get('/.resources/*', proxy(config.api.cms))

// this must come before app.use(express.static(path.join(__dirname, '../build')))
app.use(compression())

// Serve static main.min.js and styles.min.css requests with the corresponding versioned files
// The current versioned file names are stored in the res.locals.mainJs and res.locals.stylesCss
// The static file names will be used in the public API
app.use('/js/main.min.js', function (req, res) {
  res.set('Cache-Control', 'public, max-age=' + ONE_YEAR_IN_SECONDS)
  res.sendFile(path.join(__dirname, '../../build/js', res.locals.mainJs))
})

app.use('/css/styles.min.css', function (req, res) {
  res.set('Cache-Control', 'public, max-age=' + ONE_YEAR_IN_SECONDS)
  res.sendFile(path.join(__dirname, '../../build/css', res.locals.stylesCSS))
})

app.use('/js', express.static(path.join(__dirname, '../../build/js'), {
    lastModified: false,
    setHeaders: maxAge(ONE_YEAR_IN_SECONDS)
  })
)

app.use('/assets', express.static(path.join(__dirname, '../../build/assets'), {
    lastModified: false,
    setHeaders: maxAge(8*24*60*60) /* 8 days */
  })
)

app.use('/css',  express.static(path.join(__dirname, '../../build/css'), {
    lastModified: false,
    setHeaders: maxAge(ONE_YEAR_IN_SECONDS)
  })
)

app.get('/favicon.ico', function(req, res) {
  res.redirect('/assets/favicons/favicon.ico')
})

function maxAge(seconds){
  return function(res){
    res.set('Cache-Control', 'public, max-age=' + seconds)
  }
}

module.exports = app
