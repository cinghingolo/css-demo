'use strict';
var gulpWebpack = require('webpack-stream');
var glob = require('glob');

module.exports = function (gulp, $, config) {
  var destPath   = config.paths.scripts.dest;

  var task = function () {
    return gulp.src(config.appScripts)
      .pipe($.eslint({envs: ['browser']}))
      .pipe($.eslint.format())
      .pipe(gulpWebpack(config.webpack))
      .pipe(gulp.dest(destPath))
  };

  task.description = 'Move all javscript files to the build';
  return task;
};
