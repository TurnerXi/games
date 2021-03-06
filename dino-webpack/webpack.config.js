const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');
const path = require('path');
module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[id].[hash:5].js',
    chunkFilename: '[name].[chunkhash:5].js',
    chunkLoadTimeout: 10
  },
  resolve: {
    alias: {
      "static": path.resolve(__dirname, 'static')
    }
  },
  devServer: {
    contentBase: './dist',
    hot: true
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['css-loader'] },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-syntax-dynamic-import'
            ]
          }
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg|jpg|png|gif)\??.*$/,
        loader: 'url-loader',
        query: {
          limit: 8192,
          name: 'resourse/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html'
    }),
    new CopyWebpackPlugin([{
      from: './static',
      to: path.resolve(__dirname, 'dist/static')
    }]),
    new HotModuleReplacementPlugin()
  ]
}
