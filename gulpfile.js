var gulp    = require('gulp'),
    concat  = require('gulp-concat'),
    uglify  = require('gulp-uglify'),
    jshint  = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    rename  = require('gulp-rename');


gulp.task('default', function() {
  gulp.src(['./src/rAF.js', './src/PositionSticky.js'])
      .pipe(jshint())
      .pipe(jshint.reporter(stylish))
      .pipe(concat('PositionSticky.js'))
      .pipe(gulp.dest('dist'))
      .pipe(uglify())
      .pipe(rename('PositionSticky.min.js'))
      .pipe(gulp.dest('dist'));
});


gulp.task('lint', function() {
  gulp.src(['./src/rAF.js', './src/PositionSticky.js'])
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));
});