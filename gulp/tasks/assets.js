'use strict';
var changed = require('gulp-changed')

module.exports = function (gulp, $, config) {
  return function task(){
    var src = config.paths.assets.src + "**/*"
    return gulp.src(src)
              .pipe(changed(src))
              .pipe(gulp.dest(config.paths.assets.dest))
  }
};
