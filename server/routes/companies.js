var express = require('express')
  , router = express.Router()
  , api = require('../api')
  , debug = require('debug')('mh-routes-companies')
  , filters = require('../filters')

router.get('/:id*', function(req, res, next) {
  res.locals.entityId = req.params.id
  res.locals.cityName = req.params.id;
  res.locals.pageCategory = 'company'
  res.locals.companyUri = '/company/' + req.params.id;
  // currently logged in user
  res.locals.userId = res.locals.user?res.locals.user.id:undefined
  // relation names are taken from relation ISSUER
  res.locals.nameFrom = 'issuer'
  // show paywall for non-registered users when querying all relations
  res.locals.showPaywall = !req.user || req.user.isGuest()

  req.query = req.query || {}
  req.query.function = 'MANDATES'

  api.getRelationGroups(req.params.id, req.query, req.user, function(err, results){
    if (err){
      debug('error rendering company list: ' + err)
      return next(err)
    }
    var companies = results.source
    var filterParamsRaw = results.metaInfo.metaData.relationStatistics

    var statusFilterParams = filters.createTableStatusFilters(filterParamsRaw, req.query)

    debug('companies: ' + JSON.stringify(companies))
//  debug('statusFilterParams:' + JSON.stringify(statusFilterParams))

    res.render('company-list', {
      activeResults: statusFilterParams.activeResults,
      totalResults: statusFilterParams.totalResults,
      activePages: statusFilterParams.activePages,
      totalPages: statusFilterParams.totalPages,
      activeOnly: statusFilterParams.activeOnly,
      companies: companies
    })
  })
});

module.exports = router;
