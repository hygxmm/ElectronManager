import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: null,
  },
  mutations: {
    // 初始化APP
    initApp(state) {
      let userInfo = JSON.parse(localStorage.getItem('USERINFO'));
      if (userInfo) {
        state.userInfo = userInfo;
      }
    },
    // 登录
    login(state, data) {
      state.userInfo = data;
      localStorage.setItem('USERINFO', JSON.stringify(data));
    },
    // 注销
    logout(state) {
      state.userInfo = null;
      localStorage.removeItem('USERINFO');
      router.push({ path: '/login' })
    }
  },
  getters: {
    isLogin: state => {
      return state.userInfo ? true : false;
    },
    uid: state => {
      return state.userInfo ? state.userInfo.id : '';
    },
    username: state => {
      return state.userInfo ? state.userInfo.nickname : '';
    },
    userAvatar: state => {
      return state.userInfo ? state.userInfo.avatar : '';
    },
    token: state => {
      return state.userInfo ? state.userInfo.user_token : null;
    }
  },
})
