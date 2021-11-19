const { SourceMapDevToolPlugin } = require('webpack')
const commonConfig = require('./webpack.common')

module.exports = {
  ...commonConfig,
  mode: 'development',
  watch: true,

  //
  // Browser does not seem to like it when eval
  // is used in background.js
  //
  devtool: false,
  plugins: [
    ...commonConfig.plugins,
    new SourceMapDevToolPlugin({
      test: /\.(js|jsx|css)($|\?)/i,
      exclude: /scite-extension\/src\/background.js/
    })
  ]
}
