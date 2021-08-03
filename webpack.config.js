const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const config = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules|gulpfile/,
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  output: {
    path: path.resolve(__dirname, 'app'),
    filename: 'app/[name].js'
  }
};

module.exports = [
  merge(config, {
    name: 'main',
    target: 'electron-main',
    entry: { 'main': './src/main.ts' }
  }),
  merge(config, {
    name: 'window',
    target: 'electron-renderer',
    entry: { 'js/window': './src/js/window.tsx' }
  }),
  merge(config, {
    name: 'webview',
    target: 'electron-renderer',
    entry: { 'js/webview': './src/js/webview.ts' }
  }),
];
