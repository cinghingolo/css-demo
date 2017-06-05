var express = require('express')
  , router = express.Router()
  , debug = require('debug')('mh-routes-static')
  , fs = require('fs')

router.get('/', function(req, res){
  debug('render index page')
  res.render('index')
});

// UI version
router.get('/version', function(req, res){
  fs.readFile('.version', function(err, v){
    debug('Version = ' + v)
    res.type('text/plain')
    res.send(v)
  })
})

module.exports = router;
