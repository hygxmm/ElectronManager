import axios from './request.js';

export default {
    // 登录
    login(data) {
        return axios.post('5e79a005764ee', data);
    },
    // 上传文件
    uploadFile(data, callback) {
        return axios.post(
            '5dde40ed4536c',
            data,
            { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: callback, }
        );
    },
    // 更新页面
    updatePage(data) {
        return axios.post('5fe1aaa5051c4', data);
    },
}