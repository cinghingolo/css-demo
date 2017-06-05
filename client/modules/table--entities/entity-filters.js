var $ = require('jquery')
  , qs = require('query-string')
  , debug = require('debug')('mh-client-entity-filters')
  , util = require('../../scripts/util')
  , tableFunctions = require('../table/table-functions')

var entityId
var userId
var locale

/****************************************
 * Register Event handlers
 ****************************************/
$(function(){
  // avoid concurrency problems with other self-evaluating functions in other scripts
  if (location.href.indexOf('/companies') < 0) {
    return
  }

  entityId = $('.filters').data('entityid');
  userId = $('.filters').data('userid');
  locale= $('html').attr('lang')

  $('.js-mandate-status-filter').on('change', onMandateStatusFilterChanged)
  $('.js-mandate-position-filter').on('change', onMandatePositionsFilterChanged)
  $('.js-show-functions').on('click', onShowFunctionClicked)
  $('.js-pagination').on('query-change', onPaginationQueryChanged);

  /**
   * Reset query & reload page in case user entered invalid attributes
   */
  var q = qs.parse(location.search)
  var pageAttr = q.page
  q = tableFunctions.checkPagination(q, getNumberOfMandates())
  if (q.page != pageAttr){
    location.search = qs.stringify(q);
  }

  /**
   * Automatically create pagination on page load
   */
  generateMandatesPagination()
})

/**
 * Click handler for changes to the 'activeOnly' filter (radio input)
 */
var onMandateStatusFilterChanged = function(e){
  //console.log('onCurrentFilterChanged')
  var $radioInput = $(e.target)
    , q = qs.parse(location.search)

  // set queryParam to selected value
  var activeOnly = $radioInput.val() == 'activeOnly'
  q['activeOnly'] = activeOnly
  // clear dropdown filter parameters if active clicked (as there may be no result available with current board/signature)
  if (activeOnly === true) {
    q = util.clearQueryParams(q, ['board', 'signature'])
  }
  util.updateQueryParams(q)
  // reload filter params
  updateTableFilter(q)

  // don't load 'all'-data for unregistered users!
  if (!userId && !activeOnly){
    $('.entity-table').hide()
    $('.js-pagination').hide()
    return;
  }

  // Reset all other params when setting active results filter
  q = tableFunctions.checkPagination(q, getNumberOfMandates())
  updateMandatesTable(q);
}

/**
 * Filter on position selected
 */
var onMandatePositionsFilterChanged = function(e) {
  //console.log('onPositionsFilterChanged')
  var q = qs.parse(location.search)

  var type = $('.js-position-filter option:selected').data('type')
  var value = $('.js-position-filter').val()

  if (type == 'clear') {
    q = util.clearQueryParams(q, ['signature', 'board'])
  } else {
    q = setQueryParameter(q, type, value)
  }

  q = tableFunctions.checkPagination(q, getNumberOfMandates())

  util.updateQueryParams(q)
  updateMandatesTable(q);
}

/**
 * Show more functions
 */
var onShowFunctionClicked = function(e){
  // traverse jQuery-tree to select all cells within the same row
  $(this).parent().parent().parent().children().children().removeClass('showMore')
  $(this).hide()
}

/**
 * recreate pagination when page changes
 */
var onPaginationQueryChanged = function(e){
  generateMandatesPagination()
}

/****************************************
 * UI logic
 ****************************************/
/**
 * update table by sending AJAX request
 * @param query
 */
var updateMandatesTable = function(query){
  var $table = $('.entity-table')

  $table
    .css('height', $table.height())
    .empty()
    .append('<td class="loading"></td>');

  var pathParam = tableFunctions.getPathParam(location.href)
  // Set query function for audited companies in company detail page
  if (pathParam == 'person' && location.href.indexOf('/company') > -1){
    query.function = 'AUDITORS'
  }

  $.getJSON('/' + locale + '/jx/' + pathParam + '/' + entityId + '/relations', query)
    .done(function(entities){
      if (entities.rendered){
        $table.replaceWith(entities.rendered)
          .css('height', 'auto')
      }

      generateMandatesPagination()
      //Attach events to eventually new rendered items in the table
      $('.js-show-functions').on('click', onShowFunctionClicked)

      debug('update table done', entities)
    })
    .fail(function(){
      debug('update table fail', this, arguments)
      location.reload(true) // Force a reload
    })
}

/**
 * Update selection of filters by sending AJAX request
 * @param query
 */
var updateTableFilter = function(query){
  var pathParam = tableFunctions.getPathParam(location.href)

  // There are no filters to be updated on the company detail page!!
  if (pathParam == 'person' && location.href.indexOf('/company') > -1){
    return;
  }

  var $positionFilter = $('.js-mandate-position-filter')

  debug('Update Table Filter', query)

  $positionFilter
    .css('height', $positionFilter.height())
    .empty()
    .append('<td class="loading"></td>');


  $.getJSON('/' + locale + '/jx/' + pathParam + '/' + entityId + '/relations/filters', query)
    .done(function(filterParams){
      if (filterParams.rendered){
        $positionFilter.replaceWith(filterParams.rendered)
          .css('height', 'auto')

        // replaceWith will remove all event handlers...
        $('.js-mandate-position-filter').on('change', onMandatePositionsFilterChanged)
      }

      // only generate pagination if user is logged in and can see the results
      if (userId) {
        generateMandatesPagination()
      }
      debug('update table filter done', filterParams)
    })
    .fail(function(){
      debug('update table filter fail', this, arguments)
      location.reload(true) // Force a reload
    })
}


/**
 * Set the query parameters depending on type and value
 * Signature and board parameters are exclusive: they CAN'T both be set
 * @param query
 * @returns query
 */
var setQueryParameter = function(query, type, value) {
  if (type == 'signature') {
    delete query['board']
  }
  if (type == 'board') {
    delete query['signature']
  }
  //console.log('Attempt to add ', type, ' parameter with value ', value, ' to query')
  query[type] = value;
  return query
}

var getNumberOfMandates = function() {
  var count = $('.js-mandate-position-filter option:selected').data('count')
  if (count == undefined) {
    var activeOnly = qs.parse(location.search).activeOnly || 'true'
    //console.log('activeOnly ' + activeOnly)
    count = (activeOnly == 'true') ? parseInt($('.js-pagination').data('active-results')) : parseInt($('.js-pagination').data('total-results'))
  }
  return count
}

var generateMandatesPagination = function(){
  debug('generating pagination from entity-filters.js')
  // If the API gives back no results, the pagination must not be generated, and it must be removed if previously generated
  var $pagination = $('.js-pagination');
  if ($('.entity-table').children('.person').length == 0) {
    $pagination.children('.button').remove();
    $pagination.hide()
    return;
  }
  tableFunctions.generatePagination(getNumberOfMandates(), null, updateMandatesTable)
}
