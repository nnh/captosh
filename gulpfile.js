const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const watch = require('gulp-watch');
const runSequence = require('run-sequence');

const srcJs = 'app/**/*.js';
const srcCss = 'app/**/*.scss';
const srcHtml = 'app/**/*.pug';

gulp.task('compile-js', () => {
  return gulp.src(srcJs)
    .pipe(babel())
    .pipe(gulp.dest('build'));
});

gulp.task('compile-css', () => {
  return gulp.src(srcCss)
    .pipe(sass())
    .pipe(gulp.dest('build'));
});

gulp.task('compile-html', () => {
  return gulp.src(srcHtml)
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('copy-font', () => {
  return gulp.src('node_modules/font-awesome/fonts/**.*')
    .pipe(gulp.dest('build/fonts'))
});

gulp.task('watch', () => {
  gulp.watch(srcJs, ['compile-js']);
  gulp.watch(srcCss, ['compile-css']);
  gulp.watch(srcHtml, ['compile-html']);
});

// ------------------------------

gulp.task('default', (cb) => {
  runSequence('compile', 'copy-font', cb);
});

gulp.task('compile', (cb) => {
  runSequence('compile-js', 'compile-css', 'compile-html', cb);
});

gulp.task('dev', (cb) => {
  runSequence('compile', 'watch', cb);
});
