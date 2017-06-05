var test = require('tape')
  , spy = require('spy')
  , $mock = require('../../../utils/jquery-mock')

var tf = require('../../../../client/modules/table/table-functions')

/**
 * These objects must be mocked in order to make the test work
 */
history = {replaceState: spy()}
document = {title: 'someTitle'}
location = {pathname: '/company/path'}
personLocation = {pathname: '/person/path'}

test('generatePagination() should return if number of pages is smaller than 3', function (t) {
  var cb = spy();
  [undefined, null, 1, 2].forEach(function (pageParam) {
    var result = tf.generatePagination(pageParam, cb)
    t.equal(result, undefined, 'result should be undefined')
    t.false(cb.called, 'callback should not have been called')
  })
  t.end()
})

test('checkPagination() should work as expected', function (t) {
  var query = tf.checkPagination({}, 12)
  t.equal(query.page, '0', 'if location.search.page is not defined, query.page should be overwritten with default (0)')

  location.search = '?page=2'
  query = tf.checkPagination({}, 12)
  t.equal(query.page, '0', 'if location.search.page is greater than number of pages (calculated from number of results), query.page should have default value 0')
  query = tf.checkPagination({}, 2)
  t.equal(query.page, '0', 'if location.search.page is equal to number of pages (calculated from number of results), query.page should have default value 0')

  query = tf.checkPagination({}, 32)
  t.equal(query.page, '2', 'if location.search.page is smaller than number of pages (calculated from number of results), query.page should have value from location.search.page')

  location.search = '?page=abc'
  query = tf.checkPagination({}, 32)
  t.equal(query.page, '0', 'if location.search.page has non-numeric values, query.page should have default value 0')

  t.end()
})

test('validateCurrentPage() should work as expected', function (t) {
  var result = tf.validateCurrentPage()
  t.equal(result, 0, 'calling the function without values should result in the default value for the current page (0)')

  result = tf.validateCurrentPage('u', 2)
  t.equal(result, 0, 'calling the function with invalid string should result in the default value for the current page (0)')

  result = tf.validateCurrentPage(-1, 2)
  t.equal(result, 0, 'calling the function with invalid integer value should result in the default value for the current page (0)')

  result = tf.validateCurrentPage(1, 2)
  t.equal(result, 1, 'calling the function with a valid current page should not change the current page')

  result = tf.validateCurrentPage('1', '2')
  t.equal(result, 1, 'calling the function with string values should also work')

  history = {replaceState: spy()}
  location.search = '?page=2'
  result = tf.validateCurrentPage('2', '1')
  t.equal(result, 0, 'calling the function with an invalid value should return the default value (0)')
  t.true(history.replaceState.calledWith({page: undefined}, document.title, location.pathname + '?'), 'calling the function with an invalid value should reset the page param in location.search')
  t.end()
})

test('getPathParam() should work as expected', function(t) {
  var result = tf.getPathParam(location.pathname)
  t.equal(result, 'organisation', 'company url should return the correct api Path')

  result = tf.getPathParam(personLocation.pathname)
  t.equal(result, 'person', 'person url should return the correct api Path')

  result = tf.getPathParam(null)
  t.equal(result, undefined, 'invalid url should return a default value')

  t.end()
})

/**
 * getPageSize uses PAGESIZE 10 as default.
 */
test('test getPageSize', function(t){
 t.equal(tf.getPageSize(-99), 0, 'negative entries means 0 pages')
 t.equal(tf.getPageSize(-1), 0, 'negative entry means 0 pages')
 t.equal(tf.getPageSize(0), 0, '0 entries means 0 pages')
 t.equal(tf.getPageSize(1), 1, '1 entries means 1 pages')
 t.equal(tf.getPageSize(10), 1, '10 entries means 1 page')
 t.equal(tf.getPageSize(11), 2, '11 entries means 2 pages')
 t.equal(tf.getPageSize(20), 2, '20 entries means 2 pages')
 t.equal(tf.getPageSize(21), 3, '21 entries means 3 pages')
 t.equal(tf.getPageSize(155, 50), 4, '155 entries means 3 pages having page size 50')
 t.end()
 })
