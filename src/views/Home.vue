<template>
  <div class="home-page">
    <div class="slide-box">
      <div class="logo">
        <img src="@/assets/images/logo.png" />
      </div>
      <div class="content">
        <div
          class="box-item"
          v-for="(item, index) in menus"
          :key="index"
          @click="handleJump(item.path, index)"
        >
          <span class="item-title" :class="{ active: index == curIndex }">
            {{ item.title }}
          </span>
        </div>
      </div>
      <div class="info">
        <span>{{ username }},</span>
        <span class="logout" @click="handleLogout">注销</span>
      </div>
    </div>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
const menus = [
  { title: "项目管理", path: "/my-project" },
  // { title: "页面管理", path: "/my-page" },
  // { title: "开发助手", path: "/tool" },
];
export default {
  data() {
    return {
      menus: Object.freeze(menus),
      curIndex: 0,
    };
  },
  computed: {
    username() {
      return this.$store.getters.username;
    },
  },
  methods: {
    handleJump(path, index) {
      if (this.curIndex === index) return;
      this.curIndex = index;
      this.jumpTo(path);
    },
    handleLogout() {
      this.$alert("确定退出吗", "提示", {
        confirmButtonText: "确定",
        callback: (action) => {
          if (action === "confirm") {
            this.$store.commit("logout");
            this.$router.push({ path: "/login" });
          }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.home-page {
  width: 100%;
  height: 100%;
  display: flex;
  .slide-box {
    width: 140px;
    min-width: 140px;
    height: 100%;
    background: linear-gradient(#f3400a, #fa9500);
    color: #ffffff;
    display: flex;
    flex-direction: column;
    .logo {
      width: 140px;
      height: 140px;
      padding: 20px;
      box-sizing: border-box;
      img {
        width: 100px;
        height: 100px;
      }
    }
    .box-item {
      flex: 1;
      padding: 5px 20px;
      .item-title {
        display: inline-block;
        width: 100%;
        height: 30px;
        font-size: 14px;
        border-radius: 20px;
        line-height: 30px;
        text-align: center;
        user-select: none;
        cursor: pointer;
      }
      .item-title.active {
        background-color: rgba(255, 255, 255, 0.3);
      }
    }
    .info {
      font-size: 14px;
      color: #ffffff;
      padding: 10px 20px;
      text-align: right;
      .logout {
        cursor: pointer;
      }
    }
  }
  .content {
    flex: 1;
  }
}
</style>
