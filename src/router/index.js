import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: () => import('@/views/home.vue'),
    redirect: '/my-project',
    children: [
      {
        path: 'my-project',
        component: () => import('@/views/my-project.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue')
  },
  {
    path: '/404',
    component: () => import('@/views/404.vue')
  },
  {
    path: '*',
    redirect: '/404',
  }
]
console.log('BASE_URL', process.env);
const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

// router.beforeEach((to, from, next) => {
//   if (from.fullPath === to.fullPath) return;
//   let user = localStorage.getItem('USERINFO');
//   if (to.name !== 'login' && !user) {
//     next({ path: '/login' });
//   } else {
//     next();
//   }
// })

export default router
