<template>
<!--  搜索-->
  <div class="handel_search">
    <div v-if="tabs === '1'" class="handel_wrap">
      <div class="operation_header">
        搜索
        <span class="el-icon-close fr" @click="handleReset"></span>
      </div>
      <div class="search_box">
        <el-input
          placeholder="请输入内容"
          prefix-icon="el-icon-search"
          :clearable="true"
          size="small"
          ref="searchInput"
          v-model.trim="searchStr">
        </el-input>
      </div>
      <div class="operation_content">
        <div v-if="!searchStr" class="history_wrap">
          <div v-if="searchHistory.length > 0" class="history_header">搜索历史<i class="el-icon-delete fr" @click="clearHistory"></i></div>
          <div v-if="searchHistory.length > 0">
            <span class="history_item" v-for="(item,index) in searchHistory" :key="index" @click="getSearchKey(item)">{{item}}</span>
          </div>
          <span v-else class="no_history">暂无搜索历史</span>
        </div>
        <EnterpriseList v-if="belong === '1' && searchStr" :belong="belong" :searchKey="searchStr" :noInit="true" @openEdit="openEdit" ref="enterpriseList"/>
        <SearchOrganList v-if="belong === '2' && searchStr" :belong="belong" :searchKey="searchStr" :noInit="true" @openEdit="openEdit" ref="organList"/>
      </div>
    </div>
    <OperationView v-if="tabs === '2'" :belong="belong" :operationType="operationType" :currentRowData="currentRowData" @refresh="refresh" ref="operationView"/>
  </div>
</template>

<script>
import EnterpriseList from './EnterpriseList'
import OrganList from './OrganList'
import SearchOrganList from './SearchOrganList'
import OperationView from './OperationView'
export default {
  name: 'HandelSearch',
  props: ['belong'],
  components: {
    EnterpriseList,
    OrganList,
    SearchOrganList,
    OperationView
  },
  data () {
    return {
      tabs: '1', // 展示的页面  '1'搜索  '2'编辑
      searchStr: '',
      operationType: 'add',
      currentRowData: {},
      searchHistory: []
    }
  },
  watch: {
    searchStr (val) {
      if (this.belong === '1') {
          if (this.$refs.enterpriseList) {
              this.$refs.enterpriseList.getListData('cover', val)
          }
      } else {
          if (this.$refs.organList) {
              this.$refs.organList.getListData('cover', val)
          }
      }
      this.getHistoryData()
    }
  },
  methods: {
    // 取消
    handleReset () {
      this.$emit('refresh')
    },
    // 打开编辑
    openEdit (row) {
      this.tabs = '2'
      this.operationType = 'edit'
      this.currentRowData = row
    },
    // 清空搜索历史
    clearHistory () {
      let searchHistory = JSON.parse(localStorage.getItem('searchHistory'))
      if (this.belong === '1') {
        searchHistory.enterprise = []
      } else {
        searchHistory.organ = []
      }
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
      this.searchHistory = []
    },
    // 搜索历史点击事件
    getSearchKey (val) {
      this.searchStr = val
    },
    // 获取搜索历史
    getHistoryData () {
        if (localStorage.getItem('searchHistory')) {
            let searchHistory
            if (this.belong === '1') {
                searchHistory = JSON.parse(localStorage.getItem('searchHistory')).enterprise
            } else {
                searchHistory = JSON.parse(localStorage.getItem('searchHistory')).organ
            }
            if (searchHistory.length > 10) {
                this.searchHistory = searchHistory.splice(searchHistory.length - 10, 10).reverse()
            } else {
                this.searchHistory = searchHistory.reverse()
            }
        }
    },
    refresh () {
      this.tabs = '1'
    }
  },
  mounted () {
    this.$refs.searchInput.focus()
    this.getHistoryData()
  }
}
</script>

<style lang="less" scoped>
.handel_search{
  height: 100%;
}
.handel_wrap{
  height: 100%;
  display: flex;
  flex-direction: column;
}
.operation_header{
  line-height: 60px;
  background: #DEEBFE;
  padding-left: 20px;
  .el-icon-close{
    margin: 22px 20px;
    cursor: pointer;
  }
}
.search_box{
  .el-input{
    width: 328px;
    margin: 8px 16px;
  }
  .search_result{
    padding: 0 16px;
    font-size: 12px;
    color: #999999;
    line-height: 30px;
    background: #F2F2F2;
  }
}
.operation_content{
  flex: 1;
  overflow-y: auto;
  position: relative;
  .history_wrap{
    padding: 0 16px;
    .history_header{
      line-height: 14px;
      margin: 17px 0;
      .el-icon-delete{
        cursor: pointer;
      }
    }
    .history_item{
      display: inline-block;
      min-width: 56px;
      text-align: center;
      font-size: 12px;
      line-height: 12px;
      padding: 8px 10px;
      margin-right: 10px;
      margin-bottom: 8px;
      background: #F2F2F2;
      border-radius: 2px;
      cursor: pointer;
    }
  }
}
.no_history{
  display: inline-block;
  width: 100px;
  height: 130px;
  padding-top: 100px;
  position: absolute;
  left: 130px;
  top: 133px;
  font-size: 12px;
  color: #BBBBBB;
  text-align: center;
  background: url(../assets/img/no_history.png) no-repeat top center;
}
</style>
