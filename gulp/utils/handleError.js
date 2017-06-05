'use strict';

var gNotify = require('gulp-notify');


module.exports = function() {
  var args = Array.prototype.slice.call(arguments);

  // Send error to the terminal with gulp-notify
  gNotify.onError({
    title:   '<%= error.plugin %>',
    message: '<%= error.message %>'
  }).apply(this, args);


  // Prevent gulp from hanging on this task
  this.emit('end');
};
