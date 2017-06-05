var _ = require('lodash')
  , debug = require('debug')('mh-response');

module.exports = {}


module.exports.byType = function(req, responses, next){
  var acceptTypes = Object.keys(responses)

  if (acceptTypes.indexOf('default') > -1){
    acceptTypes[acceptTypes.indexOf('default')] = 'html'
  }

  var accept = req.accepts.apply(req, acceptTypes)
    , handler = responses.default || next

  Object.keys(responses).forEach(function(type){
    if (accept == type) {
      handler = responses[type]
    }
  })

  if (handler) {
    return handler()
  }
  else {
    throw "No handler defined for " + accept
  }
}


module.exports.partial = function(req, res, next, name, params){
  return function(){

    //debug('Return partial template :', '../partials/', name, 'Query: ', JSON.stringify(req.query));
    req.app.render('../partials/' + name, _.extend({}, res.locals, params), function(err, partial) {
      if (err) {
        return next(err);
      }

      res.status(200).json({
        data: params,
        rendered: partial
      })
    })
  }
}
