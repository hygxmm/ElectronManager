<template>
  <div class="my-project-page">
    <div class="project-page-container">
      <!-- 头部操作区 -->
      <div class="header">
        <el-button
          type="primary"
          size="small"
          @click="dialogFormVisible = true"
        >
          新建项目
        </el-button>
      </div>
      <!-- 表格 -->
      <div class="main-container">
        <div class="container-table">
          <el-table :data="projects" stripe border height="100%">
            <el-table-column prop="aid" label="ID" width="50">
            </el-table-column>
            <el-table-column label="名称" width="180">
              <template slot-scope="scope">
                <span
                  class="table-name"
                  @click.stop.prevent="handlePreview(scope.row)"
                >
                  {{ scope.row.name }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="path" label="地址"> </el-table-column>
            <el-table-column prop="type" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag size="small" v-if="scope.row.type == 1" type="success"
                  >有效</el-tag
                >
                <el-tag size="small" v-if="scope.row.type == 0" type="danger"
                  >无效</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click.stop.prevent="handlePreview(scope.row)"
                  >查看</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  @click="handleUpdate(scope.row)"
                  >更新</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  @click="handleRemove(scope.row.id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <!-- 创建项目弹窗 -->
    <el-dialog title="新建项目" :visible.sync="dialogFormVisible" width="600px">
      <el-form ref="projectForm" :model="createProjectData">
        <el-form-item label="项目名称" label-width="80px">
          <el-input
            v-model="createProjectData.name"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="项目地址" label-width="80px">
          <div>{{ createProjectData.path }}</div>
          <el-button type="primary" @click="chooseProject">选择项目</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="createProject">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 项目预览 -->
    <el-dialog
      :title="previewTitle"
      :visible.sync="previewVisible"
      width="600px"
    >
      <div class="preview-dialog-head">
        <div class="head-left">
          <el-input
            class="w-260 mr-10"
            v-model="pageKeyword"
            placeholder="请输入要搜索的页面名称或路径"
            @change="handleSearchPage"
          ></el-input>
          <el-button type="primary" @click="handleSearchPage">
            搜索
          </el-button>
        </div>
        <el-button type="primary" @click="importProjectPage">
          导入页面
        </el-button>
      </div>
      <el-table :data="previewData" max-height="500">
        <el-table-column
          property="aid"
          label="页面ID"
          width="80"
        ></el-table-column>
        <el-table-column property="name" label="名称"></el-table-column>
        <el-table-column property="path" label="路径"></el-table-column>
        <el-table-column property="path" label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="text" @click="updatePage(scope.row)">
              更新
            </el-button>
            <el-button type="text" @click="delPage(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
const fs = window.require("fs");
const path = window.require("path");
const { ipcRenderer } = window.require("electron");
const { dialog } = window.require("electron").remote;
export default {
  data() {
    return {
      projects: [],
      keywords: "",
      dialogFormVisible: false, // 创建项目弹窗状态
      previewVisible: false, // 预览项目弹窗状态
      previewId: "", // 预览项目ID
      previewTitle: "", // 预览项目页面数据
      previewPath: "", // 预览项目路径
      previewData: [],
      createProjectData: {
        name: "",
        path: "",
      },
      count: 0,
      pageKeyword: "", // 页面搜索关键字
      cachePages: [],
    };
  },
  computed: {
    isLogin() {
      return this.$store.getters.isLogin;
    },
  },
  watch: {
    previewVisible(val) {
      if (!val) {
        this.pageKeyword = "";
      }
    },
  },
  methods: {
    // 获取本地存储的项目列表
    async getProjects() {
      const projects = await this.$db.project.orderBy("id").toArray();
      console.log("projects", projects);
      if (projects.length != 0) {
        this.projects = projects;
      }
    },
    // 选择项目
    chooseProject() {
      const dirPath = dialog.showOpenDialogSync({
        title: "选择文件夹",
        properties: ["openDirectory"],
      });
      if (dirPath && dirPath[0]) {
        console.log("dirPath", dirPath);
        this.createProjectData.path = dirPath[0];
      }
    },
    // 创建项目
    async createProject() {
      if (!this.createProjectData.name.trim()) {
        this.$message.error("请输入项目名称");
        this.createProjectData.name = "";
        return;
      }
      if (!this.createProjectData.path.trim()) {
        this.$message.error("请选择项目路径");
        this.createProjectData.path = "";
        return;
      }
      let _project = await this.$db.project.get({
        path: this.createProjectData.path,
      });
      if (_project) return this.$message.warning("该项目地址已存在");
      await this.$db.project.add({
        name: this.createProjectData.name,
        path: this.createProjectData.path,
        type: 1,
        createTime: new Date().toLocaleString("chinese", { hour12: false }),
        updateTime: new Date().toLocaleString("chinese", { hour12: false }),
      });
      this.dialogFormVisible = false;
      this.$message.success("新增成功");
      this.createProjectData.name = "";
      this.createProjectData.path = "";
      this.getProjects();
    },
    // 查看项目
    handlePreview(project) {
      this.previewId = project.id;
      this.previewPath = project.path;
      this.previewData = project.pages || [];
      this.cachePages = project.pages || [];
      this.previewTitle = project.name + " ( " + this.cachePages.length + " )";
      this.previewVisible = true;
    },
    // 更新项目
    handleUpdate(project) {
      this.previewId = project.id;
      this.previewTitle = project.name + " ( " + this.cachePages.length + " )";
      this.previewPath = project.path;
      this.previewData = project.pages || [];
      this.updateProjectPage();
    },
    // 删除项目
    handleRemove(id) {
      this.$confirm("此操作将永久删除该项目, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            await this.$db.project.delete(id);
            let _index = this.projects.findIndex((ele) => ele.id == id);
            this.projects.splice(_index, 1);
            this.$message({
              type: "success",
              message: "删除成功!",
            });
          } catch (error) {
            this.$message({
              type: "danger",
              message: "数据库操作失败!",
            });
            console.log("ERROR", error);
          }
        })
        .catch(() => {});
    },
    // 导入项目关联页面
    async importProjectPage() {
      let filePath = dialog.showOpenDialogSync({
        title: "选择文件",
        properties: ["openFile"],
      });
      if (filePath) {
        filePath = filePath[0];
        if (path.extname(filePath) === ".json") {
          let pages = fs.readFileSync(filePath, "utf8");
          pages = JSON.parse(pages);
          await this.$db.project.update(this.previewId, { pages });
          const newProject = await this.$db.project.get({ id: this.previewId });
          this.previewData = newProject.pages;
          this.previewTitle =
            newProject.name + " ( " + newProject.pages.length + " )";
          this.getProjects();
        } else {
          this.$message.warning("不正确的文件格式");
        }
      }
    },
    // 一键更新
    async updateProjectPage() {
      this.count = 0;
      this.previewVisible = false;
      if (!this.isLogin) {
        this.$message.error("请先登录");
        this.$router.push({ path: "/login" });
      }
      this.previewData.forEach((item) => {
        this.updatePage(item);
      });
    },
    // 更新页面
    async updatePage(pageData) {
      this.loading = this.$loading({
        lock: true,
        text: "更新中...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.65)",
      });
      let tag = path.sep;
      let _path = this.previewPath + tag + pageData.path;
      // 判断地址是否存在
      // 判断地址是否是文件夹
      // 判断是否已经有zip包了
      let exists = fs.existsSync(_path); // 路径是否存在
      if (exists) {
        let isDir = fs.statSync(_path).isDirectory(); // 是否是文件夹
        if (isDir) {
          let zipExists = fs.existsSync(_path + ".zip");
          if (zipExists) {
            // 如果已经有了压缩包,先删除压缩包
            fs.unlinkSync(_path + ".zip");
          }
          ipcRenderer
            .invoke("compress-folder", _path)
            .then((res) => {
              this.uploadZip(pageData.aid, res);
            })
            .catch((err) => {
              console.log("ERROR", err);
            });
        }
      } else {
        console.log("无效的路径", _path);
      }
      this.loading.close();
    },
    // 上传压缩包
    uploadZip(pageId, filePath) {
      let buffer = fs.readFileSync(filePath);
      const file = new File([buffer], filePath);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("module", "mkh");
      formData.append("dir", "files");
      this.$api
        .uploadFile(formData, () => {})
        .then((res) => {
          // console.log("上传压缩包", res);
          if (res.msg == "上传成功") {
            this.updatePageData(pageId, res.data.id, filePath);
          } else {
            console.log(filePath, "上传失败");
            this.$message.error(res.msg);
          }
        })
        .catch((err) => {
          this.loading && this.loading.close();
          this.$message.error(err.msg);
        });
    },
    // 更新页面数据
    updatePageData(pageId, fileId, filePath) {
      this.$api
        .updatePage({
          aid: pageId,
          file_id: fileId,
        })
        .then((res) => {
          // console.log("更新文件", res);
          this.loading && this.loading.close();
          if (res.code == 1) {
            this.$message.success(res.msg);
            this.count++;
            fs.unlinkSync(filePath);
            console.log("更新成功" + this.count + "页面");
          } else {
            this.$notify.error({
              title: "错误",
              message: res.msg,
            });
          }
        })
        .catch((err) => {
          this.loading.close();
        });
    },
    handleSearchPage() {
      let _key = this.pageKeyword;
      if (_key == "") {
        this.previewData = this.cachePages;
      } else {
        let _list = this.cachePages.filter(
          (item) =>
            item.name.indexOf(_key) != -1 || item.path.indexOf(_key) != -1
        );
        this.previewData = _list;
      }
    },
  },
  created() {
    this.getProjects();
  },
};
</script>

<style lang="scss" scoped>
.my-project-page {
  height: 100%;
  padding: 20px;
  background-color: #f8f8f8;
  box-sizing: border-box;
  .project-page-container {
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    padding: 20px;
    box-sizing: border-box;
  }
  .header {
    height: 50px;
  }
  .main-container {
    height: calc(100% - 50px);
    position: relative;
    .container-table {
      width: 100%;
      height: 100%;
      position: absolute;
    }
  }
  .table-name {
    color: #409eff;
    margin-left: 10px;
    cursor: pointer;
  }
}
.item-body {
  display: flex;
  height: 100%; // 此高度必须，否则table-father的高度为0，border无效
  .table-father {
    flex: 1;
    border-right: 1px solid #eee;
    position: relative; // table的直接父元素加position属性
    .el-table {
      // table 加position属性
      position: absolute;
    }
  }
}
.preview-dialog-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .head-left {
    flex: 1;
  }
}
.w-260 {
  width: 260px;
}
.mr-10 {
  margin-right: 10px;
}
</style>
