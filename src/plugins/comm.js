/**
 *校验方法
 * 1.options.token 需要调用的cookie的jstoken  key值  eg:通知公告: tzgg_token 规章制度: gzzd_token
 * 2.options.keyVal 需要调用的cookie的keyVal  eg:通知公告: tzgg_key 规章制度: gzzd_key
 * 3.options.callBackFn getAccessKey的回调函数 eg:addEventListener  loadData()
 * 4.options.companyId 社团ID
 * 5.options.jsApiList 该应用需要的本地方法
 * */
let apiBaseUrl = '/jsoa-ht'
function getQueryString (name) {
  let hashParms = /\?(\S*)/
  let searchText = (window.location.search || window.location.hash).match(hashParms)
  let newReg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  let search = searchText && searchText[1] && searchText[1].match(newReg)
  if (search && search != null) {
    return search[2]
  } else {
    return null
  }
}
let appId = getQueryString('appId') ? getQueryString('appId') : ''
let corpId = getQueryString('companyId') ? getQueryString('companyId') : ''
let companyId = getQueryString('companyId') ? getQueryString('companyId') : ''
let keyName
function getAccessFn (vue, options) {
  let jstoken = window.sessionStorage.getItem(options.token)
  let terminalType = options.terminalType
  if (!jstoken) {
    getApi(vue, {
      companyId: companyId,
      terminalType: terminalType,
      callBackFn: function (data) {
        ////console.log(data)
        getAccessKey({
          signMessage: data,
          jsApiList: options.jsApiList,
          callBackFn: function (data) {
            //console.log('getAccessKey', data)
            getTicket({
              terminalType: terminalType,
              callBackFn: function (data) {
                //console.log('getTicket', data)
                getJstoken(vue, {
                  code: data.authCode,
                  terminalType: terminalType,
                  callbackFn: function (data) {
                    jstoken = data
                    //console.log(jstoken, 'jstoken')
                    window.sessionStorage.setItem(options.token, jstoken)
                    getUser(vue)
                    typeof options.callBackFn === 'function' ? options.callBackFn(jstoken) : ''
                  }
                })
              }
            })
          }
        })
      }
    })
  } else {
    typeof options.callBackFn === 'function' ? options.callBackFn(jstoken) : ''
  }
}
// 获取jsApi
function getApi (vue, options) {
  vue.axios.post('/pc/public/ticket', {
    appId: encodeURIComponent(appId),
    corpId: corpId,
    terminalType: options.terminalType
  }).then((body) => {
    if (body.code == 1) {
      typeof options.callBackFn === 'function' ? options.callBackFn(body.data) : ''
    } else {
      vue.$toast('获取Jsapi失败')
    }
  })
}
// 获取key
function getAccessKey (options) {
  EOA.callNative({
    method: 'initConfig',
    params: {
      signMessage: options.signMessage,
      jsApiList: options.jsApiList
    },
    success: function (key) {
      typeof options.callBackFn === 'function' ? options.callBackFn(key) : ''
    },
    error: function (err) {
      vue.$toast('调用config失败')
    }
  })
}
// 获取ticket
function getTicket (options) {
  EOA.callNative({
    method: 'getAuthCode',
    success: function (result) {
      typeof options.callBackFn === 'function' ? options.callBackFn(result) : ''
    },
    error: function (result) {
      vue.$toast('获取Ticket失败')
    }
  })
}

// 获取jstoken
function getJstoken (vue, options) {
  vue.axios.post('/pc/public/token', {
    terminalType: options.terminalType,
    corpId: corpId,
    ticket: encodeURIComponent(options.code),
    appId: encodeURIComponent(appId)
  }).then((body) => {
    if (body.code == 1) {
      typeof options.callbackFn === 'function' ? options.callbackFn(body.data) : ''
    } else {
      vue.$toast('获取jsToken失败!')
    }
  }).catch(err => {
    //console.log(err)
  })
}
// 获取当前登录人信息
function getUser(vue) {
  vue.axios.get('/pc/getLoginUserId').then(({data}) => {
    if (localStorage.getItem('userId') !== data.id) {
      localStorage.removeItem('searchHistory')
    }
    localStorage.setItem('userId', data.id)
  })
}

export { getAccessFn, getQueryString }
