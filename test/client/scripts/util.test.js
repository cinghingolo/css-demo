var test = require('tape')
  , spy = require('spy')
  , util = require('../../../client/scripts/util')

/**
 * These objects must be mocked in order to make the test work
 */
location = {pathname: '/some/path'}
history = {replaceState: spy()}
document = {title: 'someTitle'}

test('clearQueryParams() should work as expected', function (t) {
  t.looseEqual(util.clearQueryParams({foo: 'foo', bar: 'bar'}), {}, 'should work without second parameter')
  t.looseEqual(util.clearQueryParams({foo: 'foo', bar: 'bar', baz: 'baz'}, ['foo', 'bar']), {baz: 'baz'}, 'should only delete parameters from array')
  t.end()
})

test('updateQueryParams() should work as expected', function (t) {
  util.updateQueryParams({login: 'success', logout: 'success', foo: 'foo', bar: 'bar'})
  t.true(history.replaceState.called, 'updating the query param should replace the history state')
  t.true(history.replaceState.calledWith({foo: 'foo', bar: 'bar'}, document.title, location.pathname + '?bar=bar&foo=foo'), 'replacing the history state should not include login/logout query-param')
  t.end()
})

test('updateHistory() should work as expected', function(t){
  history = {replaceState: spy()}
  util.updateHistory({})
  t.true(history.replaceState.called, 'history.replaceState() should be called')
  t.true(history.replaceState.calledWith({}, document.title, location.pathname), 'when called with empty object, the history should not include a query string')

  history = {replaceState: spy()}
  util.updateHistory({foo: 'foo', bar: 'bar'})
  t.true(history.replaceState.called, 'history.replaceState() should be called')
  t.true(history.replaceState.calledWith({foo: 'foo', bar: 'bar'}, document.title, location.pathname + '?bar=bar&foo=foo'), 'when called with object, the history should include a query string')
  t.end()
})
