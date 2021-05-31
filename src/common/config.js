// const DEV = 'http://192.168.124.38:8888'; // 开发环境地址
const DEV = 'https://zhongtai.zhongbenruanjian.com'; // 开发环境地址
const PRODUCT = 'https://zhongtai.zhongbenruanjian.com'; // 生产环境地址
// 根据运行环境切换主域名
let DOMAIN = process.env.NODE_ENV === 'development' ? DEV : PRODUCT;

module.exports = {
    domain: DOMAIN, // 域名
    domainApi: DOMAIN + '/api/v1/', // api地址
}