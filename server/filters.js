var debug = require('debug')('mh-filters')
  , moment = require('moment')
  , _ = require('lodash')

/**
 *
 * @param rawData Object API Response to be elaborated
 * @param query
 * @returns {{}} params Object
 */
module.exports.createTableStatusFilters = function(rawData, query) {
  //debug('creating status filter params from raw data: ' + JSON.stringify(rawData))
  var params = {}
  params.activeOnly = query.activeOnly != 'false'
  params.activeResults = rawData.activeTotal
  params.totalResults = rawData.total

  //Force '-2' to prevent conflicts
  if (query.signature == -1) {
    params.position = '-2'
  }

  //debug('created status filter params: ' + JSON.stringify(params))
  return params;
}

/**
 * Create filter params for positions (mandates/management)
 * @param rawData
 * @param query
 */
module.exports.createTablePositionFilters = function(rawData, query){
  //debug('creating position filter params from raw data: ' + JSON.stringify(rawData))
  var activeOnly = query.activeOnly != 'false'

  var params = {}
  params.positions = createDropdown(rawData, activeOnly)
  params.selectedPosition = query.signature || query.board

  //debug('created position filter params: ' + JSON.stringify(params))
  return params
}

/**
 * @param relationGroups array API answer to be elaborated
 * @param isMandateRelationGroup boolean, whether the response contains mandateRelationGroups. In this case we need to
 *        display the issuer rather than the recipient Objects
 * @returns (relationGroups|[{*}]) with additional information to be displayed to the end user
 */
module.exports.getRelationGroups = function getRelationGroups(relationGroups, entityName) {

  if (!relationGroups || Object.keys(relationGroups).length == 0) {
    return relationGroups
  }

  // set href property for each relation depending on its type
  relationGroups.forEach(function(relationGroup) {

    // for person relations (e.g. mandates) set the 'href'-attribute on the issuer (company)
    if (entityName == 'person' && relationGroup.issuer) {
      relationGroup.issuer.href = '/company/' + relationGroup.issuer.uri
    }
    // for company relations (e.g. management) set the 'href'-attribute on the recipient (person)
    else if (relationGroup.recipient && relationGroup.relationType){
      relationGroup.recipient.href = (relationGroup.relationType.key == 'RelationType_0' ? '/person/' : '/company/') + relationGroup.recipient.uri
    }
  })

  return relationGroups
}


/**
 *
 * @param filters Object API answer to be elaborated
 * @param onlyActive Boolean
 * @returns Object filterDropDown with additional information needed to display the dropdown filter
 */
var createDropdown = module.exports.createDropdown = function createDropdown(filters, onlyActive) {
  return {};
}
