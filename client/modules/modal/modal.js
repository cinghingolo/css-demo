var $ = require('jquery')


var show = function($modal, data){
  var $container = $('<div class="modal-container" />')
  $container.append('<div class="modal-overlay" />')
  $modal.detach()
  $modal.appendTo($container)
  $container.appendTo(document.body)

  // add attributes to login modal
  if(data){
    $modal.data(data)
  }

  // dispatch custom open event
  var modalOpenEvent = $modal.attr('event-modal-open')
  if (modalOpenEvent){
    $modal.trigger(modalOpenEvent)
  }
}

var hide = function($modal){
  // TODO check it's dismissable
  var $container = $modal.parent()
  $modal.detach()
  $modal.appendTo('.js-interaction-elements')
  $container.remove()

  // dispatch custom close event
  var modalCloseEvent = $modal.attr('event-modal-close')
  if (modalCloseEvent){
    $modal.trigger(modalCloseEvent)
  }
}

var showById = function(id, $target){
  var $modal = $('#' + id)
  var data = undefined
  if($target){
    data = $target.data()
  }
  show($modal, data)
}

$(document).on('click', '.js-trigger-modal', function(e){
  showById(
    $(this).data('modal-id'), $(e.target)
  )
})

$(document).on('click', '.modal-overlay, .modal-close', function(e){
  var $modal = $(this).parents('.modal-container')
                      .find('.modal')
  hide($modal)
})

/**
 * Hides an opened modal window on escape key press
 * Be careful, browsers implement keypress, keyup, keydown slight differently
 * @see http://stackoverflow.com/questions/3396754/onkeypress-vs-onkeyup-and-onkeydown
 */
$(document).keyup(function(e) {
  if (e.keyCode == 27) {
    $('.modal').each(function (){
      if ($(this).is(':visible')) {
        $(this).find('.modal-close').click()
      }
    })
  }
});

var tooltipToggler = function () {
  $('#follow-tooltip').toggleClass('not-displayed')
}

$('.follow-button')
  .mouseover(tooltipToggler)
  .mouseout(tooltipToggler)

module.exports = {
  show: showById,
  hide: hide
}




