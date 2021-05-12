import Vue from "vue";
import router from '@/router/index.js';


Vue.mixin({
    methods: {
        // 页面跳转
        jumpTo(path, params) {
            if (!path) {
                router.go(-1);
            } else {
                if (params) {
                    router.push({ path, query: params });
                } else {
                    router.push({ path });
                }
            }
        }
    }
});
