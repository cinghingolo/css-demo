'use strict';
var handleError   = require('../utils/handleError');
var rev = require('gulp-rev');
var sassGlob = require('gulp-sass-glob');

module.exports = function (gulp, $, config) {
  var srcFiles   = config.appFiles.styles;
  var destFiles  = config.paths.styles.dest;

  var task = function () {
    return gulp.src(srcFiles)
      .pipe($.plumber(handleError))
      .pipe(sassGlob())
      .pipe($.sourcemaps.init())
      .pipe($.sass(config.sass).on('error', $.sass.logError))
      .pipe($.autoprefixer({browsers: ['last 2 versions', 'ie 9']}))
      .pipe($.sourcemaps.write({addComment:false, includeContent: true}))
      .pipe(rev())
      .pipe(gulp.dest(destFiles))
      .pipe(rev.manifest())
      .pipe(gulp.dest('./server/'))
  };

  task.description = 'Generate all stylesheets from the sass files';
  return task;
};
