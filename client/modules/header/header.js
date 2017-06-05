var $ = require('jquery')
  , debug = require('debug')('mh-menu')

$('.js-menu').on('click', function(){
  debug('toggle menu')
  $('.js-search-target').hide()
  $('.js-menu-target').toggle()
})

$('.js-search').on('click', function(){
  debug('toggle search')
  $('.js-menu-target').hide()
  $('.js-search-target').toggle()
})

var updateLanguage = function(e){
  var locale = $('html').attr('lang')
  var $target = $(e.target);
  var language = $target.data('lang');

  if (locale != language) {
    //console.log('attempt to change language')
    // disable previous active language on change
    var input = '#locale_' + locale
    $(input).attr('checked', false)

    var path = $target.data()['path'] || '/';
    var url = '/' + language + path;
    //console.log('Attempt to redirect to:', url)
    $(location).attr('href', url);
  }
}

$('.js-select-language').on('click', updateLanguage)
