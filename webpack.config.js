const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const baseConfig = {
  module: {
    rules: [
      {
        test: /\.tsx$/,
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
  }
};

const mainDevConfig = merge(baseConfig, {
  target: 'electron-main',
  entry: path.resolve(__dirname, 'src') + '/main.ts',
  output: {
    path: path.resolve(__dirname, 'app'),
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
    path: path.resolve(__dirname, 'app'),
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
    path: path.resolve(__dirname, 'app'),
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
