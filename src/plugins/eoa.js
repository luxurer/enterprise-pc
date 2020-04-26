//================================================
// 前端自增唯一ID的一种实现   基于Twitter雪花算法
// 生成一个10位的自增ID
// @author hsun
// @version 1.0
// @date 2018-09-07 17:09:17
//================================================
var uniqueCode = {
  nextId: function () {
    /**
     * 机器ID
     */
    var workerId;

    /**
     * 数据标识ID
     */
    var dataCenterId;

    /**
     * 序列
     */
    var sequence = 0;

    /**
     * 开始时间戳 2015-09-07 12:00:00
     */
    var twepoch = 1441598400000;

    /**
     * 机器ID所占的位数
     */
    var workerIdBits = 2;

    /**
     * 数据标识ID所占的位数
     */
    var datacenterIdBits = 2;

    /**
     * 序列在ID中的位数
     */
    var sequenceBits = 4;

    /**
     * 最大机器ID
     */
    var maxWorkerId = -1 ^ (-1 << workerIdBits);

    /**
     * 最大数据标识ID
     */
    var maxDataCenterId = -1 ^ (-1 << datacenterIdBits);

    var workerIdShift = sequenceBits;
    var datacenterIdShift = sequenceBits + workerIdBits;
    var timestampLeftShift = sequenceBits + workerIdBits + datacenterIdBits;
    var sequenceMask = -1 ^ (-1 << sequenceBits);

    /**
     * 上次生成ID的时间戳
     */
    var lastTimestamp = -1;

    workerId = parseInt(Math.random() * maxWorkerId, 10) + 1;
    dataCenterId = parseInt(Math.random() * maxDataCenterId, 10) + 1;
    var timestamp = uniqueCode.timeGen();
    if (timestamp < lastTimestamp) {
      alert("Clock moved backwards.  Refusing to generate id for " + (lastTimestamp - timestamp) + " milliseconds");
    }

    if (timestamp == lastTimestamp) {
      sequence = (sequence + 1) & sequenceMask;
      if (sequence == 0) {
        timestamp = uniqueCode.waitNextMillis(timestamp);
      }
    } else {
      sequence = 0;
    }

    lastTimestamp = timestamp;

    return ((timestamp - twepoch) << timestampLeftShift) |
      (dataCenterId << datacenterIdShift) |
      (workerId << workerIdShift) |
      sequence;
  },
  waitNextMillis: function (lastTimestamp) {
    var timestamp = timeGen();
    while (timestamp <= lastTimestamp) {
      timestamp = timeGen();
    }
    return timestamp;
  },
  timeGen: function () {
    return new Date().getTime();
  }
}

var EOA = {};
var callback_success = {};
var callback_fail = {};
var callback_event = {};
EOA.addEventListener = function (event, accessCode, callback) {
  EOA.callNative({
    method: "addEventListener",
    params: event,
    accessKey: accessCode,
    success: function (data) {
      callback_event[event] = function (result) {
        callback(result);
      }
      console.log(callback_event[event]);
    },
    error: function (error) {
      console.log(error);
    }
  });
}

//调用android本地方法
EOA.callNative = function (param) {
  var timestamp = uniqueCode.nextId();//生成唯一标识
  var successCallback = "callback_success_" + timestamp;
  var failCallback = "callback_fail_" + timestamp;
  var tempFuncSuccess, tempFuncFail;

  if (param.success) {
    tempFuncSuccess = param.success;
    param.success = successCallback;
    callback_success[successCallback] = function (result) {
      tempFuncSuccess(result);
      delete callback_fail[failCallback];
      delete callback_success[successCallback];
    }
  }

  if (param.error) {
    tempFuncFail = param.error;
    param.error = failCallback;
    callback_fail[failCallback] = function (result) {
      tempFuncFail(result);
      delete callback_success[successCallback];
      delete callback_fail[failCallback];
    }
  }
  // console.log(JSON.stringify(param));
  if (window.eoaBridge) {
    eoaBridge.callNative(JSON.stringify(param));
  }
}
//android本地回调js的方法
EOA.callBackJs = function (result) {
  // console.log(result);
  var resultObj = JSON.parse(result);
  if (resultObj.type === 1) {
    //事件
    if (resultObj.callback && callback_event[resultObj.callback]) {
      callback_event[resultObj.callback](resultObj.data);
    }
  }
  else if (resultObj.type === 2) {
    //成功
    if (resultObj.callback && callback_success[resultObj.callback]) {
      //此处应该只给data就行
      callback_success[resultObj.callback](resultObj.data);
    }
  } else {
    if (resultObj.callback && callback_fail[resultObj.callback]) {
      callback_fail[resultObj.callback](resultObj);
    } else if (resultObj.code == -3) {
      location.reload();
    } else if (resultObj.code == -6) {
      location.reload();
    } else {
      console.log("此页面未提供error回调方法，结果是：" + result, result);
      alert("执行错误，code=" + resultObj.code + ", message=\"" + resultObj.message + "\"");
    }
  }
}

window.EOA = EOA;
export default EOA;
