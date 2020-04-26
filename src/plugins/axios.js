'use strict'

import Vue from 'vue'
import axios from 'axios'
import EOA from './eoa'
import { Message } from 'element-ui'
// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
let token_key = 'token'
let config = {
  baseURL: '/eidm'
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
}

const _axios = axios.create(config)

_axios.interceptors.request.use(
  function (config) {
    config.headers.Authorization = 'Bearer ' + window.sessionStorage.getItem(token_key) || ''
    // Do something before request is sent
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    // console.log(response)
    const res = response.data
    if (typeof res === 'object') {
      if (res.code === '1') {
        return res
      } else {
        Vue.prototype.$toast(res.message)
        return Promise.reject()
      }
    }
    return response
  },
  function (error) {
    // Do something with response error
    // 请求出错
    let { response } = error
    let resObj = {
      code: response.status,
      message: ''
    }
    console.log(response)
    if (response.status == 401) {
      resObj.message = '帐号登录超时，请重新登录'
      sessionStorage.removeItem(token_key)
      setTimeout(() => {
        EOA.callNative({
          method: 'finishActivity'
        })
      }, 2000)
    } else if (response.status == 403) {
      resObj.message = '帐号登录超时，请重新登录'
      sessionStorage.removeItem(token_key)
      setTimeout(() => {
        EOA.callNative({
          method: 'finishActivity'
        })
      }, 2000)
    } else if (response.status == 404) {
      resObj.message = '请求地址不存在'
    } else if (response.status == 500) {
      resObj.message = '服务器内部异常'
    } else if (response.status == 502) {
      resObj.message = '服务未启动，请先检查服务状态'
    } else if (response.status == 503) {
      resObj.message = '服务器已超载或维护中导致请求无法完成'
    } else if (response.status == 504) {
      resObj.message = '请求超时,请稍候重试'
    } else {
      resObj.message = '网络异常'
    }
    Vue.prototype.$toast(resObj.message)
    return Promise.reject(resObj)
  }
)

Plugin.install = function (Vue, options) {
  Vue.axios = _axios
  // window.axios = _axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get () {
        return _axios
      }
    },
    $axios: {
      get () {
        return _axios
      }
    }
  })
}

Vue.use(Plugin)

export default Plugin
