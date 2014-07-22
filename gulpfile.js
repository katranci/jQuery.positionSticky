var gulp    = require('gulp'),
    concat  = require('gulp-concat'),
    uglify  = require('gulp-uglify'),
    jshint  = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    jsdoc   = require('gulp-jsdoc'),
    karma   = require('gulp-karma'),
    rename  = require('gulp-rename'),
    wrap    = require('gulp-wrap');


var testFiles = [
  'src/PositionSticky.js',
  'test/*.js'
];


gulp.task('default', ['test', 'lint', 'build', 'jsdoc']);


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


gulp.task('build', function() {
  return gulp.src(['./src/rAF.js', './src/PositionSticky.js', './src/jQueryPluginDefinition.js'])
      .pipe(concat('jQuery.positionSticky.js'))
      .pipe(wrap('(function($, window, undefined) {\n\n<%= contents %>\n\n})(jQuery, window);'))
      .pipe(gulp.dest('dist'))
      .pipe(uglify())
      .pipe(rename('jQuery.positionSticky.min.js'))
      .pipe(gulp.dest('dist'));
});


gulp.task('jsdoc', function() {
  return gulp.src('./src/PositionSticky.js')
      .pipe(jsdoc('./docs'));
});


gulp.task('lint', function() {
  return gulp.src(['./src/rAF.js', './src/PositionSticky.js', './src/jQueryPluginDefinition.js'])
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));
});