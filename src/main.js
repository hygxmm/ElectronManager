import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import api from './common/api.js';
import Database from './common/database.js';
import './common/mixin.js';
import util from './common/utils.js';

Vue.use(ElementUI, { size: 'small' });
Vue.prototype.$api = api;
Vue.prototype.$util = util;
Vue.prototype.$db = Database;
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
