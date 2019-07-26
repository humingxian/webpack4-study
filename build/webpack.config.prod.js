// 讲css文件分离的插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
// 对分离打包的css文件进行压缩
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const commonConfig = require('./webpack.config.common')
const merge = require('webpack-merge')

const prodConfig = {
  mode: 'production',
  // 源码的的映射， 可以为我们提供更好的调试功能
  /*
    source-map：原始源代码，并且生成map文件。可以精确到第几行第几列
    inline-source-map：原始源代码，不会生成map文件，但是映射的编码放在了js文件中，以base64的形式放在文件最后。可以精确到第几行第几列
    inline-cheap-source-map： 原始源代码，不会生成map文件，但是映射的编码放在了js文件中，以base64的形式放在文件最后。可以精确到第几行没有精确到列
    cheap-source-map： 原始源代码，并且生成map文件。可以精确到第几行没有精确到列
    cheap-module-source-map： 原始源代码，生成map文件。并且可以映射到代码中依赖的第三方库的代码，可以精确到第几行没有精确到列

  */
  //  development的时候用cheap-module-eval-source-map
  //  production的时候用cheap-module-source-map
  devtool: 'cheap-module-source-map',
  optimization: {
    minimizer: [
      // 这里的插件就是对css文件进行压缩
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              // 该配置是指在执行css-loader前执行的loader的数量
              // 防止在scss文件中引入的scss文件没有编译到
              importLoaders: 2
              // 实现css文件的模块化打包
              // modules: true
            }
          },
          'sass-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].chunk.css'
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true
    })
  ]
}

module.exports = merge(commonConfig, prodConfig)
