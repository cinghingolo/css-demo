var $ = require('jquery')
  , modal = require('../modal/modal')
  , url = require('url')
  , util = require('../../scripts/util');

var $loginModal = $('#login-modal')
var $errorMessages = $('#errorMessages')
var $unauthorized = $('#unauthorized')
var $accountBlocked = $('#accountBlocked')

/**
 * Set refkey query param on register link to track conversion rate
 */
$loginModal.on('login-modal:open', function(e){
  var registerLink = $('#login-modal #register-link')
  var href = registerLink.attr('href')
  var urlObj = url.parse(href, true)

  // Autofocus the username input field. Note than HTML5 autofocus attribute will NOT work on modals
  $('#login-modal input[name="username"]').focus();

  // delete urlObj.search to force the url module to replace the query part of the URL
  delete urlObj.search

  setErrorMessages()

  // if present, add the data-refkey attribute from the modal as query-string parameter
  var refkey = $loginModal.data('ref')
  if (refkey){
    urlObj.query.ref = refkey
    registerLink.attr('href', url.format(urlObj))
  }
})

$(document).on('submit', '#login-form', function (e) {
  // Prevents the browser from submitting the form
  e.preventDefault();

  // Form being submitted
  var $form = e.currentTarget;
  var referrer = window.location.href.replace('#', '')
  var $autoRedirectUri = $($form).attr('redirect-uri')

  // clear error messages if present
  setErrorMessages()

  $.ajax({
    url: $form.action,
    type: 'POST',
    contentType: "application/json",
    data: JSON.stringify({
      username: $($form).find("input[name=username]").val(),
      password: $($form).find("input[name=password]").val(),
      autofollow: $($form).attr('autofollow'),
      entityType: $($form).attr('entity-type'),
      referrer: referrer,
      autoredirect: $autoRedirectUri
    }),
    success: function (data, status, jqXHR) {

      // trigger close event because page will be reloaded
      var closeEvent = $loginModal.attr('event-modal-close');
      if (closeEvent){
        $loginModal.trigger(closeEvent)
      }

      // redirect (if set) or else reload page
      $(location).attr('href', data.autoredirect || referrer)
    },
    error: function (jqXHR, status, error) {
      //console.log(jqXHR, status, error)
      var errText = ''
      if (jqXHR && jqXHR.responseJSON) {
        errText = jqXHR.responseJSON.error
      }
      switch(errText) {
        case 'account_blocked':
          $errorMessages.append($accountBlocked)
          break;
        case 'unauthorized':
        default:
          $errorMessages.append($unauthorized)
          break;
      }
    }
  });
});

function setErrorMessages(){
  // remove any error messages from previous login attempts
  $loginModal.find('#errorMessages').children().remove()
}
