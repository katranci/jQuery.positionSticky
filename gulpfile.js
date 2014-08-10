var gulp    = require('gulp'),
    uglify  = require('gulp-uglify'),
    jshint  = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    rename  = require('gulp-rename');


gulp.task('default', ['lint', 'build']);


gulp.task('build', function() {
  return gulp.src('./src/jQueryPluginDefinition.js')
      .pipe(rename('jQuery.positionSticky.js'))
      .pipe(gulp.dest('dist'))
      .pipe(uglify())
      .pipe(rename('jQuery.positionSticky.min.js'))
      .pipe(gulp.dest('dist'));
});


gulp.task('lint', function() {
  return gulp.src('./src/jQueryPluginDefinition.js')
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));
});