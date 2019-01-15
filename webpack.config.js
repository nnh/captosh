import path from 'path';
import webpackMerge from 'webpack-merge';

const baseConfig = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              'presets': [
                ['@babel/env', { 'targets': { 'node': 'current' } }]
              ]
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  node: {
    __dirname: false,
    __filename: false
  }
};

const mainDevConfig = webpackMerge(baseConfig, {
  target: 'electron-main',
  entry: path.resolve(__dirname, 'src') + '/main.js',
  output: {
    path: path.resolve(__dirname, 'app'),
    filename: 'main.js'
  },
  mode: 'development'
});

const mainProConfig = webpackMerge(mainDevConfig, {
  mode: 'production'
});

const windowDevConfig = webpackMerge(baseConfig, {
  target: 'electron-renderer',
  entry: path.resolve(__dirname, 'src') + '/js/window.js',
  output: {
    path: path.resolve(__dirname, 'app'),
    filename: 'js/window.js'
  },
  mode: 'development',
});

const windowProConfig = webpackMerge(windowDevConfig, {
  mode: 'production'
});

const webviewDevConfig = webpackMerge(baseConfig, {
  target: 'electron-renderer',
  entry: path.resolve(__dirname, 'src') + '/js/webview.js',
  output: {
    path: path.resolve(__dirname, 'app'),
    filename: 'js/webview.js'
  },
  mode: 'development',
});

const webviewProConfig = webpackMerge(webviewDevConfig, {
  mode: 'production',
});

export const webpackDevConfig = [mainDevConfig, windowDevConfig, webviewDevConfig];
export const webpackProConfig = [mainProConfig, windowProConfig, webviewProConfig];