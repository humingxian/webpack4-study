var path = require('path')
var webpack = require('webpack')

module.exports = {
  mode: 'production',
  // 将项目中依赖的第三方模块单独打包
  entry: {
    lodash: ['lodash'],
    react: ['react', 'react-dom', 'react-router-dom'],
    axios: ['axios']
  },
  output: {
    filename: '[name].dll.js',
    path: path.resolve(__dirname, '../dll'),
    library: '[name]'
  },
  plugins: [
    // 将项目中的第三方依赖包单独打包生成一个dll的捆绑包，并且生成manifest.json文件，用于在以后打包时，映射依赖关系
    new webpack.DllPlugin({
      name: '[name]',
      path: path.resolve(__dirname, '../dll/[name].manifest.json')
    })
  ]
}
