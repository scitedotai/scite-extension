const { merge } = require('webpack-merge')
const { SourceMapDevToolPlugin } = require('webpack')
const common = require('./webpack.common')

module.exports = merge(common, {
  mode: 'development',
  watch: true,

  //
  // Browser does not seem to like it when eval
  // is used in background.js
  //
  devtool: false,
  plugins: [
    new SourceMapDevToolPlugin({
      test: /\.(js|jsx|css)($|\?)/i,
      exclude: /scite-extension\/src\/background.js/
    })
  ]
})
