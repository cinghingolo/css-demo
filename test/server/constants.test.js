var test = require('tape')
  , debug = require('debug')('mh-test-constants')
  , moment = require('moment')
  , constants = require('../../server/constants')
  , url = require('url')
  , testHelpers = require('../testHelpers')

moment.locale('de')
var locals = {}


test('capitalize() and toLowerCase() should work correctly', function(t){
  constants(locals)
  t.equal(locals.capitalize(null), null, 'capitalize should work with incorrect input')
  t.equal(locals.capitalize(''), '', 'capitalize should work with incorrect input ')
  t.equal(locals.capitalize('test'), 'Test', 'string are correct capitalized')
  t.equal(locals.lowerCaseFirst(null), null, 'lowerCaseFirst should work with incorrect input')
  t.equal(locals.lowerCaseFirst(''), '', 'lowerCaseFirst should work with incorrect input ')
  t.equal(locals.lowerCaseFirst('Test'), 'test', 'first string character is correctly set to lower case')
  t.end()
})

