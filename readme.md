# 异步加载的优化
```
/* webpackPrefetch: true */

/* webpackPreload: true */
```

在我们页面异步加载的时候，我们可能会考虑到页面首次加载的时候，一些用不到的代码，在我们用的时候再去加载他们

比如用户点击模态框去登录的时候，就可以用异步加载，这个模态框会在用户点的时候去加载，但是有时候代码可能会加载的比较慢

影响用户的交互感受，这时候我们就可以用到webpack里的魔法备注

_* webpackPrefetch: true *_   表示将来浏览器可能需要的资源

在主代码加载完成以后，网络空闲的状态下再去加载异步的代码，而不是在要用这个异步

代码的时候再去加载。一般这个用的多一些

_* webpackPreload: true *_    表示现在浏览器可能需要的资源

跟主代码一起加载到页面

_* webpackChunkName:"lodash" *_  命名 代码分离打包的文件的名称

# webpac实现项目多次打包，第三方模块只打包一次的配置
首先安装npm i add-asset-html-webpack-plugin --D 

然后写一个打包第三方模块的配置

webpack.config.dll.js
```
var path = require('path')
var webpack = require('webpack')

module.exports = {
  mode: 'production',
  // 将项目中依赖的第三方模块单独打包
	// 这样的配置只需要在这里加入想要打包的第三方模块就行
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
    /// 将项目中的第三方依赖包单独打包生成一个dll的捆绑包，并且生成manifest.json文件，用于在以后打包时，映射依赖关系/
    new webpack.DllPlugin({
      name: '[name]',
      path: path.resolve(__dirname, '../dll/[name].manifest.json')
    })
  ]
}

```

在package.json的scripts中加
```
”build:dll”: “webpack —config ./build/webpack.config.dll.js”,
```

终端中运行npm run build:dll
会生成vendors.dll.js和vendors.dll.manifest.json文件
然后通过在webpac.config.common.js中加入两个个插件配置
```
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin')


const plugins = [
	...// 其他插件配置
]

const files = fs.readdirSync(path.resolve(__dirname, '../dll'))
files.forEach(file => {
  if (/.*\.dll.js/.test(file)) {
    /// add-asset-html-webpack-plugin插件是向打包生成的html文件中插入其他需要引入的静态资源/
    plugins.push(new AddAssetHtmlWebpackPlugin({
      filepath: path.resolve(__dirname, '../dll', file)
    }))
  }
})

files.forEach(file => {
  if (/.*\.manifest.json/.test(file)) {
    /// webpack.DllReferencePlugin/
    /// 实现项目多次打包，代码中依赖的第三方模块代码只打包一次，优化webpack打包速度/
    /// 专门用于单独的webpack配置中，以创建仅限dll的捆绑包。/
    /// 它创建一个manifest.json文件，DllReferencePlugin使用它来映射依赖项。/
    plugins.push(new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname, '../dll', file)
    }))
  }
})

plugins: plugins




```

就可以实现项目多次打包，第三方依赖包只打包一次的效果，优化webapak的打包速度













