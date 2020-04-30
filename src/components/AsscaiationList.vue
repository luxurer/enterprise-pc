<template>
  <!--  社团列表-->
  <div class="asscaiation_list">
    <div v-if="listData.length > 0" class="search_result">
      <!--<span>当前分类：{{industryCount}}个行业，{{total}}个社团</span>-->
      <span v-if="showClear" class="clearSearch fr" @click="clearSearch">清除筛选条件</span>
    </div>
    <ul v-if="listData.length > 0" class="list_wrap" v-infinite-scroll="load">
      <li :class="activeId === item.id ? 'active' : ''" v-for="(item,index) in listData" :key="index"
          @click.stop="getDetail(item)">
        <div class="list_icon">
          <span class="icon_qiye"></span>
        </div>
        <div class="list_content">
          <div class="name overflow_ellipsis highLight"
               v-html="item.name.replace(searchKey, '<span>'+ searchKey +'</span>')">{{item.name}}
          </div>
          <!--          <div class="name overflow_ellipsis">{{item.name}}</div>-->
          <div class="address overflow_ellipsis highLight"
               v-html="item.address.replace(searchKey, '<span>'+ searchKey +'</span>')">{{item.address}}
          </div>
          <div class="industry"><span>{{item.industryInfo.name}}</span></div>
        </div>
        <!--<div class="list_button">
          <span @click.stop="handleEdit(item)">编辑</span>
        </div>-->
      </li>
    </ul>
    <div v-if="listData.length === 0 && !networkError && listLoadFinish" class="empty">{{emptyStr}}</div>
    <div v-if="networkError" class="network_error">网络错误，请重试</div>
  </div>
</template>

<script>
  import {getAccessFn} from '../plugins/comm'

  window.setActive = {}
  export default {
    name: 'AsscaiationList',
    props: ['belong', 'searchKey', 'noInit', 'highSearch'],
    data() {
      return {
        pageNo: 1,
        pageSize: 10,
        total: 0,
        industryCount: 0, // 行业数量
        listData: [],
        activeId: '',
        networkError: false, // 网络异常
        listLoadFinish: false // 列表没有数据
      }
    },
    computed: {
      showClear() {
        if (this.highSearch) {
          return this.highSearch.showClear
        }
        return false
      },
      emptyStr() {
        if (this.searchKey || this.highSearch) {
          return '暂无匹配的数据'
        } else {
          return '暂无数据'
        }
      }
    },
    filters: {
      // 高亮
      highlight(val) {
        let titleString = val
      }
    },
    methods: {
      // 获取列表数据
      getListData(type, val) {
        this.axios({
          method: 'post',
          url: '/pc/activity/list',
          data: {
            belong: Number(this.belong),
            pageNo: this.pageNo,
            pageSize: this.pageSize,
            searchKey: val ? val : this.searchKey,
            highSearch: this.highSearch
          }
        }).then((data) => {
          if (type === 'cover' || this.pageNo === 1) {
            this.listData = []
            this.listData = data.data.list
          } else {
            this.listData = this.listData.concat(data.data.list)
          }
          if (this.listData.length > 0) {
            this.listLoadFinish = false
          } else {
            this.listLoadFinish = true
          }
          window.setMapMark.setMarks(this.listData, this.belong)
          this.total = data.page.total
          this.industryCount = data.data.industryCount
        }).catch((error) => {
          /* debugger*/
          this.networkError = true
        })
      },
      // 地图展示详情弹窗
      getDetail(item) {
        if (this.searchKey) {
          let searchHistory = {
            asscaiation: [],
            organ: []
          }
          if (localStorage.getItem('searchHistory')) {
            searchHistory = JSON.parse(localStorage.getItem('searchHistory'))
          }
          const index = searchHistory.asscaiation.findIndex(item => {
            return item === this.searchKey
          })
          if (index === -1) {
            searchHistory.asscaiation.push(this.searchKey)
          }
          localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
        }
        this.setActiveId(item.id)
        window.setMapMark.queryDetail('', item.id, item)
      },
      setActiveId(id) {
        this.activeId = id
      },
      // 编辑
      handleEdit(item) {
        this.$emit('openEdit', item)
      },
      // 清除筛选条件
      clearSearch() {
        this.$emit('clearSearch')
      },
      load() {
        if (this.pageNo < Math.ceil(this.total / this.pageSize)) {
          this.pageNo++
          this.getListData()
        }
      },
      toFreeLogin() {
        getAccessFn(this, {
          token: 'token',
          terminalType: 2,
          jsApiList: ["downloadFile", "downLoad"],
          callBackFn: (local_jstoken) => {
            if (!local_jstoken) {
              return;
            } else {
              this.getListData()
              window.setMapMark.queryGeoUrl()
            }
          }
        })
      }
    },
    mounted() {
      window.setActive = this
      if (!this.noInit || this.searchKey) {
        //console.log('qqq');
        this.getListData();
        window.setMapMark.queryGeoUrl();
        //验证密钥
        //this.toFreeLogin()
      }
    }
  }
</script>

<style lang="less" scoped>
  .asscaiation_list {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 100%;
    height: 100%;

    .search_result {
      padding: 0 16px;
      font-size: 12px;
      color: #999999;
      line-height: 30px;
      background: #F2F2F2;

      .clearSearch {
        color: #599BF8;
        cursor: pointer;
      }
    }
  }

  .list_wrap {
    flex: 1;
    overflow-y: auto;

    li {
      display: flex;
      padding: 8px 0 0 16px;
      cursor: pointer;

      .list_icon {
        margin-right: 8px;
      }

      .list_content {
        flex: 1;
        overflow: hidden;
        border-bottom: 1px solid #eee;

        .name {
          font-size: 16px;
          color: #333333;
          line-height: 22px;
          margin-bottom: 5px;
        }

        .address {
          font-size: 12px;
          color: #999999;
          line-height: 18px;
          margin-bottom: 8px;
        }

        .industry {
          font-size: 12px;
          color: #FF9C3A;
          line-height: 20px;
          margin-bottom: 8px;

          span {
            border: 1px solid #FFA642;
            padding: 2px;
          }
        }
      }

      .list_button {
        line-height: 22px;
        padding-left: 12px;
        padding-right: 16px;
        text-align: center;
        color: #599BF8;
        border-bottom: 1px solid #eee;

        span {
          cursor: pointer;
        }
      }
    }
  }

  .active {
    background: #F2F2F2;
  }

  .empty {
    width: 100%;
    height: 100%;
    padding-top: 250px;
    font-size: 12px;
    color: #BBBBBB;
    text-align: center;
    background: url("../assets/img/empty.png") no-repeat center 163px;
  }

  .network_error {
    width: 100%;
    height: 100%;
    padding-top: 250px;
    font-size: 12px;
    color: #BBBBBB;
    text-align: center;
    background: url("../assets/img/network_error.png") no-repeat center 163px;
  }

  .icon_qiye {
    display: inline-block;
    width: 24px;
    height: 24px;
    background: url("../assets/img/icon_qiye.png") no-repeat center;
  }
</style>
