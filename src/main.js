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
Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.prototype.$toast = function(msg) {
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
