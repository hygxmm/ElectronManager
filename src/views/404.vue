<template>
  <div class="null-page">
    <div class="page-box">
      <div class="left">
        <img src="@/assets/images/nu.gif" />
      </div>
      <div class="right">
        <div class="top">
          <img src="@/assets/images/err_404.gif" />
        </div>
        <el-button type="text" @click="jumpTo('/')">回到首页</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.null-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .page-box {
    display: flex;
    .left {
      width: 236px;
      height: 259px;
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    .right {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .top {
        width: 205px;
        height: 156px;
      }
    }
  }
}
</style>