const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const baseConfig = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx']
  },
  node: {
    __dirname: false,
    __filename: false
  },
  output: {
    path: path.resolve(__dirname, 'app')
  }
};

const mainDevConfig = merge(baseConfig, {
  target: 'electron-main',
  entry: path.resolve(__dirname, 'src') + '/main.ts',
  output: {
    filename: 'main.js'
  },
  mode: 'development'
});

const mainProConfig = merge(mainDevConfig, {
  mode: 'production'
});

const windowDevConfig = merge(baseConfig, {
  target: 'electron-renderer',
  entry: path.resolve(__dirname, 'src') + '/js/window.ts',
  output: {
    filename: 'js/window.js'
  },
  mode: 'development',
});

const windowProConfig = merge(windowDevConfig, {
  mode: 'production'
});

const webviewDevConfig = merge(baseConfig, {
  target: 'electron-renderer',
  entry: path.resolve(__dirname, 'src') + '/js/webview.ts',
  output: {
    filename: 'js/webview.js'
  },
  mode: 'development',
});

const webviewProConfig = merge(webviewDevConfig, {
  mode: 'production',
});

const webpackDevConfig = [mainDevConfig, windowDevConfig, webviewDevConfig];
const webpackProConfig = [mainProConfig, windowProConfig, webviewProConfig];

module.exports = {
  webpackDevConfig,
  webpackProConfig
};
