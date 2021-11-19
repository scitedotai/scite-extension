const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const commonConfig = require('./webpack.common')

module.exports = {
  ...commonConfig,
  mode: 'production',
  devtool: false,
  optimization: {
    minimizer: [
      `...`, // eslint-disable-line
      new CssMinimizerPlugin()
    ]
  }
}
