<template>
<!--  搜索列表-->
  <div class="search_view">
    <div class="search_wrap"  v-if="tabs === '1'">
      <!--<div class="search_header">
        <div @click="changeView('3')"><span class="icon_search"></span>请输入搜索内容</div>
        <div @click="changeView('4')"><span class="icon_shaixuan"></span>筛选</div>
      </div>-->
      <div class="search_content">
        <AsscaiationList v-if="belong === '1'" :belong="belong" @openEdit="openEdit"/>
        <ActivityList v-if="belong === '2'" :belong="belong" @openEdit="openEdit"/>
        <Message v-if="belong === '3'" :belong="belong" @openEdit="openEdit"/>
        <div v-if="exportResult" class="export_result">{{exportResult}}</div>
      </div>
      <!--<div class="search_footer">
        <div @click="changeView('2', 'add')">新增{{belong === '1' ? '社团' : '活动'}}信息</div>
        <div @click="exportCurrentData">导出当前数据</div>
        <span class="border_line"></span>
      </div>-->
    </div>
   <!-- <OperationView v-if="tabs === '2'" :belong="belong" :operationType="operationType" :currentRowData="currentRowData" @refresh="refresh" ref="operationView"/>
    <HandelSearch v-if="tabs === '3'" :belong="belong" @refresh="refresh" ref="handelSearch"/>
    <HandelScreen v-if="tabs === '4'" :belong="belong" @refresh="refresh" ref="handelScreen"/>-->
  </div>
</template>
<script>
import AsscaiationList from './AsscaiationList'
import ActivityList from './ActivityList'
import Message from './Message'
let loading = null
export default {
  name: 'SearchView',
  props: ['belong'],
  components: {
    AsscaiationList,
    ActivityList,
    Message
    /*OperationView,
    HandelSearch,
    HandelScreen*/
  },
  watch: {
    belong () {
      this.tabs = '1'
    }
  },
  data () {
    return {
      tabs: '1', // 展示的页面  '1'列表展示页  '2'编辑  '3'搜索  '4'筛选
      operationType: 'add',
      currentRowData: {},
      exportResult: '' // 导出结果
    }
  },
  methods: {
    // 页面展示变化
    changeView (val, operationType) {
      this.tabs = val
      if (operationType) {
        this.operationType = operationType
      }
    },
    // 打开编辑
    openEdit (row) {
      this.tabs = '2'
      this.operationType = 'edit'
      this.currentRowData = row
    },
    // 导出当前数据
    exportCurrentData () {
      loading = this.$loading({
        lock: true,
        text: '导出数据准备中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.6)'
      });
      this.axios({
        method: 'post',
        url: '/pc/activity/export',
        data: {
          belong: this.belong
        }
      }).then(({data}) => {
        this.queryExportState(data)
      }).catch(() => {
        loading.close();
      })
    },
    // 获取当前数据的导出状态
    queryExportState (token) {
      this.axios({
        method: 'get',
        url: '/pc/queryExportState',
        params: {
          token: token
        }
      }).then(({data}) => {
        if (data.finish) {
          const _this = this
          EOA.callNative({
              method: 'downloadFile',  //接口方法名
              params: {
                fileUrl: data.url,
                filename: data.fileName
              },
              success: function (result) {
                _this.exportResult = '导出成功请在【'+ result +'】中查看'  //下载完成后的本地地址
                setTimeout(() => {
                  _this.exportResult = ''
                },3000)
              },
              error: function (result) {
                 _this.exportResult = result.message; // 错误信息
                 setTimeout(() => {
                  _this.exportResult = ''
                },3000)
              }
          });
          setTimeout(() => {
            loading.close();
          },1000)
        } else {
          setTimeout(() => {
            this.queryExportState(token)
          },1000)
        }
      }).catch(() => {
        loading.close();
      })
    },
    refresh () {
      this.tabs = '1'
    }
  }
}
</script>

<style lang="less" scoped>
.search_view{
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.search_wrap{
  height: 100%;
  display: flex;
  flex-direction: column;
  .search_header{
    padding: 6px 16px;
    display: flex;
    div{
      line-height: 30px;
      background: #F2F2F2;
      color: #999999;
      border-radius: 2px;
      &:first-child{
        width: 240px;
        margin-right: 8px;
      }
      &:last-child{
        width: 80px;
        text-align: center;
      }
    }
  }
  .search_result{
    padding: 0 16px;
    font-size: 12px;
    color: #999999;
    line-height: 30px;
    background: #F2F2F2;
  }
  .search_content{
    flex: 1;
    overflow: hidden;
    position: relative;
    .export_result{
      width: 80%;
      color: #fff;
      position: absolute;
      left: 10%;
      bottom: 10px;
      opacity: 0.6;
      padding: 12px 28px;
      background: #000000;
      border-radius: 10px;
      word-break: break-all
    }
  }
  .search_footer{
    line-height: 60px;
    border-top: 1px solid #E6E6E6;
    display: flex;
    position: relative;
    div{
      width: 50%;
      text-align: center;
      color: #599BF8;
      cursor: pointer;
    }
    .border_line{
      position: absolute;
      width: 1px;
      height: 32px;
      left: 180px;
      top: 14px;
      background: #E6E6E6;
    }
  }
}
.icon_search{
  display: inline-block;
  width: 14px;
  height: 14px;
  margin: 0px 4px 0 10px;
  position: relative;
  top: 2px;
  background: url("../assets/img/icon_search.png") no-repeat center;
}
.icon_shaixuan{
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  position: relative;
  top: 2px;
  background: url("../assets/img/icon_shaixuan.png") no-repeat center;
}
</style>
