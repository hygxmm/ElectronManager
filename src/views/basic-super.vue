<template>
  <div class="basic-super-page">
    <div class="basic-super-content">
      <div class="head-container">
        <el-button type="primary" @click="openAddPackDialog">
          添加包
        </el-button>
      </div>
      <div class="main-container">
        <div class="container-table">
          <el-table class="table" :data="packages" stripe border></el-table>
        </div>
      </div>
      <el-dialog title="添加包" :visible.sync="addPackDialog" width="500px">
        <el-form :model="addPackDialogForm">
          <el-form-item label="类型" label-width="80px">
            <el-select
              v-model="addPackDialogForm.type"
              placeholder="请选择包类型"
            >
              <el-option
                v-for="item in packageTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item
            label="分类名称"
            label-width="80px"
            v-if="addPackDialogForm.type == 1 || addPackDialogForm.type == 2"
          >
            <el-input
              v-model="addPackDialogForm.name"
              autocomplete="off"
            ></el-input>
          </el-form-item>

          <el-form-item
            label="包名称"
            label-width="80px"
            v-if="addPackDialogForm.type == 0"
          >
            <el-input
              v-model="addPackDialogForm.name"
              autocomplete="off"
            ></el-input>
          </el-form-item>

          <el-form-item
            label="AID"
            label-width="80px"
            v-if="addPackDialogForm.type == 1 || addPackDialogForm.type == 2"
          >
            <el-input
              v-model="addPackDialogForm.aid"
              autocomplete="off"
            ></el-input>
          </el-form-item>

          <el-form-item label="路径" label-width="80px">
            <el-input
              v-model="addPackDialogForm.path"
              autocomplete="off"
              disabled
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click.stop="addPackagePath"
              ></el-button>
            </el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeAddPackDialog">取 消</el-button>
          <el-button type="primary" @click="addPackage">确定 </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
const { dialog } = window.require("electron").remote;
export default {
  data() {
    return {
      addPackDialog: true, // 添加包弹窗状态
      addPackDialogForm: {
        name: "", // 分类名称
        type: "", // 分类类型
        path: "", // 分类组件资源包
        aid: "", // 分类id
      }, // 添加包选项
      packages: [], // 包列表
      packageTypes: [
        { value: 0, label: "基础包" },
        { value: 1, label: "组件包" },
        { value: 2, label: "资源包" },
      ], // 包类型列表
    };
  },
  methods: {
    // 打开添加包弹窗
    openAddPackDialog() {
      this.addPackDialog = true;
    },
    closeAddPackDialog() {
      this.addPackDialog = false;
      this.clearDialogData();
    },
    // 添加包地址
    addPackagePath() {
      this.$util.debounce(
        () => {
          const dirPath = dialog.showOpenDialogSync({
            title: "选择文件夹",
            properties: ["openDirectory"],
          });
          if (dirPath && dirPath[0]) {
            this.addPackDialogForm.path = dirPath[0];
          }
        },
        800,
        true
      );
    },
    // 清除弹窗内数据
    clearDialogData() {
      this.addPackDialogForm = {
        name: "",
        type: "",
        path: "",
        aid: "",
      };
    },
    // 添加包
    async addPackage() {
      if (this.addPackDialogForm.name.trim() == "")
        return this.$message.warning("请填写包名");
      if ((this.addPackDialogForm.type + "").trim() == "")
        return this.$message.warning("请选择类型");
      if (this.addPackDialogForm.path.trim() == "")
        return this.$message.warning("请选择包地址");
      if (
        (this.addPackDialogForm.type == 1 ||
          this.addPackDialogForm.type == 2) &&
        this.addPackDialogForm.aid.trim() == ""
      )
        return this.$message.warning("请填写aid");
      if (
        this.addPackDialogForm.type == 1 ||
        this.addPackDialogForm.type == 2
      ) {
        let pack = await this.$db.package.get({
          aid: this.addPackDialogForm.aid.trim(),
        });
        if (pack) return this.$message.warning("该包已存在,请勿重复添加");
      } else {
        let pack = await this.$db.package.get({
          path: this.addPackDialogForm.path.trim(),
        });
        if (pack) return this.$message.warning("该包已存在,请勿重复添加");
      }
      await this.$db.package.add({
        name: this.addPackDialogForm.name.trim(),
        path: this.addPackDialogForm.path.trim(),
        type: this.addPackDialogForm.type.trim(),
        aid: this.addPackDialogForm.aid.trim(),
      });
      this.closeAddPackDialog();
    },
  },
};
</script>

<style lang="scss" scoped>
.basic-super-page {
  height: 100%;
  padding: 20px;
  background-color: #f8f8f8;
  box-sizing: border-box;
  .basic-super-content {
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    padding: 20px;
    box-sizing: border-box;
    .head-container {
      height: 50px;
    }
    .main-container {
      height: calc(100% - 50px);
      position: relative;
      .container-table {
        width: 100%;
        height: 100%;
        position: absolute;
        .table {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
