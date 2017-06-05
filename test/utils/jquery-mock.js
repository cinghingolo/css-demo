/**
 * helper module for tests requiring a jQuery-Mock
 */
var Module = require('module');
var originalRequire = Module.prototype.require;

// jQuery-Mock
var $mock = function () {
  return {
    catcomplete: $mock,
    show: $mock,
    hide: $mock,
    empty: $mock,
    click: $mock,
    text: $mock,
    attr: $mock,
    addClass: $mock,
    hasClass: $mock,
    append: $mock,
    html: $mock,
    each: $mock
  }
}

// jQuery-ui-Mock
var $ui_mock = {
  autocomplete: function (){}
}

$mock.ui = $ui_mock
$mock.widget = function() {}

global.require = Module.prototype.require = function () {
  if (arguments && arguments[0] == 'jquery') {
    return $mock
  }
  if (arguments && arguments[0] == 'jquery-ui/ui/widgets/autocomplete') {
    return $ui_mock
  }
  return originalRequire.apply(this, arguments);
};

module.exports = $mock
