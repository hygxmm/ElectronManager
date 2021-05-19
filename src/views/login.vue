<template>
  <div class="login">
    <div class="login-box">
      <div class="login-box-title">Manager</div>
      <el-form ref="form" label-width="60px">
        <el-form-item label="账号">
          <el-input
            v-model="username"
            clearable
            placeholder="请输入账号"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="password"
            show-password
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="tool">
        <el-button class="btn" type="primary" @click="handleLogin">
          登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    // 登录
    handleLogin() {
      if (!this.username) return this.$message.error("请输入账号");
      if (!this.password) return this.$message.error("请输入密码");
      this.$api
        .login({ username: this.username, password: this.password })
        .then((res) => {
          if (res.code == 1) {
            this.$message.success(res.msg);
            this.$store.commit("login", res.data);
            this.$router.push({ path: "/" });
          } else {
            this.$message.error(res.msg);
          }
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.login {
  width: 100%;
  height: 100%;
  // background: linear-gradient(#f3400a, #fa9500);
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  .login-box {
    width: 300px;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    box-shadow: 0 0 10px #cccccc;
    border-radius: 8px;
    padding: 30px;
    .login-box-title {
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
      font-size: 28px;
    }
  }
}
.tool {
  margin-top: 20px;
  display: flex;
  .btn {
    flex: 1;
  }
}
</style>
