var gulp    = require('gulp'),
    concat  = require('gulp-concat'),
    uglify  = require('gulp-uglify'),
    jshint  = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    jsdoc   = require('gulp-jsdoc'),
    rename  = require('gulp-rename'),
    wrap    = require('gulp-wrap');


gulp.task('default', ['build', 'jsdoc']);


gulp.task('build', function() {
  return gulp.src(['./src/rAF.js', './src/PositionSticky.js', './src/jQueryPluginDefinition.js'])
      .pipe(jshint())
      .pipe(jshint.reporter(stylish))
      .pipe(concat('jQuery.positionSticky.js'))
      .pipe(wrap('(function($, window, undefined) {\n\n<%= contents %>\n\n})(jQuery, window);'))
      .pipe(gulp.dest('dist'))
      .pipe(uglify())
      .pipe(rename('jQuery.positionSticky.min.js'))
      .pipe(gulp.dest('dist'));
});


gulp.task('jsdoc', function() {
  return gulp.src('./src/PositionSticky.js')
      .pipe(jsdoc('./docs'))
});


gulp.task('lint', function() {
  return gulp.src(['./src/rAF.js', './src/PositionSticky.js', './src/jQueryPluginDefinition.js'])
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));
});