<template>
<!--  新增或者编辑-->
  <div class="operation_view">
    <div class="operation_header">
      {{operationType === 'add' ? '新增' : '编辑'}}{{belong === '1' ? '企业' : '机构'}}信息
      <span class="el-icon-close fr" @click="handleReset"></span>
    </div>
    <div class="operation_content">
      <el-form ref="form" :model="formData" :rules="rules" label-width="90px">
        <!--        固定表单项-->
        <el-form-item :label="fixColumnName.name" prop="name">
          <el-input v-model.trim="formData.name" maxLength="50" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item :label="fixColumnName.industry" prop="industry">
          <el-select v-model="formData.industry" placeholder="请选择" :clearable="true">
            <el-option
              v-for="item in industryLists"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="belong === '2'" :label="fixColumnName.level" prop="level">
          <el-input v-model.trim="formData.level" maxLength="50" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item :label="fixColumnName.address" prop="address" class="form_address">
          <el-input v-model="formData.address" placeholder="请输入" maxLength="50"></el-input>
          <span class="search_button" @click="getLngLat">搜索</span>
        </el-form-item>
        <el-form-item>
          <p class="address_message">请在右侧地图中拖动地图调整准确地址</p>
        </el-form-item>
        <!--        动态表单项-->
        <template v-for="(item,index) in this.formData.items">
          <el-form-item
            v-if="item.type === 1"
            :key="index"
            :label="item.name">
            <el-input type="textarea" :autosize="{ minRows: 2}" v-model="item.value" maxLength="300" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item
            v-if="item.type === 2"
            :key="index"
            :label="item.name"
            :prop="'items.' + index + '.value'"
            :rules="[
                { pattern: /^\d+\.?\d{0,2}$/, message: '只能输入数字，可以有两位小数', trigger: 'blur' },
                ]"
          >
            <el-input v-model="item.value" maxLength="13" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item
            v-if="item.type === 3"
            :key="index"
            :label="item.name"
            :prop="'items.' + index + '.value'"
          >
            <el-date-picker
              v-model="item.value"
              type="date"
              :editable="false"
              value-format="yyyy-MM-dd"
              placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
        </template>
      </el-form>
    </div>
    <div class="operation_footer">
      <div class="reset" @click="handleReset">取 消</div>
      <div class="submit" @click="handleSubmit">保 存</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OperationView',
  props: ['belong', 'operationType', 'currentRowData'],
  data () {
    return {
      fixColumnName: { // 固定表单项的名称
        address: '',
        industry: '',
        name: '',
        level: '',
      },
      lngLat: [],
      formData: {
        name: '',
        industry: '',
        level: '',
        address: '',
        items: []
      },
      industryLists: [], // 行业数据
      rules: {
        name: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
        industry: [
          { required: true, message: ' ', trigger: 'change' }
        ],
        level: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
        address: [
          { required: true, message: ' ', trigger: 'change' }
        ]
      },
      addFlag: 1, // 新增修改防止连续点击
      detailData: {} // 详情数据
    }
  },
  methods: {
    // 提交
    handleSubmit () {
      this.$refs.form.validate((valid) => {
        if (valid && this.addFlag) {
          this.addFlag = 0
          let url = '/pc/enterpris/addOrEdit'
          let message = '新增成功！'
          let data = {
            belong: Number(this.belong),
            lat: this.lngLat[1],
            lng: this.lngLat[0],
            propertyList: []
          }
          // 企业、机构名称
          data.propertyList.push({
            code: this.belong === '1' ? 'A000001' : 'A000004',
            value: this.formData.name,
            type: 1
          })
          // 企业、机构行业
          data.propertyList.push({
            code: this.belong === '1' ? 'A000002' : 'A000005',
            value: this.formData.industry,
            type: 1
          })
          // 企业、机构地址
          data.propertyList.push({
            code: this.belong === '1' ? 'A000003' : 'A000007',
            value: this.formData.address,
            type: 1
          })
          // 机构网点名称
          if (this.formData.level) {
            data.propertyList.push({
              code: 'A000006',
              value: this.formData.level,
              type: 1
            })
          }
          this.formData.items.forEach(item => {
            data.propertyList.push({
              code: item.code,
              value: item.value ? item.value.replace(/\n|\r/g, '<br/>') : '',
              type: item.type
            })
          })
          if (this.operationType === 'edit') {
            message = '编辑成功！'
            data.id = this.currentRowData.id
          }
          if (this.lngLat.length > 0) {

            this.axios({
              method: 'post',
              url: url,
              data: data
            }).then((data) => {
              this.addFlag = 1
              // this.$toast(message)
              this.$emit('refresh')
            }).catch(() => {
              this.addFlag = 1
            })
          } else {

            this.addFlag = 1
            this.$toast('请点击搜索调整准确位置')
          }
        }
      })
    },
    // 取消
    handleReset () {
      this.$emit('refresh')
    },
    // 获取指标数据
    getProperty () {
      this.axios({
        method: 'get',
        url: '/pc/property/list',
        params: {
          belong: this.belong
        }
      }).then(({ data }) => {
        this.industryLists = data.industryList
        this.formData.items = []
        data.propertyList.forEach(item => {
          if (item.code !== 'A000001' && item.code !== 'A000002' && item.code !== 'A000003' && item.code !== 'A000004' && item.code !== 'A000005' && item.code !== 'A000006' && item.code !== 'A000007') {
            this.formData.items.push({
              code: item.code,
              name: item.name,
              type: item.type,
              value: this.detailData[item.code] ? this.detailData[item.code].replace(/<br\s*\/?>/gi,'\n') : ''
            })
          }
          if (item.code === 'A000003' || item.code === 'A000007') {
            this.fixColumnName.address = item.name
            if (this.operationType === 'edit') {
              this.formData.address = this.detailData[item.code]
            }
          }
          if (item.code === 'A000002' || item.code === 'A000005') {
            this.fixColumnName.industry = item.name
            if (this.operationType === 'edit') {
              this.formData.industry = this.detailData[item.code]
            }
          }
          if (item.code === 'A000001' || item.code === 'A000004') {
            this.fixColumnName.name = item.name
            if (this.operationType === 'edit') {
              this.formData.name = this.detailData[item.code]
            }
          }
          if (item.code === 'A000006') {
            this.fixColumnName.level = item.name
            if (this.operationType === 'edit') {
              this.formData.level = this.detailData[item.code]
            }
          }
        })
      })
    },
    // 获取详情数据
    queryDetail (id) {
      this.axios({
        method: 'get',
        url: '/pc/enterpris/detail',
        params: {
          id: id,
          belong: this.belong
        }
      }).then(({ data }) => {
        let detailData = {}
        data.propertyList.forEach(item => {
          detailData[item.code] = item.value
        })
        this.lngLat = [data.lng, data.lat]
        this.detailData = detailData
        this.getProperty()
      })
    },
    // 获取输入坐标的经纬度信息
    getLngLat () {
      window.setMapMark.markByAddress(this.formData.address, (lnglat) => {
        this.lngLat = lnglat
      })
    },
  },
  mounted () {
    if (this.operationType === 'edit') {
      this.queryDetail(this.currentRowData.id)
    } else {
      this.getProperty()
    }
  }
}
</script>

<style lang="less" scoped>
.operation_view{
  height: 100%;
  display: flex;
  flex-direction: column;
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
    overflow-y: auto;
    padding: 20px 20px 20px 5px;
    .form_address{
      margin-bottom: 0;
      position: relative;
      .search_button{
        position: absolute;
        top: 2px;
        right: 10px;
        color: #599BF8;
        cursor: pointer;
      }
      /deep/.el-input__inner{
        padding-right: 46px;
      }
    }
    .address_message{
      line-height: 1;
      padding-top: 10px;
      padding-left: 90px;
      font-size: 12px;
      color: #999999;
    }
    .el-select{
      width: 100%;
    }
    .el-form-item{
      display: flex;
      align-items: center;
    }
    /deep/ .el-form-item__label{
      padding-left: 10px;
      text-align: right;
      line-height: 14px;
    }
    /deep/ .el-form-item__content{
      margin-left: 0px!important;
      flex: 1;
      .el-form-item__error{
        left: 3px
      }
      .el-input{
        width: 100%;
      }
    }
  }
  .operation_footer{
    display: flex;
    border-top: 1px solid #E6E6E6;
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
  }
}
</style>
