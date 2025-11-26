import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/GreenwayOverview.vue'),
    meta: { title: '北京绿道系统总览' }
  },
  {
    path: '/wenyu',
    name: 'WenyuDetail',
    component: () => import('@/views/WenyuDetail.vue'),
    meta: { title: '温榆河绿道详情' }
  },
  {
    path: '/huanerhuan',
    name: 'HuanerhuanDetail',
    component: () => import('@/views/HuanerhuanDetail.vue'),
    meta: { title: '环二环城市绿道详情' }
  },
  {
    path: '/liangmahe',
    name: 'LiangmaheDetail',
    component: () => import('@/views/LiangmaheDetail.vue'),
    meta: { title: '亮马河绿道详情' }
  },
  {
    path: '/changying',
    name: 'ChangyingDetail',
    component: () => import('@/views/ChangyingDetail.vue'),
    meta: { title: '常营半马绿道详情' }
  },
  {
    path: '/changping42',
    name: 'Changping42Detail',
    component: () => import('@/views/Changping42Detail.vue'),
    meta: { title: '昌平42绿道详情' }
  },
  {
    path: '/lidu',
    name: 'LiduDetail',
    component: () => import('@/views/LiduDetail.vue'),
    meta: { title: '丽都商圈绿道详情' }
  },
  {
    path: '/beiyunhe',
    name: 'BeiyunheDetail',
    component: () => import('@/views/BeiyunheDetail.vue'),
    meta: { title: '北运河绿道详情' }
  },
  {
    path: '/nansha',
    name: 'NanshaDetail',
    component: () => import('@/views/NanshaDetail.vue'),
    meta: { title: '南沙绿道详情' }
  },
  {
    path: '/aosen',
    name: 'AosenDetail',
    component: () => import('@/views/AosenDetail.vue'),
    meta: { title: '奥林匹克森林公园绿道详情' }
  },
  {
    path: '/yingcheng',
    name: 'YingchengDetail',
    component: () => import('@/views/YingchengDetail.vue'),
    meta: { title: '营城建都绿道详情' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 更新页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '北京绿道系统'
  next()
})

export default router
