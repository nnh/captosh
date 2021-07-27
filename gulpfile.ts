import * as gulp from 'gulp';
import { TaskCallback } from 'undertaker';
import * as pug from 'gulp-pug';
import * as sassCompiler from 'sass';
import * as gulpSass from 'gulp-sass';
import { Configuration } from 'webpack';
import * as webpack  from 'webpack-stream';
import { webpackDevConfig, webpackProConfig } from './webpack.config';
import * as del from 'del';
import { server } from 'electron-connect';
import { exec } from 'child_process';
const electron = server.create();
const sass = gulpSass(sassCompiler);

const srcJs = 'src/**/*.js*';
const srcCss = 'src/**/*.scss';
const srcHtml = 'src/**/*.pug';
const dest = 'app';

export function bundleJsDev() {
  return gulp.src(srcJs)
    .pipe(webpack({config: webpackDevConfig} as Configuration))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest(dest));
}

export function bundleJsPro() {
  return gulp.src(srcJs)
    .pipe(webpack({ config: webpackProConfig } as Configuration))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest(dest));
}

export function compileCss() {
  return gulp.src(srcCss)
    .pipe(sass())
    .pipe(gulp.dest(dest));
}

export function compileHtml() {
  return gulp.src(srcHtml)
    .pipe(pug({}))
    .pipe(gulp.dest(dest));
}

export function copyFont() {
  return gulp.src('node_modules/font-awesome/fonts/**.*')
    .pipe(gulp.dest(`${dest}/fonts`));
}

export function watch() {
  gulp.watch(srcJs, bundleJsDev);
  gulp.watch(srcCss, compileCss);
  gulp.watch(srcHtml, compileHtml);
}

export function serve() {
  electron.start();
  gulp.watch(`${dest}/**/*.js`, electron.restart);
  gulp.watch([`${dest}/**/*.css`, `${dest}/**/*.html`], electron.reload);
}

export function packageMac(callback: TaskCallback) {
  exec('./node_modules/.bin/electron-builder --mac --x64', (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    callback(error);
  });
}

export function packageWin(callback: TaskCallback) {
  exec('./node_modules/.bin/electron-builder --win --x64', (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    callback(error);
  });
}

export function packageTest(callback: TaskCallback) {
  exec('./node_modules/.bin/electron-builder --dir', (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    callback(error);
  });
}

export async function clean(callback: TaskCallback) {
  try {
    await del(['app']);
    callback(undefined);
  }
  catch(e) {
    callback(e);
  }
}

// ------------------------------

export const compile = gulp.parallel(compileCss, compileHtml);

const defaultTask = gulp.parallel(bundleJsDev, compile, copyFont);
export default defaultTask;

export const packagePrepare = gulp.parallel(bundleJsPro, compile, copyFont);

export const dev = gulp.series(defaultTask, gulp.parallel(watch, serve));

export const devVs = gulp.series(defaultTask, watch);

export const pack = gulp.series(packagePrepare, packageMac, packageWin);


