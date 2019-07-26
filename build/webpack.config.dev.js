var path = require('path')
const webpack = require('webpack')
const commonConfig = require('./webpack.config.common')
const merge = require('webpack-merge')

const devConfig = {
  mode: 'development',
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
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    overlay: true, // 可以配合eslint实现eslint代码规范在页面提示
    contentBase: path.resolve(__dirname, '../dist'),
    open: true,
    // hot设置为true时表示开启HotModuleReplacement的功能，下面在plugin里面还要引入webpack.HotModuleReplacementPlugin才可以
    hot: true,
    // 即便hmr的功能没有生效，页面刷新也不会自动刷新
    // hotOnly: true,
    historyApiFallback: true, // 单项目为单页面网页开发的时候，可以加这个配置让所有的浏览器url地址都返回index.html
    proxy: {
      '/react/api': {
        target: 'http://www.dell-lee.com',
        pathRewrite: {
          'header.json': 'demo.json'
        }
      }
    }
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
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

  // plugins可以在webpack运行的某个时刻为你做一些事情
  plugins: [
    // 模块热替换
    new webpack.HotModuleReplacementPlugin()
  ]
}

module.exports = merge(commonConfig, devConfig)
