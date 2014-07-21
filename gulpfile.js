var gulp    = require('gulp'),
    concat  = require('gulp-concat'),
    uglify  = require('gulp-uglify'),
    jshint  = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    jsdoc   = require('gulp-jsdoc'),
    karma   = require('gulp-karma'),
    rename  = require('gulp-rename');


var testFiles = [
  'src/PositionSticky.js',
  'test/*.js'
];


gulp.task('default', ['test', 'lint'], function() {
  gulp.src(['./src/rAF.js', './src/PositionSticky.js'])
      .pipe(jsdoc('./docs'))
      .pipe(concat('PositionSticky.js'))
      .pipe(gulp.dest('dist'))
      .pipe(uglify())
      .pipe(rename('PositionSticky.min.js'))
      .pipe(gulp.dest('dist'));
});


gulp.task('test', function() {
  return gulp.src(testFiles)
      .pipe(karma({
        configFile: 'karma.conf.js',
        action: 'run'
      }))
      .on('error', function(err) {
        // Make sure failed tests cause gulp to exit non-zero
        throw err;
      });
});


gulp.task('lint', function() {
  return gulp.src(['./src/rAF.js', './src/PositionSticky.js'])
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));
});