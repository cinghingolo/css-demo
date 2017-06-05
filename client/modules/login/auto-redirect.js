var $ = require('jquery')

/**
 * Check if auto-redirect should be enabled. This happens by examining the auto-redirect button, that was clicked to
 * access to a report
 * @param e click event
 */
var checkAutoRedirect = function(e){
  var $redirectButton = $(e.target);
  var modalId = $redirectButton.attr('data-modal-id')

  //console.log('Attempt to auto-redirect uri: ', $redirectButton.data('redirect-uri'))
  // if the login-modal is set on the redirect-button, this means the user is currently logged out
  // this also means that the user should be able to automatically be redirected after successful login
  // note: the decision whether the auto-redirect is being triggered (only premium users, etc) is done in the backend
  if (modalId && modalId == 'login-modal' && ($('#' + modalId)) != undefined){
    setAutoRedirect($redirectButton.data('redirect-uri'))
  }
}

/**
 * set auto-redirect attribute to the redirect uri the user should be auto-redirected to
 * note: setting the attribute does not trigger the auto-redirect feature. This is done in the backend depending
 * on the user status
 * @param redirectUri
 */
var setAutoRedirect = function(redirectUri){

  // modal opens: add hidden input fields to form to enable auto-redirect
  var onLoginModalOpen = function(){
    $('#login-modal form#login-form').attr('redirect-uri', redirectUri)
  }

  // modal closes: remove hidden input field again
  var onLoginModalClose = function(){
    $('#login-modal form#login-form').removeAttr('redirect-uri')
    $(this).off('login-modal:open', onLoginModalOpen)
    $(this).off('login-modal:close', onLoginModalClose)
  }

  $('#login-modal').on('login-modal:open', onLoginModalOpen);
  $('#login-modal').on('login-modal:close', onLoginModalClose);
}

/**
 * initialize auto-redirect button
 */
function initialize() {
  // Register click events on follow-button
  $('.js-auto-redirect').click(checkAutoRedirect);

}

initialize()

