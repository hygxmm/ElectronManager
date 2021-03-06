<template>
  <div class="basic-super-page">
    <div class="basic-super-content">
      <div class="head-container">
        <el-button type="primary" @click="openAddPackDialog">
          添加包
        </el-button>
        <el-button type="primary" @click="uploadAllZip">
          一键上传
        </el-button>
      </div>
      <div class="main-container">
        <div class="container-table">
          <el-table class="table" :data="packages" stripe border height="100%">
            <el-table-column prop="id" label="ID" width="50"></el-table-column>
            <el-table-column
              prop="aid"
              label="AID"
              width="50"
            ></el-table-column>
            <el-table-column
              prop="name"
              label="名称"
              width="100"
            ></el-table-column>
            <el-table-column label="地址">
              <template slot-scope="scope">
                <p>{{ scope.row.cpath }}</p>
                <p>{{ scope.row.spath }}</p>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button type="text" @click.stop="handleEdit(scope.row)">
                  编辑
                </el-button>
                <el-button type="text" @click.stop="updateCategory(scope.row)">
                  更新
                </el-button>
                <el-button type="text" @click.stop="handleDel(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <el-dialog title="添加包" :visible.sync="addPackDialog" width="500px">
        <el-form :model="addPackDialogForm">
          <el-form-item label="包名称" label-width="100px">
            <el-input
              v-model="addPackDialogForm.name"
              autocomplete="off"
            ></el-input>
          </el-form-item>

          <el-form-item label="AID" label-width="100px">
            <el-input
              v-model="addPackDialogForm.aid"
              autocomplete="off"
            ></el-input>
          </el-form-item>

          <el-form-item label="组件包路径" label-width="100px">
            <el-input
              v-model="addPackDialogForm.cpath"
              autocomplete="off"
              disabled
            >
              <el-button
                slot="append"
                icon="el-icon-folder-opened"
                @click.stop="addPackagePath('cpath')"
              ></el-button>
            </el-input>
          </el-form-item>

          <el-form-item label="资源包路径" label-width="100px">
            <el-input
              v-model="addPackDialogForm.spath"
              autocomplete="off"
              disabled
            >
              <el-button
                slot="append"
                icon="el-icon-folder-opened"
                @click.stop="addPackagePath('spath')"
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
const fs = window.require("fs");
export default {
  data() {
    return {
      addPackDialog: false, // 添加包弹窗状态
      addPackDialogForm: {
        name: "", // 分类名称
        cpath: "", // 分类组件包路径
        spath: "", // 分类资源包路径
        aid: "", // 分类id
      }, // 添加包选项
      packages: [], // 包列表
    };
  },
  methods: {
    // 获取包列表
    async getPackageData() {
      const packages = await this.$db.package.orderBy("id").toArray();
      console.log("packages", packages);
      if (packages.length != 0) {
        this.packages = packages;
      }
    },
    // 打开添加包弹窗
    openAddPackDialog() {
      this.addPackDialog = true;
    },
    closeAddPackDialog() {
      this.addPackDialog = false;
      this.clearDialogData();
    },
    // 添加包地址
    addPackagePath(type) {
      this.$util.debounce(
        () => {
          const dirPath = dialog.showOpenDialogSync({
            title: "选择文件夹",
            properties: ["openDirectory"],
          });
          if (dirPath && dirPath[0]) {
            this.addPackDialogForm[type] = dirPath[0];
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
        cpath: "",
        spath: "",
        aid: "",
      };
    },
    // 添加包
    async addPackage() {
      if (this.addPackDialogForm.name.trim() == "") {
        return this.$message.warning("请填写包名");
      }
      if (this.addPackDialogForm.aid.trim() == "") {
        return this.$message.warning("请填写aid");
      }
      let pack = await this.$db.package.get({
        aid: this.addPackDialogForm.aid.trim(),
      });
      if (pack) return this.$message.warning("该包已存在,请勿重复添加");
      await this.$db.package.add({
        name: this.addPackDialogForm.name.trim(),
        cpath: this.addPackDialogForm.cpath.trim(),
        spath: this.addPackDialogForm.spath.trim(),
        aid: this.addPackDialogForm.aid.trim(),
      });
      this.closeAddPackDialog();
      this.getPackageData();
    },
    // 编辑
    handleEdit(obj) {
      console.log(obj);
      this.$message.warning("该功能未开发");
    },
    // 更新分类包
    updateCategory(obj) {
      let paths = [];
      if (obj.cpath) {
        paths.push(obj.cpath);
      }
      if (obj.spath) {
        paths.push(obj.spath);
      }
      if (paths.length == 0) {
        return this.$message.warning("未绑定资源包,无须更新");
      }
      ipcRenderer
        .invoke("compress-folder-list", paths)
        .then((res) => {
          this.updateClassify(obj, res);
        })
        .catch((err) => {
          console.error("compress-folder-list", err);
        });
    },
    // 更新信息
    async updateClassify(obj, paths) {
      let promises = paths.map((path) => {
        return this.uploadZip(path);
      });
      const result = await Promise.all(promises);
      console.log("上传完毕压缩包", result);
      let data = {
        aid: obj.aid,
      };
      if (obj.cpath && obj.spath) {
        data.component = result[0].data.id;
        data.resources = result[1].data.id;
      } else if (obj.cpath && !obj.spath) {
        data.component = result[0].data.id;
      } else if (!obj.cpath && obj.spath) {
        data.resources = result[0].data.id;
      }
      this.$api
        .updateClassify(data)
        .then((res) => {
          console.log("更新分类", res);
          if (res.code == 1) {
            this.$message.success("更新成功");
          }
        })
        .catch((err) => {
          console.error("更新分类", res);
        });
    },
    // 上传压缩包
    async uploadZip(filePath) {
      if (!this.validatePath(filePath)) {
        return this.$message.warning("压缩包不存在");
      }
      let buffer = fs.readFileSync(filePath);
      const file = new File([buffer], filePath);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("module", "mkh");
      formData.append("dir", "files");
      return this.$api.uploadFile(formData);
    },
    // 删除
    handleDel() {
      this.$message.warning("该功能未开发");
    },
    // 校验路径是否存在
    validatePath(path) {
      return fs.existsSync(path);
    },
    // 一键上传所有包
    uploadAllZip() {
      this.$message.warning("该功能未开发");
    },
  },
  created() {
    this.getPackageData();
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
