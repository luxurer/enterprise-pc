import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/base.css'
import './assets/css/common.css'
import Router from 'vue-router'
import './plugins/axios';

Vue.config.productionTip = false
Vue.use(ElementUI);
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
};
//路由跳转前
router.beforeEach(((to, from, next) => {
  let isLogin = sessionStorage.getItem('bgam_pc_isLogin');
  //已登录，放行
  if (isLogin != null) {
    next();
  }
  //注销
  if (to.path == '/logout') {
    sessionStorage.clear();
    next({path: '/login'});
  } /*else if (to.path == '/login') {
    //已登录，送到主页
    if (isLogin != null) {
      next({path: '/home'})
    }
    //未登录
    next();
  }*/ /*else if (isLogin == null) {
    next({path: '/login'});
  }*/
  next();
}));

Vue.prototype.$toast = function (msg) {
  EOA.callNative({
    method: 'toast',
    params: {
      text: msg
    }
  })
}

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
