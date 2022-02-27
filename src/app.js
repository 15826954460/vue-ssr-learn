import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'
// 应用程序、router 和 store 实例
export function createApp () {
  const router = createRouter()
  const app = new Vue({
    router,
    render: h => h(App)
  })
  return { app, router }
};
