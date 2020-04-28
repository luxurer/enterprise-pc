<template>
  <!--  活动列表-->
  <div class="organ_list">
    <div v-if="listData.length > 0" class="search_result">
      <!--<span>当前分类：{{industryCount}}个行业，{{organCount}}个网点</span>-->
      <span v-if="showClear" class="clearSearch fr" @click="clearSearch">清除筛选条件</span>
    </div>
    <div v-if="listData.length > 0" class="list_wrap"  v-infinite-scroll="load" :infinite-scroll-immediate="false">
      <div :class="activeId === item.id ? 'active organ' : 'organ'" v-for="(item,index) in listData" :key="index" @click.stop="getDetail(item, item.id)">
        <div class="organ_name">
          <span class="overflow_ellipsis highLight" v-html="item.branch.replace(searchKey, '<span>'+ searchKey +'</span>')">{{item.branch}}</span>
          <span class="edit fr" @click.stop="handleEdit(item)">编辑</span>
        </div>
        <div class="organ_address overflow_ellipsis highLight" v-html="item.address.replace(searchKey, '<span>'+ searchKey +'</span>')">{{item.address}}</div>
      </div>
    </div>
    <div v-if="listData.length === 0 && !networkError && listLoadFinish" class="empty">暂无匹配的数据</div>
    <div v-if="networkError" class="network_error">网络错误，请重试</div>
  </div>
</template>

<script>
    window.setActive = {}
    export default {
        name: 'SearchOrganList',
        props: ['belong', 'searchKey', 'noInit', 'highSearch'],
        data () {
            return {
                activeName: '',
                activeId: '',
                pageNo: 1,
                pageSize: 10,
                total: 0,
                industryCount: 0, // 行业数量
                organCount: 0, // 活动数量
                listData: [],
                networkError: false, // 网络异常
                listLoadFinish: false // 列表没有数据
            }
        },
        computed: {
            showClear () {
                if (this.highSearch) {
                    return this.highSearch.showClear
                }
                return false
            }
        },
        methods: {
            // 获取列表数据
            getListData (type, val) {
                this.axios({
                    method: 'post',
                    url: '/pc/enterpris/list',
                    data: {
                        belong: Number(this.belong),
                        pageNo: this.pageNo,
                        pageSize: this.pageSize,
                        searchKey: val ? val : this.searchKey,
                        isGroup: false,
                        highSearch: this.highSearch
                    }
                }).then((data) => {
                    if (type === 'cover' || this.pageNo === 1) {
                        this.listData = data.data.list
                    } else {
                        this.listData = this.listData.concat(data.data.list)
                    }
                    if (this.listData.length > 0) {
                        this.listLoadFinish = false
                    } else {
                        this.listLoadFinish = true
                    }
                    window.setMapMark.setMarks(this.listData)
                    this.total = data.page.total
                    this.organCount = data.data.organCount
                    this.industryCount = data.data.industryCount
                }).catch((error) => {
                    this.networkError = true
                })
            },
            // 地图展示详情弹窗
            getDetail (item, index) {
                if (this.searchKey) {
                    let searchHistory = {
                        enterprise: [],
                        organ: []
                    }
                    if (localStorage.getItem('searchHistory')) {
                        searchHistory = JSON.parse(localStorage.getItem('searchHistory'))
                    }
                    const index = searchHistory.organ.findIndex(item => {
                        return item === this.searchKey
                    })
                    if (index === -1) {
                        searchHistory.organ.push(this.searchKey)
                    }
                    localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
                }
                this.setActiveId(item.id, index)
                window.setMapMark.queryDetail('', item.id, item)
            },
            setActiveId (id, activeName) {
                this.activeName = activeName
                this.activeId = id
            },
            // 编辑
            handleEdit (item) {
                this.$emit('openEdit', item)
            },
            // 清除筛选条件
            clearSearch () {
                this.$emit('clearSearch')
            },
            load () {
                if (this.pageNo < Math.ceil(this.total / this.pageSize)) {
                    this.pageNo ++
                    this.getListData()
                }
            }
        },
        mounted () {
            window.setActive = this
            if (!this.noInit || this.searchKey) {
                this.getListData('cover')
            }
        }
    }
</script>

<style lang="less" scoped>
  .organ_list{
    height: 100%;
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 100%;
    height: 100%;
    .search_result{
      padding: 0 16px;
      font-size: 12px;
      color: #999999;
      line-height: 30px;
      background: #F2F2F2;
      .clearSearch{
        color: #599BF8;
        cursor: pointer;
      }
    }
  }
  .list_wrap{
    flex: 1;
    overflow-y: auto;
    .item_header{
      line-height: 1;
      overflow: hidden;
      flex: 1;
      .name{
        font-size: 16px;
        line-height: 24px;
        margin-bottom: 3px;
        color: #333333;
      }
      .industry{
        font-size: 12px;
        color: #FF9C3A;
        line-height: 20px;
        span{
          border: 1px solid #FFA642;
          padding: 2px;
        }
      }
    }
    .organ{
      cursor: pointer;
      border-bottom: 1px solid #EEEEEE;
      &:last-child{
        border-bottom: none;
      }
    }
    .organ_name{
      font-size: 16px;
      color: #333333;
      line-height: 22px;
      padding: 8px 16px 4px;
      .overflow_ellipsis{
        display: inline-block;
        width: 85%;
      }
      .edit{
        font-size: 14px;
        color: #599BF8;
        cursor: pointer;
      }
    }
    .organ_address{
      font-size: 12px;
      color: #999999;
      line-height: 18px;
      padding: 0 16px 8px;
    }
    /deep/.el-collapse-item__arrow{
      margin-right: 16px;
      margin-left: 14px;
    }
    /deep/.el-collapse-item__header.is-active{
      background: #DEEBFE;
    }
    /deep/.el-collapse-item__content{
      padding-bottom: 0;
    }
    /deep/.el-collapse-item__header{
      height: 78px;
    }
  }
  .active{
    background: #F2F2F2;
  }
  .empty{
    width: 100%;
    height: 100%;
    padding-top: 250px;
    font-size: 12px;
    color: #BBBBBB;
    text-align: center;
    background: url("../assets/img/empty.png") no-repeat center 163px;
  }
  .network_error{
    width: 100%;
    height: 100%;
    padding-top: 250px;
    font-size: 12px;
    color: #BBBBBB;
    text-align: center;
    background: url("../assets/img/network_error.png") no-repeat center 163px;
  }
  .icon_jigou{
    margin: 18px 14px 0 18px;
    display: inline-block;
    width: 36px;
    height: 36px;
    background: url("../assets/img/icon_jigou.png") no-repeat center;
  }
</style>
