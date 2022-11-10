const { merge } = require('webpack-merge')
const { HotModuleReplacementPlugin } = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  entry: {
    testPage: './src/badge/test-page.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/badge/test-page.ejs'
    }),
    new HotModuleReplacementPlugin()
  ],
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    port: 8001,
    static: {
      directory: path.join(__dirname, '../../dist')
    }
  }
})
