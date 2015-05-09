var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('default', function() {
    console.log("This is the default action");
});

gulp.task('process-styles', function() {
    return gulp.src('web_app/css/metricsApp.css')
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest('production/css/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('production/css/'))
});

gulp.task('process-scripts', function() {
    return gulp.src('web_app/js/*.js')
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('production/js/'))
});

gulp.task('watch', function() {
    gulp.watch('web_app/js/*.js', ['process-scripts'])
    gulp.watch('web_app/css/*.css', ['process-styles'])
});
