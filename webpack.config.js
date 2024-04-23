"use strict";

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack')
const PACKAGE_JSON = require('./package.json')

const env = process.env.NODE_ENV;

module.exports = {
  mode: env,
  entry: {
    content: "./src/content.ts",
    background: "./src/background.ts",
    options: "./src/options.ts",
  },
  devtool: env === "production" ? undefined : "inline-source-map",
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      },
      {
        test: /\.tsx?$/,
        use: [{
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.json"
          }
        }],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/i,
        type: "asset/resource"
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        type: "asset/resource"
      }
    ]
  },
  optimization: {
    minimize: false
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  plugins:
    [
      new webpack.DefinePlugin({
        'PACKAGE_VERSION': JSON.stringify(PACKAGE_JSON.version)
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css"
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "manifest.json",
            transform: (content) => {
              const manifest = JSON.parse(content);

              manifest.version = PACKAGE_JSON.version
              manifest.description = PACKAGE_JSON.description

              return JSON.stringify(manifest, null, 2);
            },
            to: "manifest.json"
          },
          { from: "public/*", to: "[name][ext]" },

        ]
      })
    ],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true
  }
};
