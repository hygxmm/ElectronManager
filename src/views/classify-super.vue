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
          <el-table class="table" :data="packages" stripe border>
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
                <p v-if="scope.row.type == '0'">{{ scope.row.path }}</p>
                <p v-if="scope.row.type == '1'">{{ scope.row.cpath }}</p>
                <p v-if="scope.row.type == '1'">{{ scope.row.spath }}</p>
              </template>
            </el-table-column>

            <el-table-column label="类型" width="100">
              <template slot-scope="scope">
                <span class="">{{ scope.row.type | filterType }}</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button type="text" @click.stop="handleEdit(scope.row)">
                  编辑
                </el-button>
                <el-button type="text" @click.stop="handleUpdate(scope.row)">
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
          <el-form-item label="包类型" label-width="100px">
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

          <el-form-item label="包名称" label-width="100px">
            <el-input
              v-model="addPackDialogForm.name"
              autocomplete="off"
            ></el-input>
          </el-form-item>

          <el-form-item
            label="AID"
            label-width="100px"
            v-if="addPackDialogForm.type == '1'"
          >
            <el-input
              v-model="addPackDialogForm.aid"
              autocomplete="off"
            ></el-input>
          </el-form-item>

          <el-form-item
            label="组件包路径"
            label-width="100px"
            v-if="addPackDialogForm.type == '1'"
          >
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

          <el-form-item
            label="资源包路径"
            label-width="100px"
            v-if="addPackDialogForm.type == '1'"
          >
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

          <el-form-item
            label="基础包路径"
            label-width="100px"
            v-if="addPackDialogForm.type == '0'"
          >
            <el-input
              v-model="addPackDialogForm.path"
              autocomplete="off"
              disabled
            >
              <el-button
                slot="append"
                icon="el-icon-folder-opened"
                @click.stop="addPackagePath('path')"
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
const path = window.require("path");
export default {
  data() {
    return {
      addPackDialog: false, // 添加包弹窗状态
      addPackDialogForm: {
        name: "", // 分类名称
        type: "", // 分类类型
        cpath: "", // 分类组件包路径
        spath: "", // 分类资源包路径
        path: "", // 基础包路径
        aid: "", // 分类id
      }, // 添加包选项
      packages: [], // 包列表
      packageTypes: [
        { value: "0", label: "基础包" },
        { value: "1", label: "分类包" },
        // { value: 2, label: "资源包" },
      ], // 包类型列表
    };
  },
  filters: {
    filterType(val) {
      return val == "0" ? "基础包" : "分类包";
    },
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
        type: "",
        cpath: "",
        spath: "",
        path: "",
        aid: "",
      };
    },
    // 添加包
    async addPackage() {
      if (this.addPackDialogForm.name.trim() == "") {
        return this.$message.warning("请填写包名");
      }
      if ((this.addPackDialogForm.type + "").trim() == "") {
        return this.$message.warning("请选择类型");
      }
      if (this.addPackDialogForm.type == "0") {
        if (this.addPackDialogForm.path.trim() == "") {
          return this.$message.warning("请选择包地址");
        }
        let pack = await this.$db.package.get({
          path: this.addPackDialogForm.path.trim(),
        });
        if (pack) return this.$message.warning("该包已存在,请勿重复添加");
      }
      if (this.addPackDialogForm.type == "1") {
        if (this.addPackDialogForm.aid.trim() == "") {
          return this.$message.warning("请填写aid");
        }
        let pack = await this.$db.package.get({
          aid: this.addPackDialogForm.aid.trim(),
        });
        if (pack) return this.$message.warning("该包已存在,请勿重复添加");
      }
      await this.$db.package.add({
        name: this.addPackDialogForm.name.trim(),
        path: this.addPackDialogForm.path.trim(),
        cpath: this.addPackDialogForm.cpath.trim(),
        spath: this.addPackDialogForm.spath.trim(),
        type: this.addPackDialogForm.type.trim(),
        aid: this.addPackDialogForm.aid.trim(),
      });
      this.closeAddPackDialog();
      this.getPackageData();
    },
    // 编辑
    handleEdit(obj) {
      console.log(obj);
    },
    // 更新
    handleUpdate(obj) {
      if (obj.type == "0") {
        this.updateBasic(obj);
      } else {
        this.updateCategory(obj);
      }
    },
    // 更新底包
    updateBasic(obj) {
      console.log(obj);
      if (!obj.path) return this.$message.warning("未绑定路径");
      if (!this.validatePath(obj.path)) {
        return this.$message.warning("无效的路径");
      }
      ipcRenderer
        .invoke("compress-folder-list", [obj.path])
        .then(async (res) => {
          console.log("压缩结果", res);
          const result = await this.uploadZip(res[0]);
          console.log("result", result);
          if (result.code == 0) {
            this.updateBasicInfo(result.data.id);
          } else {
            this.$message.warning("压缩包上传失败");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 更新基础包信息
    updateBasicInfo(fileId) {
      console.log("什么情况????", fileId);
      console.log("this.$store.getters.uid", this.$store.getters.uid);
      let data = {
        base_type: 0,
        version: "2.0.0",
        create_uid: this.$store.getters.uid,
        file: fileId,
        incremental_file: fileId,
      };
      console.log("???");
      this.$api
        .updateBasice(data)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.error("底包更新失败", err);
        });
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
    handleDel() {},
    // 校验路径是否存在
    validatePath(path) {
      return fs.existsSync(path);
    },
    // 一键上传所有包
    uploadAllZip() {},
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
