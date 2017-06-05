var $ = require('jquery')
  , qs = require('query-string')
  , debug = require('debug')('mh-client-table-functions')
  , _ = require('lodash')
  , util = require('../../scripts/util')

/**
 * Number of pagination links
 */
var NUM_LINKS = 5
var NUM_LINKS_MOBILE = 3

/**
 * Page Size
 */
var PAGESIZE = 10;

/**
 * Generate pagination
 * @param totalResults number of results in total
 * @param pageSize optional, custom pageSize to be used. Defaults to [PAGESIZE]
 * @param cb Callback to perform some work after a pagination link has been clicked
 */
var generatePagination = function(totalResults, pageSize, cb){
  var totalPages = getPageSize(totalResults, pageSize)
  var query = qs.parse(location.search);
  var currentPage = validateCurrentPage(query.page, totalPages)
  //console.log('generating pagination with totalPages=' + totalPages + ', currentPage=' + currentPage)

  var $pagination = $('.js-pagination');

  // don't create pagination if not necessary
  if (!totalPages || totalPages < 2) {
    //console.log('no or not enough total pages')
    $pagination.hide()
    return
  }

  $pagination.show();
  $pagination.empty()

  // pagination starts at 0 or somewhere in the middle
  var lowerBound = Math.min(totalPages-NUM_LINKS, Math.max(0, Math.ceil(currentPage-NUM_LINKS/2)))
  // ok this is a bit hard to read, but what it says is "use currentPage+NUM_LINKS/2 links for pagination, but at least NUM_LINKS (for pages 1, 2 and 3)
  var upperBound = Math.max(NUM_LINKS, Math.min(totalPages, Math.ceil(currentPage+NUM_LINKS/2)))

  var lowerBoundMobile = Math.min(totalPages-NUM_LINKS_MOBILE, Math.max(0, Math.ceil(currentPage-NUM_LINKS_MOBILE/2)))
  var upperBoundMobile = Math.max(NUM_LINKS_MOBILE, Math.min(totalPages, Math.ceil(currentPage+NUM_LINKS_MOBILE/2)))

  // Fix upperBounds and lowerBounds
  lowerBound = Math.max(lowerBound, 0)
  lowerBoundMobile = Math.max(lowerBoundMobile, 0)
  upperBound = Math.min(upperBound, totalPages)
  upperBoundMobile = Math.min(upperBoundMobile, totalPages)

  if (totalPages > 5) {
    $pagination.append(createFirstPageLink(currentPage, cb))
    $pagination.append(createPrevPageLink(currentPage - 1, currentPage, cb))
  }

  //console.log('pagination: currentPage='+currentPage + ', totalPages=' + totalPages + ', lowerBound=' + lowerBound + ', upperBound=' + upperBound + ', lowerBoundMobile=' + lowerBoundMobile + ', upperBoundMobile=' + upperBoundMobile)
  for (var page = lowerBound; page<upperBound; page++){
    addPaginationLink($pagination, page, currentPage, lowerBoundMobile, upperBoundMobile, cb)
  }

  if (totalPages > 5) {
    $pagination.append(createNextPageLink(currentPage+1, totalPages, cb))
    $pagination.append(createLastPageLink(currentPage, totalPages, cb))
  }
}

/**
 * Unset invalid offset on current view change and set 0 as current offset
 * @param currentPage
 * @param totalPages
 * @returns {*}
 */
var validateCurrentPage = function(currentPage, totalPages){
  if (!currentPage) {
    return 0;
  }

  if (isNaN(currentPage) || currentPage < 0 || currentPage >= totalPages) {
    var q = qs.parse(location.search)
    q['page'] = undefined
    util.updateQueryParams(q)
    return 0
  }
  return parseInt(currentPage)
}

/**
 * The check may reset the pagination, when changing the filter, the current page param is inconsistent with the total results count
 * @param query
 * @param count total results
 */
var checkPagination = function(query, count) {

  pageSize = getPageSize(count)
  var q = qs.parse(location.search)
  var page = q.page || 0
  page = parseInt(page) || 0

  if (page >= pageSize) {
    query.page = '0'
  }
  else {
    query.page = ''+page
  }
  return query
}

/**
 *
 * @param count
 * @param size optional
 * @returns {number} the pageSize of the current filter
 */
var getPageSize = function(count, size) {
  var pageSize = size || PAGESIZE
  return Math.max(0, Math.ceil(count / pageSize))
}

/**
 * Pagination link callback
 * @param e event Object
 * @param cb click callback
 */
var paginationLinkClicked = function(e, cb) {
  var $target = $(e.target)
    , q = qs.parse(location.search)
  //console.log($target)
  q.page = $target.attr('page')
  util.updateQueryParams(q)

  if (history.pushState) {
    cb(q)
  } else {
    // IE9
    location.hash = 'scr-' + $(window).scrollTop()
    location.search = qs.stringify(q);
  }
}

/**
 * Add a single pagination link
 * @param elem the UI element to append the link to
 * @param page page the link refers to
 * @param currentPage page number of the currently displayed page
 * @param lowerBoundMobile lowest possible page number in pagination on mobile devices for current page
 * @param upperBoundMobile highest possible page number in pagination on mobile devices for current page
 * @param cb Callback for clicks on pagination link
 */
var addPaginationLink = function(elem, page, currentPage, lowerBoundMobile, upperBoundMobile, cb) {
  var link = createPaginationLink(page, cb)

  if (currentPage != page){
    link.addClass('button--secondary')
    // don't show link if it exceeds the mobile limit
    if (page+1 > upperBoundMobile || page < lowerBoundMobile) {
      link.addClass('is-hidden-mobile')
    }
  }

  $(elem).append(link)
}

/**
 * Create a single pagination link button (arrow or absolute)
 * @param page page number
 * @param clickCallback callback function|null
 * @return {*|jQuery} jQuery object representation of the link
 */
function createLinkButton(page, clickCallback){
  var $link = $('<a href="javascript:void(0)" />')
    .attr('page', page)
    .addClass('button pagination--button')

  // attach click event if the caller provided a callback
  if (clickCallback){
    $link.click(function(e) {
      paginationLinkClicked(e, clickCallback)
    })
  } else {
    $link.addClass('button--disabled')
  }
  return $link
}

/**
 * Create an absolute link button to a specific page
 * @param page page number
 * @return {*}  jQuery object representation of the link
 */
function createPaginationLink(page, clickCallback){
  return createLinkButton(page, clickCallback)
    .text(page+1)
}

/**
 * Create an arrow pagination button to the next page
 * @param page page number to link to
 * @param totalPages number of total pages
 * @param clickCallback callback for click handler
 * @return {*} jQuery link object
 */
function createNextPageLink(page, totalPages, clickCallback){
  var $link = createArrowLink(page, 'icon-chevron_outline', clickCallback)
  if (page == totalPages){
    $link.addClass('button--disabled')
    $link.off('click')
  }
  return $link
}

/**
 * Create an double arrow pagination button to the last page
 * @param currentPage page the user is currently on
 * @param totalPages number of total pages
 * @param clickCallback callback for click handler
 * @return {*} jQuery link object
 */
function createLastPageLink(currentPage, totalPages, clickCallback){
  var cb = (currentPage == totalPages-1) ? null : clickCallback
  var $link = createArrowLink(totalPages-1, 'icon-double_chevron_outline', cb)
  return $link
}

/***
 * Create arrow link to the previous page
 * @param page page number to link to
 * @param currentPage page the user is currently on
 * @param clickCallback callback for click handler
 * @return {*} jQuery link object
 */
function createPrevPageLink(page, currentPage, clickCallback){
  var cb = (currentPage == 0) ? null : clickCallback
  var $link = createArrowLink(page, 'icon-chevron_outline rotate', cb)
  return $link
}

/**
 * Create double arrow link to the first page
 * @param currentPage page the user is currently on
 * @param clickCallback callback for click handler
 * @return {*} jQuery link object
 */
function createFirstPageLink(currentPage, clickCallback){
  var cb = (currentPage == 0) ? null : clickCallback
  var $link = createArrowLink(0, 'icon-double_chevron_outline rotate', cb)
  return $link
}

/**
 * Create a relative (=arrow) link button to a specific page
 * @param page page number
 * @return {*}  jQuery object representation of the link
 */
function createArrowLink(page, arrowClass, clickCallback){
  return createLinkButton(page, clickCallback)
    .addClass('pagination--arrow button--secondary is-hidden-mobile')
    .append($('<span></span>').addClass(arrowClass).attr('page', page))
}

/**
 * Return correct path param for backend calls depending on the currently shown active page/URL
 * @param url the current URL
 * @returns the correct path param
 */
function getPathParam(url){
  var pathParm = undefined;
  if(!url) {
    return pathParm
  }
  if (url.indexOf('/person/') > -1 || url.indexOf('/detail') > -1) { // request is sent from a person page ==> backend URL uses 'person/...' pattern
    return 'person';
  }
  return 'organisation'
}

module.exports = {
  generatePagination: generatePagination,
  checkPagination: checkPagination,
  getPageSize: getPageSize,
  getPathParam: getPathParam,
  validateCurrentPage: validateCurrentPage,
}

