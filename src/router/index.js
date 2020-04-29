import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../components/login'

Vue.use(VueRouter)

const asyncRouterMap = [
  {
    //登录页
    path: '/login',
    name: 'Login',
    meta: {
      title: '登录页'
    },
    component: Login
  },
  {
    path: '/home',
    name: 'home',
    component: Home
  }
]

const router = new VueRouter({
  routes: asyncRouterMap
})

export default router
