const Vue = require('vue')
const fs = require('fs')
const consola = require('consola');
const express = require('express')
const { createBundleRenderer } = require('vue-server-renderer')
const setupDevServer = require('./build/setup-dev-server')

const server = express()

const IS_PROD = process.env.NODE_ENV === 'production'
let renderer
let onReady

if (IS_PROD) {
  // 引入serverBundle
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  // 引入clientManifest
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  // 将模板的引入提取出来
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  // createBundleRenderer方法第一个参数就是serverBundle 第二个参数是个对象，里面可配置模板以及clientManifest
  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest
  })
} else {
  onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest
    })
  })
}

server.use('/dist', express.static('./dist'));

const render = async (req, res) => {
  try {
    const html = await renderer.renderToString({
      title: 'VueSSR',
      meta: `<meta name="description" content="VueSSR"/>`,
      url: req.url
    })
    // 防止中文乱码
    res.setHeader('Content-Type', 'text/html; charset=utf8')
    res.end(html)
  } catch (e) {
    res.status(500).end('Internal Server Error.')
  }
}

// 设置路由
server.get('*', IS_PROD ? render : async (req, res) => {
  await onReady
  render(req, res)
})

// 监听3000端口
server.listen(3000, () => {
  console.log('server is running at port 3000')
})
consola.ready({
  message: `Server listening on http://localhost:3000`,
  badge: true,
});