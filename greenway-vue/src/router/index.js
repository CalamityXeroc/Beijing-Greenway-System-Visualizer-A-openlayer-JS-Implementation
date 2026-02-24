import { createRouter, createWebHistory } from 'vue-router'
import { isMobileDevice } from '@/utils/useMobileOptimization'
import { Capacitor } from '@capacitor/core'

const routes = [
  // 移动端路由
  {
    path: '/mobile',
    component: () => import('@/mobile/MobileLayout.vue'),
    meta: { title: '北京绿道 - 移动版' },
    children: [
      {
        path: 'map',
        name: 'MobileMap',
        component: () => import('@/mobile/views/MapView.vue'),
        meta: { title: '地图' }
      },
      {
        path: 'list',
        name: 'MobileList',
        component: () => import('@/mobile/views/ListView.vue'),
        meta: { title: '绿道列表' }
      },
      {
        path: 'detail/:id',
        name: 'MobileDetail',
        component: () => import('@/mobile/views/DetailView.vue'),
        meta: { title: '绿道详情' }
      },
      {
        path: 'favorites',
        name: 'MobileFavorites',
        component: () => import('@/mobile/views/FavoritesView.vue'),
        meta: { title: '我的收藏' }
      },
      {
        path: 'profile',
        name: 'MobileProfile',
        component: () => import('@/mobile/views/ProfileView.vue'),
        meta: { title: '个人中心' }
      }
    ]
  },
  // 桌面端路由
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
  },
  {
    path: '/sanshan',
    name: 'SanshanDetail',
    component: () => import('@/views/SanshanDetail.vue'),
    meta: { title: '三山五园绿道详情' }
  },
  {
    path: '/chaoyang',
    name: 'ChaoyangDetail',
    component: () => import('@/views/ChaoyangDetail.vue'),
    meta: { title: '朝阳绿道详情' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 更新页面标题 + 原生App自动跳转移动端
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '北京绿道系统'

  // 在 Capacitor 原生 App 中，根路径自动跳转到移动端首页
  if (Capacitor.isNativePlatform() && to.path === '/') {
    next('/mobile/map')
    return
  }

  next()
})

export default router
