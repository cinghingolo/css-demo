var express = require('express')
  , debug = require('debug')('mh-ajax')
  , router = express.Router()
  , api = require('../api')
  , response = require('../response')
  , filters = require('../filters')
/**
 * Get entity relations data
 */
router.get('/:entity/:id/relations', function(req, res, next){
  debug('AJAX: entity relations', req.params.entity, req.params.id, req.query)

  // nameFrom information is required in partial templates and may not be available in case of subsequent ajax requests
  //res.locals.nameFrom = req.params.entity == 'organisation' ? 'recipient' : 'issuer'
  res.locals.nameform = 'issuer'; //DEMO

  req.query = req.query || {}
  req.query.function = req.query.function || 'MANDATES'

  // only active relations for companies can be fetched for non-registered users. In all other cases (e.g. for mandates) users need to be logged in
  if (req.user) {
    api.getRelationGroups(req.params.id, req.query, req.user, onRelationsReceived(req, res, next))
  }
  else {
    debug('user is not logged in')
    return onRelationsReceived(req, res, next)(null, [])
  }
})


/***
 * Response handler for API request to return company/person relations
 * @param err
 * @param relations
 */
var onRelationsReceived = function(req, res, next){
  return function(err, relations){
    if (err) {
      debug('error calling api.getRelationGroups(): ' + err)
      return next(err)
    }
    //debug('got ' + relations.length + ' ' + req.params.entity + ' relations: ' + JSON.stringify(relations))

    // This information must be available in the partial template
    var nameFrom = (res.locals && res.locals.nameFrom) ? res.locals.nameFrom : null

    //debug('render partial template - entity-table-partial with locale:', res.locals.getLocale())

    return response.byType(req, {
      'json': response.partial(req, res, next, 'entity-table-partial', {data: relations.source ? relations.source : [], nameFrom: nameFrom, showContent: getShowContent(req)})
    })
  }
}

/**
 * Get entity relations filters
 */
router.get('/:entityType/:id/relations/filters', function(req, res, next){
  debug('AJAX: entity relations filters', req.params.id, req.query)

  req.query = req.query || {}
  req.query.function = 'MANDATES';

  api.getRelationGroups(req.params.id, req.query, req.user, function(err, relationResponse){
    if (err){
      debug('error calling api.getRelationStatistics(): ' + err)
      return next(err)
    }

    var filterParams = filters.createTablePositionFilters(relationResponse.metaInfo.metaData.relationStatistics, req.query)

    //debug('render partial template - entity-filter-position-partial with locale:', res.locals.getLocale())

    return response.byType(req, {
      'json': response.partial(req, res, next, 'entity-filters-partial', {
        data: filterParams
      })
    })
  }, req.user)
})

/**
 * Get Instant Search Suggestions
 */
router.get('/instasearch', function(req, res, next){
  debug('Instant search for ', req.query)

  req.query = req.query || {}

  api.searchInstant(req.query, req.user, function(err, results){
    if (err){
      debug('error calling api.search():', err)
      return next(err)
    }

    return res.status(200).json(results)
  })
});


/**
 * Determine if the result can be displayed to the users depending on request
 * @param req
 * @returns {boolean}
 */
function getShowContent(req) {
  var showOnlyActive = !!(req.query.activeOnly != 'false' || req.query.activeOnly == 'false' && req.user && !req.user.isGuest())
  var showOnlyToRegUsers = !!(req.user && !req.user.isGuest())

  if (req.originalUrl.indexOf('/person/') > -1 ){
    // show paywall for unregistered users on company detail page (auditored companies)
    if (req.query.function == 'AUDITORS') {
      return showOnlyActive
    } else {
      // show paywall for unregistered users on person mandates page
      return showOnlyToRegUsers
    }
  }
  else if (req.originalUrl.indexOf('/company/') > -1){
    // show paywall for unregistered users on person mandates page when selecting activeOnly==false
    return showOnlyActive
  }
  // Default
  return true;
}

module.exports = router;
