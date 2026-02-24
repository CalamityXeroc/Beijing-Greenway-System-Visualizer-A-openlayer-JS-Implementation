import { createRouter, createWebHistory } from 'vue-router'
import { isMobileDevice } from '@/utils/useMobileOptimization'
import { Capacitor } from '@capacitor/core'
import { useAdminAuth } from '@/stores/adminAuth'

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
  },
  // 管理端路由
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/AdminLogin.vue'),
    meta: { title: '管理员登录' }
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/dashboard/AdminDashboard.vue'),
        meta: { title: '数据概览', requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/users/AdminUsers.vue'),
        meta: { title: '用户管理', requiresAdmin: true }
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('@/views/admin/logs/AdminLogs.vue'),
        meta: { title: '系统日志', requiresAdmin: true }
      }
    ]
  },
  // 用户前台路由
  {
    path: '/login',
    name: 'UserLogin',
    component: () => import('@/views/UserLogin.vue'),
    meta: { title: '用户登录' }
  },
  {
    path: '/register',
    name: 'UserRegister',
    component: () => import('@/views/UserRegister.vue'),
    meta: { title: '用户注册' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 更新页面标题 + 原生App自动跳转移动端 + 管理端鉴权
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '北京绿道系统'

  // 管理端鉴权检查
  if (to.meta.requiresAdmin) {
    const { isLoggedIn } = useAdminAuth()
    if (!isLoggedIn.value) {
      next({ path: '/admin/login', query: { redirect: to.fullPath } })
      return
    }
  }

  // 在 Capacitor 原生 App 中，根路径自动跳转到移动端首页
  if (Capacitor.isNativePlatform() && to.path === '/') {
    next('/mobile/map')
    return
  }

  next()
})

export default router
