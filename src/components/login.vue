<template>
  <div>
    <el-form ref="form" :rules="rules" :model="form" label-width="80px;"
             class="login-box">
      <h3 class="login-title">欢迎登录</h3>
      <el-form-item label="账号" prop="name">
        <el-input type="text" aria-placeholder="请输入账号" v-model="form.name"/>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" aria-placeholder="请输入密码" v-model="form.password"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('form')">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>


<script>
  export default {
    name: "login",
    data() {
      return {
        url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
        form: {
          name: '',
          password: ''
        },
        rules: {
          name: [{required: true, message: '请输入账号', trigger: 'blur'},
            {min: 3, max: 15, message: "长度在1-15个字符之间", trigger: 'blur'}],
          password: [{required: true, message: '请输入密码', trigger: 'blur'},
            {min: 1, max: 15, message: "长度在1-15个字符之间", trigger: 'blur'}]
        }
      }
    },
    methods: {
      // 登录
      onSubmit(formName) {
        this.axios({
          method: 'get',
          url: '/public/login',
          params: {
            account: this.form.name,
            password: this.form.password
          }
        }).then((data) => {
          var managerId;
          try {
            managerId = data.data.manager.id;
          } catch (e) {
          }
          var personId = data.data.person.id;
          if (personId == null && managerId == null) {
            this.$message({
              type: 'error',
              message: '您不是管理员',
              offset: 90
            });
          } else {
            sessionStorage.clear();
            sessionStorage.setItem('bgam_pc_isLogin', 'true');
            sessionStorage.setItem('bgam_pc_personId', personId);
            sessionStorage.setItem("pc_token", data.data.token);
            this.$router.push("/home");
            this.$message({
              type: 'success',
              message: '登录成功',
              offset: 90
            })
          }
        })
      }
    }
  }
</script>
<style lang="scss" scoped>
  .login-box {
    width: 27%; //宽度
    margin: auto; //距离上方180px
    border: 1px solid #DCDFE6; //边框
    padding: 35px; //边框边距
    border-radius: 5px; //圆角
    box-shadow: 0 0 25px #DCDFE6; //阴影
    /*相对定位*/
    position: relative;
    top: 20%;
  }

  .login-title {
    text-align: center;
  }

  div {
    height: 100%;
    background-image: url(~@/assets/img/login_back.jpg);
    background-color: #ffffff;
    background-repeat: no-repeat;
    /*background-size: cover;*/
    -webkit-background-size: cover;
    -o-background-size: cover;
    background-position: center 0;
    background-size: 43%;
    color: #000000;
  }

</style>
