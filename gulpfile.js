'use strict';
var gulp        = require('gulp');
var config      = require('./config/config').client
var t           = require('./gulp/utils/tasksHelpers')(gulp, config);
var fs          = require('fs')
var debug       = require('debug')('gulpfile')

///////////////
//   Build   //
///////////////

// Cleans the build folder
gulp.task('clean', t.getTask('clean'));

// Moves all the assets to the build
gulp.task('build:assets', t.getTask('assets'));

// Generate all stylesheets from the sass files
gulp.task('build:styles', t.getTask('styles'));

// Move all javscript files to the build
gulp.task('build:scripts', t.getTask('scripts'));

/**
 * append build date to .version file
 */
gulp.task('build:version', function() {
  // create file if it does not exist
  try {
    fs.accessSync('.version')
  }
  catch (e){
    fs.closeSync(fs.openSync('.version', 'w'))
  }

  /**
   * truncate last build date + package.json version number
  */
  var content = fs.readFileSync('.version').toString()
  var position = content.lastIndexOf('Last build date:')
  if (position > -1){
    content = content.substr(0, position)
  }

  var packageJsonVersion = require('./package.json').version

  content = content + 'Last build date:\t\t\t' + new Date() + '\n'
                    + 'package.json version:\t\t' + packageJsonVersion
  fs.writeFileSync('.version', content)

  return gulp.src('.version')
    .pipe(gulp.dest('build'))
  }
)

gulp.task(
  'build',
  gulp.series(
    'clean',
    gulp.parallel(
      'build:assets',
      'build:styles',
      'build:scripts',
      'build:version'
    )
  )
);


//////////
// Test //
//////////

// Moves all the assets to the build
gulp.task('test:accessibility', t.getTask('accessibility'));

// Tests the built project in terms of accessibility.
gulp.task(
  'test',
  gulp.series(
    'build',
    'test:accessibility'
  )
);


/////////////
//  Others  //
/////////////

// Serve the build folder
gulp.task('serve', t.getTask('serve'));

// Lints the gulp tasks
gulp.task('tasks', t.getTask('tasks'));

// What happens when just running 'gulp'
gulp.task(
  'default',
  gulp.series(
    'build',
    'serve'
  )
);
