
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/pages/home'

Vue.use(VueRouter)

// 像vue实例那样导出一个函数
export const createRouter = () => {
  const router = new VueRouter({
    mode: 'history',  // hash模式在服务端渲染下不兼容
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home
      },
      {
        path: '/about',
        name: 'about',
        component: () => import('@/pages/about')
      },
      {
        path: '*',
        name: 'error',
        component: () => import('@/pages/404')
      }
    ]
  })
  return router
}
