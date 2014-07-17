var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');


gulp.task('default', function() {
  gulp.src(['./src/rAF.js', './src/PositionSticky.js'])
      .pipe(concat('PositionSticky.js'))
      .pipe(gulp.dest('dist'))
      .pipe(uglify())
      .pipe(rename('PositionSticky.min.js'))
      .pipe(gulp.dest('dist'));
});