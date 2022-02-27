const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
const webpack = require('webpack')
const devMiddleware = require('webpack-dev-middleware')
const hotMiddleware = require('webpack-hot-middleware')
const resolve = file => path.resolve(__dirname, file)

module.exports = (server, callback) => {
  let ready
  const onReady = new Promise(r => ready = r)
  // 监视构建 -> 更新renderer
  let template, serverBundle, clientManifest
  const update = () => {
    if (template && serverBundle && clientManifest) {
      // 调用resolve方法将promise状态变成fullfilled，在外面也能await到这个状态
      ready()
      callback(serverBundle, template, clientManifest)
    }
  }
  // 构建template -> 调用update -> 更新renderer渲染器
  const templatePath = resolve('../index.template.html')
  template = fs.readFileSync(templatePath, 'utf-8')
  update()
  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    update()
  })

  // 构建服务端client
  const serverConfig = require('./webpack.server.config') // 直接将配置文件引入进来
  const serverCompiler = webpack(serverConfig) // 将配置文件传给webpack然后进行编译，它会返回一个编译器
  // 将编译器传入devMiddleware中，第二个参数是配置选项
  const serverDevMiddleware = devMiddleware(serverCompiler, {
    logLevel: 'silent' // 关闭日志
  })

  // 给编译器的done钩子上注册一个事件，done钩子会在每次编译结束后调用
  serverCompiler.hooks.done.tap('server', () => {
    // 不同于fs，devMiddleware执行后返回的实例serverDevMiddleware的fileSystem是可以读取内存中的文件
    serverBundle = JSON.parse(
      serverDevMiddleware.fileSystem.readFileSync(path.resolve(__dirname, '../dist/vue-ssr-server-bundle.json'), 'utf-8')
    )
    // console.log(serverBundle);
    update()
  })

  // 构建客户端client
  const clientConfig = require('./webpack.client.config')
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  clientConfig.entry.app = [
    'webpack-hot-middleware/client?quiet=true&reload=true', // 和服务端交互处理热更新一个客户端脚本
    clientConfig.entry.app
  ]
  clientConfig.output.filename = '[name].js' // 热更新模式下确保一致的 hash
  const clientCompiler = webpack(clientConfig)
  const clientDevMiddleware = devMiddleware(clientCompiler, {
    // 设置路径，路径最好从配置文件中获取
    publicPath: clientConfig.output.publicPath,
    logLevel: 'silent' // 关闭日志
  })

  clientCompiler.hooks.done.tap('client', () => {
    clientManifest = JSON.parse(
      clientDevMiddleware.fileSystem.readFileSync(path.resolve(__dirname, '../dist/vue-ssr-client-manifest.json'), 'utf-8')
    )
    update()
  })
  server.use(clientDevMiddleware)
  server.use(hotMiddleware(clientCompiler, {
    log: false
  }))
  return onReady
}