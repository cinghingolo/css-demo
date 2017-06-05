(function() {
  var $ = require('jquery')
  __ = require('../../scripts/i18n')

  /**
   * This module will allow asynchronous displaying of flash messages
   */

  var defaultErrMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie noch einmal';
  var $template, $target, $alerts;

  $(function () {
    $template = $('#flash-message-template');
    $target = $('#flash-message-target');
    $alerts = $('.alert')
    attachAlertDismiss($alerts)
  });

  /**
   * @param $el, the selector to which apply the event
   * Allows a general element to be dismissed. Generally used for alerts, but extensible to other elements
   */
  var attachAlertDismiss = function ($el) {
    $el.find('[data-dismiss]').off('click')
    $el.find('[data-dismiss]').on('click', function () {
      $(this).closest('.' + $(this).attr('data-dismiss')).hide();
    });
  }

  /**
   * Displays a flash message in a specific placeholder, cloning it from a template.
   * If no message text is specified, a default message will be displayed.
   * @param type, flash type (error|info|warning|success)
   * @param message, message content
   */
  var showFlashMessage = function (type, message) {
    var alertType = 'alert-' + type;
    //console.log('Attempt to render flash message, alertType: ' + alertType + ' , message: ' + message)

    // Cloning flash message from template
    var $flashMessage = $template.find('.alert').clone();
    $flashMessage.addClass(alertType)
    $flashMessage.find('.flash-message-content').html(__(message))

    // Prevent message stacking removing previous messages of the same type
    $target.find('.' + alertType).remove()
    $target.prepend($flashMessage)

    // Attach Dismiss event to new rendered alert
    attachAlertDismiss($flashMessage)
  }

  var showFlashError = function(message) {
    message = message || defaultErrMessage;
    return showFlashMessage('danger', message)
  }

  var showFlashSuccess = function(message) {
    return showFlashMessage('success', message)
  }

  var showFlashWarning = function(message) {
    return showFlashMessage('warning', message)
  }

  var showFlashInfo = function(message) {
    return showFlashMessage('info', message)
  }

  module.exports = {
    showFlashMessage: showFlashMessage,
    showFlashSuccess: showFlashSuccess,
    showFlashError: showFlashError,
    showFlashWarning: showFlashWarning,
    showFlashInfo: showFlashInfo
  }
})()
