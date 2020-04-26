import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const asyncRouterMap = [
  {
    path: '/',
    name: 'home',
    component: Home
  }
]

const router = new VueRouter({
  routes: asyncRouterMap
})

export default router
