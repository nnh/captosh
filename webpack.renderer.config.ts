import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.(eot|svg|ttf|woff|woff2)$/,
  use: [{
    loader: 'file-loader',
    options: {
      name: "[path][name].[ext]",
      publicPath: "../",
    }
  }]
});
rules.push({
  test: /\.s[ac]ss(\?v=[^=]+)?$/i,
  use: [
    // Creates `style` nodes from JS strings
    "style-loader",
    // Translates CSS into CommonJS
    "css-loader",
    // Compiles Sass to CSS
    "sass-loader",
  ],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
