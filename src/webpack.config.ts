/// <reference types="./source/globals" />

import path from 'path';

import {Configuration} from 'webpack';
import SizePlugin from 'size-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const config: Configuration = {
  devtool: 'source-map',
  stats: {
    all: false,
    errors: true,
    builtAt: true,
  },
  entry: Object.fromEntries([
    'wordle/solver',
    'wordle/injector',
  ].map(name => [name, `./source/${name}`])),
  output: {
    path: path.join(__dirname, 'distribution'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          compilerOptions: {
            module: 'es2015',
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.sc|ass$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'source',
          globOptions: {
            ignore: [
              '**/*.ts',
              '**/*.scss',
              '**/*.css',
            ],
          },
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new SizePlugin({
      writeFile: false,
    }),
  ],
  resolve: {
    extensions: [
      '.ts',
      '.js',
    ],
    modules: ['node_modules'],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        exclude: 'browser-polyfill.min.js',
        terserOptions: {
          mangle: false,
          compress: {
            defaults: false,
            dead_code: true,
            unused: true,
            arguments: true,
            join_vars: false,
            booleans: false,
            expression: false,
            sequences: false,
          },
          output: {
            beautify: true,
            indent_level: 2,
          },
        },
      }),
    ],
  },
};

export default config;
