var test = require('tape')
  , filters = require('../../server/filters')
  , _ = require('lodash')

test('test createTableStatusFilters()', function(t){
  var query = {activeOnly: 'true'}
  var tableFiltersRaw = createFilterParams()
    .withTotal(25)
    .withActiveTotal(15)
    .build()

  var result = filters.createTableStatusFilters(tableFiltersRaw, query)
  t.true(result.activeOnly, 'filter params should be set to filter by active only')
  t.equal(result.activeResults, tableFiltersRaw.activeTotal, 'raw (unpaged) number of active items should be taken over')
  t.equal(result.totalResults, tableFiltersRaw.total, 'raw (unpaged) number of active items should be taken over')

  // test with query.activeOnly set to 'false'
  query.activeOnly = 'false'
  result = filters.createTableStatusFilters(tableFiltersRaw, query)
  t.false(result.activeOnly, 'filter params should be set not to filter by active only')

  t.end()
})

test('test createTablePositionsFilters()', function(t){
  var query = {signature: 'someSignature'}
  var tableFiltersRaw = createFilterParams()
    .withContracts('ContractCode_1', 1)
    .build()

  var result = filters.createTablePositionFilters(tableFiltersRaw, query)
  t.equal(result.selectedPosition, query.signature, 'signature should be used as currently selected position if set in query')

  // test with query.signature unset and query.board set
  query = {board: 'someBoard'}
  result = filters.createTablePositionFilters(tableFiltersRaw, query)
  t.equal(result.selectedPosition, query.board, 'board should be used if signature not set in query')

  t.end()
})

test('getRelationGroups() should cope with erroneous data', function(t){
  /**
   * Test with 'person'
   */
  var relationGroups = [
    // no issuer
    {issuer: undefined, recipient: {}, roles: [],relationType: 'RelationType_0'},
  ]
  var result = filters.getRelationGroups(relationGroups, 'person')
  t.equal(relationGroups.length, result.length, 'number of processed relationGroups should not change')
  t.equal(relationGroups[0].issuer, undefined, 'if no issuer was present in input, there should also be no issuer in output')

  /**
   * Test with 'company'
   */
  relationGroups = [
    // no recipient
    {issuer: {}, recipient: undefined, roles: [], relationType: 'RelationType_1'},
    // no relationType
    {issuer: {}, recipient: {uri: 'someUri'}, roles: [], relationType: undefined}
  ]
  result = filters.getRelationGroups(relationGroups, 'company')
  t.equal(relationGroups.length, result.length, 'number of processed relationGroups should not change')
  t.equal(relationGroups[0].recipient, undefined, 'if no issuer was present in input, there should also be no issuer in output')
  t.equal(relationGroups[1].recipient.href, undefined, 'if no relationType was present in input, there should also be no href set')


  /**
   * No roles
   */
  relationGroups = [
    // no recipient
    {issuer: {}, recipient: undefined, roles: undefined, relationType: 'RelationType_1'},
  ]
  result = filters.getRelationGroups(relationGroups, 'company')
  t.equal(relationGroups.length, result.length, 'number of processed relationGroups should not change')
  t.end()
})


/**
 * Sample structure
 * {
  "activeTotal": 738,
  "total": 1247,
  "activeBoards": {
    "BoardCode_1021": 2,
    "NO_BOARD": 736
  },
  "activeSignatories": {
    "NO_SIGNATURE": 2,
    "SignatoryType_10": 264,
    "SignatoryType_1": 472
  },
  "boards": {
    "BoardCode_1021": 4,
    "NO_BOARD": 1241,
    "BoardCode_1015": 2
  },
  "signatories": {
    "SignatoryType_10": 529,
    "SignatoryType_1": 916
  }
}
 * @returns {{}}
 */
var createFilterParams = function(){
  var builder = {}
  var filterParams = {}

  builder.withTotal = function(total){
    filterParams.total = total
    return builder
  }
  builder.withActiveTotal = function(activeTotal){
    filterParams.activeTotal = activeTotal
    return builder
  }
  builder.withContracts = function(contractName, contractCount){
    filterParams.contracts = filterParams.contracts || {}
    filterParams.contracts[contractName] = contractCount
    return builder
  }
  builder.build = function(){
    return filterParams
  }
  return builder
}

