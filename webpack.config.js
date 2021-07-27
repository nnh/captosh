const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

module.exports = {
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
    extensions: ['.js', '.ts', '.tsx']
  },
  entry: {
    'main': './src/main.ts',
    'js/window': './src/js/window.ts',
    'js/webview': './src/js/window.ts'
  },
  output: {
    path: path.resolve(__dirname, 'app'),
    filename: 'app/[name].js'
  }
};
