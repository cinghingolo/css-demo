var $ = require('jquery')

$('.js-dropdown-toggle').on('click', function(e){
  var currentId = $(this).parent().attr("id")
  // Find all active dropdowns
  var $elements = $(document).find('.js-dropdown-toggle')
  // Toggle options of the current dropdown, hide all the others
  $elements.each(function() {
    var $dropdown = $(this).parent()
    if ($dropdown.attr("id") == currentId) {
      $dropdown.find('.js-dropdown-options').toggleClass('not-displayed')
    } else {
      $dropdown.find('.js-dropdown-options').addClass('not-displayed')
    }
  });
  e.stopPropagation();
})

$(document).click(function(){
  $('.js-dropdown-options').addClass('not-displayed')
})
