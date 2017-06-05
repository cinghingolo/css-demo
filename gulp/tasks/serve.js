'use strict';
var _           = require('lodash');

module.exports = function (gulp, $, config) {
  var scriptFiles      = [config.appScripts];
  var stylesFiles      = [config.allStyles];
  var assetsFiles       = config.paths.assets.src;

  var task = function () {
    // Watching Scripts
    gulp.watch(scriptFiles, gulp.parallel('build:scripts'));

    // Watching Styles
    gulp.watch(stylesFiles, gulp.parallel('build:styles'));

    // // Watching Assets
    gulp.watch([assetsFiles + "**/*"], gulp.parallel('build:assets'));
  };

  task.description = 'Serve the build folder';
  return task;
};
