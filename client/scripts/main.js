var $ = require('jquery')

require('../modules/header/header.js')
require('../modules/dropdown/dropdown.js')
require('../modules/modal/modal.js')
require('../modules/table--entities/entity-filters')
require('../modules/login/login.js')
require('../modules/login/auto-redirect.js')
require('../modules/flash-messages/flash-message.js')
require('./error-flash.js')
require('./util.js')


$('.dismiss-card').on('click', function(e){
  $(this).parent('.card').hide();
})

// ===== Scroll Page Hacking =========

$(document.body).on('click', 'a.js-save-scroll', function(e){
  e.target.href += '#scr-' + $(window).scrollTop()
})

// If we've stored the scrollposition, then restore it.
$(function(){
  if(window.location.hash && window.location.hash.indexOf('#scr-') == 0){
    var scrollPos = parseInt(window.location.hash.slice(5), 10)

    debug("Scrolling to: ", scrollPos);
    $(window).scrollTop(scrollPos)
    window.location.hash = ''
  }
});
