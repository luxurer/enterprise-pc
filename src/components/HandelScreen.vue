<template>
<!--  筛选-->
  <div class="handel_screen">
    <div v-if="tabs !== '3'" class="operation_wrap">
      <div class="operation_header">
        筛选
        <span class="el-icon-close fr" @click="handleBack"></span>
      </div>
      <div class="operation_content">
        <div v-if="this.tabs === '1'" class="screen_form">
          <el-form ref="form" :model="formData">
            <!--        固定表单项-->
            <el-form-item class="industry_list" v-if="industryLists.length > 0">
              <div class="title">所有行业</div>
              <div>
                <el-checkbox-group v-model="formData.industry">
                  <el-checkbox-button v-for="(item,index) in industryLists" :label="item.id" :key="index" text-color="#599BF8" fill="#f1f2f3">{{item.name}}({{item.count}})</el-checkbox-button>
                </el-checkbox-group>
                <!--                <span class="industry_item" v-for="(item,index) in industryLists" :key="index">{{item.name}}({{item.count}})</span>-->
              </div>
            </el-form-item>
            <!--        动态表单项-->
            <template v-for="(item,index) in this.formData.items">
              <el-form-item
                v-if="item.type === 1"
                :key="index">
                <div class="title">{{item.name}}</div>
                <el-input v-model="item.value" maxLength="200" placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item
                v-if="item.type === 2"
                :key="index"
                :prop="'items.' + index + '.value'"
                :rules="[
                { validator: valueFormate, trigger: 'blur' },
              ]"
              >
                <div class="title">{{item.name}}</div>
                <el-input class="number_start" placeholder="最小值" v-model="item.value.start" maxLength="13"></el-input>
                <span class="number_cut">~</span>
                <el-input class="number_end" placeholder="最大值" v-model="item.value.end" maxLength="13"></el-input>
              </el-form-item>
              <el-form-item
                v-if="item.type === 3"
                :key="index"
              >
                <div class="title">{{item.name}}</div>
                <el-date-picker
                  v-model="item.date"
                  type="daterange"
                  range-separator="~"
                  value-format="yyyy-MM-dd"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期">
                </el-date-picker>
              </el-form-item>
            </template>
          </el-form>
        </div>
        <div v-if="this.tabs === '2'" class="result_list">
          <EnterpriseList v-if="belong === '1'" :belong="belong" :highSearch="highSearch" @openEdit="openEdit" @clearSearch="clearSearch"/>
          <OrganList v-if="belong === '2'" :belong="belong" :highSearch="highSearch" @openEdit="openEdit" @clearSearch="clearSearch"/>
          <div v-if="exportResult" class="export_result">{{exportResult}}</div>
        </div>
      </div>
      <div class="operation_footer">
        <div v-if="this.tabs === '1'" class="reset" @click="handleReset">重 置</div>
        <div v-if="this.tabs === '1'" class="submit" @click="handleSubmit">确 定</div>
        <div v-if="this.tabs === '2'" @click="openEdit('3', 'add')">新增{{belong === '1' ? '企业' : '机构'}}信息</div>
        <div v-if="this.tabs === '2'" @click="exportCurrentData">导出当前数据</div>
        <span v-if="this.tabs === '2'" class="border_line"></span>
      </div>
    </div>
    <OperationView v-else :belong="belong" :operationType="operationType" :currentRowData="currentRowData" @refresh="refresh" ref="operationView"/>
  </div>
</template>

<script>
import EnterpriseList from './EnterpriseList'
import OrganList from './OrganList'
import OperationView from './OperationView'
let loading = null
export default {
  name: 'HandelScreen',
  props: ['belong'],
  components: {
    EnterpriseList,
    OrganList,
    OperationView
  },
  data () {
    return {
      tabs: '1', // 展示的页面  '1'筛选页  '2'结果页
      fixColumnName: { // 固定表单项的名称
        industry: '',
      },
      formData: {
        industry: [],
        items: []
      },
      industryLists: [], // 行业数据
      propertyList: [], // 动态表单项
      highSearch: {}, // 高级筛选的表单内容
      operationType: 'add',
      currentRowData: {},
      exportResult: '' // 导出结果
    }
  },
  methods: {
    // 数字输入框输入限制
    valueFormate (rule, value, cb) {
      if (!value) return cb()
      if (value.start || value.end) {
        if (value.start !== '' && !(/^\d+\.?\d{0,2}$/.test(value.start))) {
          // eslint-disable-next-line standard/no-callback-literal
          return cb('只能输入数字，可以有两位小数')
        }
        if (value.end !== '' && !(/^\d+\.?\d{0,2}$/.test(value.end))) {
          // eslint-disable-next-line standard/no-callback-literal
          return cb('只能输入数字，可以有两位小数')
        }
        if (value.end && Number(value.start) > Number(value.end)) {
          // eslint-disable-next-line standard/no-callback-literal
          return cb('最小值不能大于最大值')
        }
      }
      cb()
    },
    // 打开编辑
    openEdit (row, type) {
      this.tabs = '3'
      if (type) {
        this.operationType = 'add'
      } else {
        this.operationType = 'edit'
        this.currentRowData = row
      }

    },
    // 编辑成功
    refresh () {
      this.tabs = '2'
    },
    // 清除筛选条件
    clearSearch () {
      this.tabs = '1'
      this.resetForm(this.propertyList)
    },
    // 取消
    handleBack () {
      if (this.tabs === '2') {
        this.tabs = '1'
      } else {
        this.$emit('refresh')
      }
    },
    // 重置
    handleReset () {
      this.formData.industry = []
      this.$refs.form.resetFields()
      this.resetForm(this.propertyList)
    },
    // 确定
    handleSubmit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let highSearch = {
            industryList: this.formData.industry,
            searchList: []
          }
          let noEmpty = false
          this.formData.items.forEach((item) => {
            if (item.type !== 3) {
              highSearch.searchList.push(item)
              if (item.type === 1 && item.value) noEmpty = true
              if (item.type === 2 && item.value.start) noEmpty = true
            } else {
              highSearch.searchList.push({
                code: item.code,
                type: item.type,
                value: {
                  start: item.date[0],
                  end: item.date[1]
                }
              })
              if (item.date[0]) noEmpty = true
            }
          })
          if (this.formData.industry.length > 0)  noEmpty = true
          highSearch.showClear = noEmpty
          this.highSearch = highSearch
          this.tabs = '2'
        }
      })
    },
    // 获取指标数据
    getProperty () {
      this.axios({
        method: 'get',
        url: '/pc/enterpris/searchCondition',
        params: {
          belong: this.belong
        }
      }).then(({ data }) => {
        this.industryLists = data.industryList
        this.formData.items = []
        this.propertyList = data.propertyList
        this.resetForm(data.propertyList)
      })
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
        url: '/pc/enterpris/export',
        data: {
          belong: this.belong,
          highSearch: this.highSearch
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
              loading.close();
              _this.exportResult = '导出成功请在【'+ result +'】中查看'  //下载完成后的本地地址
              setTimeout(() => {
                _this.exportResult = ''
              },3000)
            },
            error: function (result) {
              loading.close();
              _this.exportResult = result.message; // 错误信息
              setTimeout(() => {
                _this.exportResult = ''
              },3000)
            }
          });
        } else {
          setTimeout(() => {
            this.queryExportState(token)
          },1000)
        }
      }).catch(() => {
        loading.close();
      })
    },
    // 表单数据重置
    resetForm (targetList) {
      this.formData.industry = []
      this.formData.items = []
      targetList.forEach(item => {
        if (item.code !== 'A000002' && item.code !== 'A000005') {
          if (item.type === 1) {
            this.formData.items.push({
              code: item.code,
              name: item.name,
              type: item.type,
              value: ''
            })
          } else {
            this.formData.items.push({
              code: item.code,
              name: item.name,
              type: item.type,
              value: {
                start: '',
                end: ''
              },
              date: ''
            })
          }
        }
        if (item.code === 'A000002' || item.code === 'A000005') {
          this.fixColumnName.industry = item.name
        }
      })
    },
  },
  mounted () {
    this.getProperty()
  }
}
</script>

<style lang="less" scoped>
.handel_screen{
  height: 100%;
}
.operation_wrap{
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
.operation_content{
  flex: 1;
  overflow: hidden;
  position: relative;
  .screen_form{
    position: absolute;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 13px 16px;
    .title{
      font-size: 12px;
      margin-bottom: 10px;
      padding-left: 6px;
      line-height: 12px;
      color: #666666;
      border-left: 4px solid #599BF8;
    }
    .industry_list{
      margin-bottom: 12px;
      .industry_item{
        display: inline-block;
        line-height: 40px;
        margin-right: 8px;
        margin-bottom: 10px;
        padding: 0 15px;
        background: #F2F2F2;
        border-radius: 2px;
        cursor: pointer;
      }
    }
    /deep/.el-checkbox-button{
      span{
        border-radius: 2px;
        border: none!important;
        padding: 12px 16px;
        margin-right: 8px;
        margin-bottom: 10px;
        background: #F2F2F2;
      }
    }
    /deep/.el-checkbox-button.is-checked .el-checkbox-button__inner{
      color: #599BF8;
      background-color: rgba(89,155,248,.2);
      box-shadow: none;
    }
    .number_start, .number_end{
      width: 104px;
    }
    .number_cut{
      padding: 0 10px;
    }
    .el-date-editor--daterange.el-input__inner{
      width: 100%;
    }
  }
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
.operation_footer{
  display: flex;
  border-top: 1px solid #E6E6E6;
  position: relative;
  div{
    width: 50%;
    line-height: 60px;
    text-align: center;
    cursor: pointer;
  }
  .reset{
    background: #FFFFFF;
  }
  .submit{
    background: #599BF8;
    color: #fff;
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
</style>
