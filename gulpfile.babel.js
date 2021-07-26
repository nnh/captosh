import gulp from 'gulp';
import babel from 'gulp-babel';
import exec from 'gulp-exec';
import pug from 'gulp-pug';
import sassCompiler from 'sass';
import gulpSass from 'gulp-sass';
import webpack from 'webpack-stream';
import { webpackDevConfig, webpackProConfig } from './webpack.config';
import del from 'del';
import { server } from 'electron-connect';
const electron = server.create();
const sass = gulpSass(sassCompiler);

const srcJs = 'src/**/*.js*';
const srcCss = 'src/**/*.scss';
const srcHtml = 'src/**/*.pug';
const dest = 'app';

gulp.task('bundle-js-dev', () => {
  return gulp.src(srcJs)
    .pipe(webpack({ config: webpackDevConfig }))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest(dest));
});

gulp.task('bundle-js-pro', () => {
  return gulp.src(srcJs)
    .pipe(webpack({ config: webpackProConfig }))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest(dest));
});

// gulp.task('compile-js', () => {
//   return gulp.src(srcJs)
//     .pipe(babel())
//     .on('error', console.error.bind(console))
//     .pipe(gulp.dest(dest));
// });

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
  gulp.watch(srcJs, ['bundle-js-dev']);
  // gulp.watch(srcJs, ['compile-js']);
  gulp.watch(srcCss, ['compile-css']);
  gulp.watch(srcHtml, ['compile-html']);
});

gulp.task('serve', () => {
  electron.start();
  gulp.watch(`${dest}/**/*.js`, electron.restart);
  gulp.watch([`${dest}/**/*.css`, `${dest}/**/*.html`], electron.reload);
});

gulp.task('package:mac', (callback) => {
  return gulp.src('**/**')
    .pipe(exec('./node_modules/.bin/build --mac --x64'))
    .pipe(exec.reporter());
});

gulp.task('package:win', (callback) => {
  return gulp.src('**/**')
    .pipe(exec('./node_modules/.bin/build --win --x64'))
    .pipe(exec.reporter());
});

gulp.task('package:test', (callback) => {
  return gulp.src('**/**')
    .pipe(exec('build --dir'))
    .pipe(exec.reporter());
});

gulp.task('clean', (callback) => {
  del(['app'], callback);
});

// ------------------------------

gulp.task('compile', gulp.parallel('compile-css', 'compile-html'));

gulp.task('default', gulp.parallel('bundle-js-dev', 'compile', 'copy-font'))

gulp.task('package-prepare', gulp.parallel('bundle-js-pro', 'compile', 'copy-font'));

gulp.task('dev', gulp.series('default', gulp.parallel('watch', 'serve')));

gulp.task('dev-vs', gulp.series('default', 'watch'));

gulp.task('package', gulp.series('package-prepare', 'package:mac', 'package:win'));
