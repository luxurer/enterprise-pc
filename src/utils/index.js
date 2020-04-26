import Vue from 'vue'
/**
 * 格式化日期方法
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * eg:
 * {{time | formatDate("yyyy-MM-dd hh:mm:ss.S")}} ==> 2006-07-02 08:09:04.423
 * {{time | formatDate("yyyy-MM-dd E HH:mm:ss")}} ==> 2009-03-10 二 20:09:04
 * {{time | formatDate("yyyy-MM-dd EE hh:mm:ss")}} ==> 2009-03-10 周二 08:09:04
 * {{time | formatDate("yyyy-MM-dd EEE hh:mm:ss")}} ==> 2009-03-10 星期二 08:09:04
 * {{time | formatDate("yyyy-M-d h:m:s.S")}} ==> 2006-7-2 8:9:4.18
 */
export function formatDate (value, fmt = 'yyyy-MM-dd HH:mm:ss') {
  if ((new Date(+value)) === 'Invalid Date') {
    return ''
  }
  let valueDate = new Date(+value)
  let o = {
    'M+': valueDate.getMonth() + 1, // 月份
    'd+': valueDate.getDate(), // 日
    'h+': valueDate.getHours() % 12 === 0 ? 12 : valueDate.getHours() % 12, // 小时
    'H+': valueDate.getHours(), // 小时
    'm+': valueDate.getMinutes(), // 分
    's+': valueDate.getSeconds(), // 秒
    'q+': Math.floor((valueDate.getMonth() + 3) / 3), // 季度
    'S': valueDate.getMilliseconds() // 毫秒
  }
  let week = {
    '0': '\u65e5',
    '1': '\u4e00',
    '2': '\u4e8c',
    '3': '\u4e09',
    '4': '\u56db',
    '5': '\u4e94',
    '6': '\u516d'
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (valueDate.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '\u661f\u671f' : '\u5468') : '') + week[valueDate.getDay() + ''])
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}
// 将对象序列化为地址栏参数
export function serialJsonToForm (obj) {
  if (typeof obj !== 'object') return ''
  let arr = []
  for (let prop in obj) {
    if (obj[prop]) {
      arr.push(prop + '=' + obj[prop])
    }
  }
  if (arr.length == 0) return ''
  return arr.join('&')
}

Vue.filter('formatDate', function (value, fmt) {
  return formatDate(value, fmt)
})

/**
 * 文件导出
 * @param url String 文件导出地址
 */
export function handleExport (url) {
// 创建隐藏的可下载链接
  var eleLink = document.createElement('a');
  eleLink.download = '';
  eleLink.style.display = 'none';
  // 字符内容转变成blob地址
  eleLink.href = url;
  eleLink.target = '_parent';
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
}

/**
 * 获取url传参
 * @param url String url地址
 * return params Object url参数
 */
export function getUrlParams (url) {
  const ParamStr = url.split('?')[1];
  let params = {}
  if (ParamStr) {
    const paramItem = ParamStr.split('&')
    paramItem.forEach((item) => {
      const innerItem = item.split('=')
      params[innerItem[0]] = innerItem[1]
    })
    return params
  }
  return params
}

/**
 * 高德地图地址转经纬度
 * @param url String url地址
 * @param callback Function 回调函数
 */
export function getGeo (url, callback) {
  var xmlHttp = new XMLHttpRequest()
  xmlHttp.onreadystatechange = function () {
    // 判断数据是否正常返回
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      // 接收数据
      var res = JSON.parse(xmlHttp.responseText)
      callback(res)
    }
  }
  xmlHttp.open('get', url, true)
  xmlHttp.send()
}
