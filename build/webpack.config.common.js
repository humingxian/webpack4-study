var path = require('path')
var fs = require('fs')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
var webpack = require('webpack')

const plugins = [
  // 打包的时候会自动生成一个html文件，并将相应的资源自动引入到文件
  new HtmlWebpackPlugin({
    template: 'index.html',
    filename: 'index.html'
    // chunks: ['vendors', 'default', 'runtime', 'main']
  }),
  // new HtmlWebpackPlugin({
  //   template: 'index.html',
  //   filename: 'list.html',
  //   chunks: ['vendors', 'default', 'runtime', 'list']
  // }),
  new CleanWebpackPlugin()
  // // 模块热替换
  // new webpack.HotModuleReplacementPlugin(),
]

const files = fs.readdirSync(path.resolve(__dirname, '../dll'))
files.forEach(file => {
  if (/.*\.dll.js/.test(file)) {
    // add-asset-html-webpack-plugin插件是向打包生成的html文件中插入其他需要引入的静态资源
    plugins.push(new AddAssetHtmlWebpackPlugin({
      filepath: path.resolve(__dirname, '../dll', file)
    }))
  }
})

files.forEach(file => {
  if (/.*\.manifest.json/.test(file)) {
    // webpack.DllReferencePlugin
    // 实现项目多次打包，代码中依赖的第三方模块代码只打包一次，优化webpack打包速度
    // 专门用于单独的webpack配置中，以创建仅限dll的捆绑包。
    // 它创建一个manifest.json文件，DllReferencePlugin使用它来映射依赖项。
    plugins.push(new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname, '../dll', file)
    }))
  }
})

module.exports = {
  mode: 'development',
  entry: {
    // lodash: './src/lodash.js',
    main: './src/index.js'
    // list: './src/list.js'
  },
  resolve: {
    // 引入文件可以忽略的后缀名,注意合理配置，提升webpack的打包速度
    extensions: ['.js', '.jsx'],
    // mainfile表示当你在引入文件时，只写了文件夹，那么webpack会找该文件夹下面的index文件，作为主文件，
    // 这里配置了index，child， 那么会一个一个对比的找，先找index，有就用这个文件，没有就再换一个
    mainFiles: ['index', 'child'],
    alias: {
      component: path.resolve(__dirname, '../src/component')
    }
  },

  // chunks就是打包生成的文件。
  optimization: {
    runtimeChunk: {
      name: 'runtime'
    },
    // 实现tree shaking 只对 开发者用过的引入代码进行打包
    // 在开发环境可能需要配置这个，但是在生产环境，不需要配，也会自动进行tree shaking打包
    usedExports: true,
    // 实现tree shaking 只对 开发者用过的引入代码进行打包
    // 在开发环境可能需要配置这个，但是在生产环境，不需要配，也会自动进行tree shaking打包
    // usedExports: true
    splitChunks: { // 代码分割，不管是同步代码还是异步代码，都会用到这个配置
      chunks: 'all', // all表示对同步和异步的代码，都会进行代码分割，async表示只对异步代码分割
      minSize: 30000, // 表示引入的代码大于30000=30kb，就会对代码进行分割
      minChunks: 1, // 当代码被引入几次的时候，才会对代码进行分割，这里是1，就是1次就会打包
      // maxSize: 500000,// 对于分离出来的代码超过50kb，进行二次代码分离打包
      maxAsyncRequests: 5, // 最大同时加载5个类库的时候，这5个类库都会进行代码分离打包，超过5个，剩下的就不会进行代码分离打包
      maxInitialRequests: 3, // 入口文件如果最大同时加载3个类库的时候，这3个类库都会进行代码分离打包，超过3个，剩下的就不会进行代码分离打包
      automaticNameDelimiter: '~', // 打包的分离代码命名时用什么符号进行链接
      name: true, // 打包生成的文件名允许自定义
      // 缓存组
      cacheGroups: { // 对于同步引入的代码走cacheGroups配置判断
        // 一般的类库都会满足vendors的test，default里面没有test，两者都符合，会去判断谁的priority大，就优先
        // 打包到哪个里面去
        vendors: {
          test: /[\\/]node_modules[\\/]/, // 判断引入的代码是否是在node_modules中引入的，如果是的话，则进行代码分割 跟上面的chunks配合使用
          priority: -10 // vendors.priority和default.priority谁的值越大，优先级越高
          // filename: 'vendors.js'
        },
        default: { // 如果是自己写的类库，走下面的配置
          filename: 'common.js',
          // minChunks: 2,
          priority: -20,
          reuseExistingChunk: true // 如果一个模块在被打包的时候，已经进行过代码分离打包，那么当webpack打包的时候再遇到这个模块的时候，就会忽略该模块内容，不去进行代码分离打包了
        }
        // vendors: false,
        // default: false
      }
    }
  },
  output: {
    filename: '[name].js', // 主入口文件的打包文件命名名称
    chunkFilename: '[name].chunk.js', // 间接引用的打包文件的命名名称
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/'
  },
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
  // devtool: 'cheap-module-eval-source-map',
  // devServer: {
  //   contentBase: path.join(__dirname, 'dist'),
  //   open: true,
  //   // hot设置为true时表示开启HotModuleReplacement的功能，下面在plugin里面还要引入webpack.HotModuleReplacementPlugin才可以
  //   hot: true,
  //   // 即便hmr的功能没有生效，页面刷新也不会自动刷新
  //   // hotOnly: true
  // },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          'eslint-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpg)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name]_[hash].[ext]',
            outputPath: 'public/images/',
            // 设置文件大小限制，当大于20kb，就打包成一个文件，小于的话就打包成base64的形式
            limit: 20480
          }
        }
      },
      {
        test: /.(eot|ttf|svg|woff)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'public/font/'
          }
        }
      },
      {
        test: /.xml$/,
        use: [
          'xml-loader'
        ]
      },
      {
        test: /.(csv|tsv)$/,
        use: [
          'csv-loader'
        ]
      }
    ]
  },
  plugins: plugins

  // plugins可以在webpack运行的某个时刻为你做一些事情
  // plugins: [
  //   // add-asset-html-webpack-plugin插件是向打包生成的html文件中插入其他需要引入的静态资源
  //   new AddAssetHtmlWebpackPlugin({
  //     filepath: path.resolve(__dirname, '../dll/vendors.dll.js')
  //   }),
  //   // webpack.DllReferencePlugin
  //   // 实现项目多次打包，代码中依赖的第三方模块代码只打包一次，优化webpack打包速度
  //   // 专门用于单独的webpack配置中，以创建仅限dll的捆绑包。
  //   // 它创建一个manifest.json文件，DllReferencePlugin使用它来映射依赖项。
  //   new webpack.DllReferencePlugin({
  //     manifest: path.resolve(__dirname, '../dll/vendors.manifest.json')
  //   })
  // ]
}
