var $ = require('jquery')

$(document.body).on('click', '.dismiss-card', function(){
  var $card = $(this)
    .parents('.card')
    .addClass('hidden')
})
