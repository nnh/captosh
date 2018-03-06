const electron = require('electron-connect').server.create();
const gulp = require('gulp');
const babel = require('gulp-babel');
const exec = require('gulp-exec');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const watch = require('gulp-watch');
const runSequence = require('run-sequence');

const srcJs = 'src/**/*.js';
const srcCss = 'src/**/*.scss';
const srcHtml = 'src/**/*.pug';
const dest = 'app';

gulp.task('compile-js', () => {
  return gulp.src(srcJs)
    .pipe(babel())
    .pipe(gulp.dest(dest));
});

gulp.task('compile-css', () => {
  return gulp.src(srcCss)
    .pipe(sass())
    .pipe(gulp.dest(dest));
});

gulp.task('compile-html', () => {
  return gulp.src(srcHtml)
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(dest));
});

gulp.task('copy-font', () => {
  return gulp.src('node_modules/font-awesome/fonts/**.*')
    .pipe(gulp.dest(`${dest}/fonts`));
});

gulp.task('watch', () => {
  gulp.watch(srcJs, ['compile-js']);
  gulp.watch(srcCss, ['compile-css']);
  gulp.watch(srcHtml, ['compile-html']);
});

gulp.task('serve', () => {
  electron.start();
  gulp.watch(`${dest}/**/*.js`, electron.restart);
  gulp.watch([`${dest}/**/*.css`, `${dest}/**/*.html`], electron.reload);
});

gulp.task('package:mac', (callback) => {
  return gulp.src('')
    .pipe(exec('./node_modules/.bin/build --mac --x64'))
    .pipe(exec.reporter());
});

gulp.task('package:win', (callback) => {
  return gulp.src('')
    .pipe(exec('./node_modules/.bin/build --win --x64'))
    .pipe(exec.reporter());
});

// ------------------------------

gulp.task('default', ['compile', 'copy-font']);

gulp.task('compile', ['compile-js', 'compile-css', 'compile-html']);

gulp.task('dev', () => {
  runSequence('default', ['watch', 'serve']);
});

gulp.task('package', () => {
  runSequence('default', 'package:mac', 'package:win');
});
