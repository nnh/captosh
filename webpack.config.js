import path from 'path';
import webpack from 'webpack';
import webpackMerge from 'webpack-merge';

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

const mainDevConfig = webpackMerge(baseConfig, {
  target: 'electron-main',
  entry: path.resolve(__dirname, 'src') + '/main.ts',
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
  entry: path.resolve(__dirname, 'src') + '/js/window.ts',
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
  entry: path.resolve(__dirname, 'src') + '/js/webview.ts',
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
