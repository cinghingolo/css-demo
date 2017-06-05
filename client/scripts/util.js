var _ = require('lodash')
  , qs = require('query-string')

/**
 * Remove query params from a query.
 * @param query the query to delete params from
 * @param params Array, list to params to be deleted. If empty, all params will be deleted
 * @returns {*}, query object with deleted keys
 */
module.exports.clearQueryParams = clearQueryParams = function(query, params) {
  Object.keys(query).forEach(function(param){
    if (!params || params && params.length && params.indexOf(param) > -1){
      delete query[param]
    }
  })
  return query
}

/**
 * Reset query by removing login/logout query params and remove unwanted tailing/trailing whitespaces from strings
 * This includes also updating the history!
 * @param q the query to reset
 */
module.exports.updateQueryParams = function(q){
  q = clearQueryParams(q, ['login', 'logout'])
  Object.keys(q).forEach(function(param){
    q[param] = (q[param] && typeof q[param] == "string") ? q[param].trim() : q[param];
  })
  updateHistory(q)
}

/**
 * update browser history with current URL and append query string if neccessary
 */
module.exports.updateHistory = updateHistory = function(q){
  history.replaceState(q, document.title, location.pathname + (_.isEmpty(q) ? '' : '?' + qs.stringify(q)));
}

/**
 * Validate company status parameter
 * @param companyStatus string, company status
 * @returns {boolean}
 */
module.exports.isValidCompanyStatus = function(companyStatus){
  return [0, 1, 3, 5].indexOf(parseInt(companyStatus)) > -1
}

/**
 * Validate person mandate status parameter
 * @param mandateStatus string, person mandate status
 * @returns {boolean}
 */
module.exports.isValidMandateStatus = function(mandateStatus){
  return ['all', 'true', 'false'].indexOf(mandateStatus) > -1
}

/**
 * Validate company name history parameter
 * @param histor string, company name history
 * @returns {boolean}
 */
module.exports.isValidHistory = function(history){
  return ['true', 'false'].indexOf(history) > -1
}

/**
 * Validate canton parameter
 * @param canton string|array, canton/s to validate
 * @returns {boolean}
 */
module.exports.isValidCanton = function(cantonParam){
  var CANTONS = [
    'AG', 'AI', 'AR', 'BL', 'BS', 'BE', 'FR', 'GE', 'GL',
    'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SH', 'SZ', 'SO',
    'SG', 'TI', 'TG', 'UR', 'VD', 'VS', 'ZG', 'ZH'];

  if (Array.isArray(cantonParam)) {
    return cantonParam.every(function(canton){
      return CANTONS.indexOf(canton) > -1
    })
  }
  return CANTONS.indexOf(cantonParam) > -1
}
