import { createRouter, createWebHistory } from 'vue-router'
import { isMobileDevice } from '@/utils/useMobileOptimization'
import { Capacitor } from '@capacitor/core'
import { useAdminAuth } from '@/stores/adminAuth'

// 使用各自独立的详情页面组件（不再使用统一模板）

const routes = [
  // 移动端路由
  {
    path: '/mobile',
    component: () => import('@/mobile/MobileLayout.vue'),
    meta: { title: '北京绿道 - 移动版' },
    children: [
      {
        path: '',
        redirect: '/mobile/discover'
      },
      {
        path: 'discover',
        name: 'MobileDiscover',
        component: () => import('@/mobile/views/DiscoverView.vue'),
        meta: { title: '发现' }
      },
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
      },
      {
        path: 'my-comments',
        name: 'MobileMyComments',
        component: () => import('@/mobile/views/MyCommentsView.vue'),
        meta: { title: '我的评论' }
      },
      {
        path: 'login',
        name: 'MobileLogin',
        component: () => import('@/mobile/views/LoginView.vue'),
        meta: { title: '登录' }
      },
      {
        path: 'register',
        name: 'MobileRegister',
        component: () => import('@/mobile/views/RegisterView.vue'),
        meta: { title: '注册' }
      },
      // 管理员功能（移动端）
      {
        path: 'admin',
        name: 'MobileAdmin',
        component: () => import('@/mobile/views/AdminHomeView.vue'),
        meta: { title: '管理中心', requiresAdmin: true }
      },
      {
        path: 'admin/users',
        name: 'MobileAdminUsers',
        component: () => import('@/mobile/views/AdminUsersView.vue'),
        meta: { title: '用户管理', requiresAdmin: true }
      },
      {
        path: 'admin/comments',
        name: 'MobileAdminComments',
        component: () => import('@/mobile/views/AdminCommentsView.vue'),
        meta: { title: '评论审核', requiresAdmin: true }
      },
      {
        path: 'settings',
        name: 'MobileSettings',
        component: () => import('@/mobile/views/SettingsView.vue'),
        meta: { title: '设置' }
      },
      {
        path: 'diagnostic',
        name: 'MobileDiagnostic',
        component: () => import('@/mobile/views/DiagnosticView.vue'),
        meta: { title: '网络诊断' }
      },
      {
        path: 'privacy',
        name: 'MobilePrivacy',
        component: () => import('@/mobile/views/PrivacyView.vue'),
        meta: { title: '隐私政策' }
      },
      {
        path: 'agreement',
        name: 'MobileAgreement',
        component: () => import('@/mobile/views/AgreementView.vue'),
        meta: { title: '用户协议' }
      },
      {
        path: 'feedback',
        name: 'MobileFeedback',
        component: () => import('@/mobile/views/FeedbackView.vue'),
        meta: { title: '意见反馈' }
      }
    ]
  },
  // 桌面端路由
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/views/LandingPage.vue'),
    meta: { title: '北京绿道信息系统 - 探索城市绿色廊道' }
  },
  {
    path: '/map',
    name: 'Home',
    component: () => import('@/views/GreenwayOverview.vue'),
    meta: { title: '北京绿道系统总览' }
  },
  {
    path: '/wenyu',
    name: 'WenyuDetail',
    component: () => import('@/views/WenyuDetail.vue'),
    meta: { title: '温榆河绿道详情', greenwayName: '温榆河' }
  },
  {
    path: '/huanerhuan',
    name: 'HuanerhuanDetail',
    component: () => import('@/views/HuanerhuanDetail.vue'),
    meta: { title: '环二环城市绿道详情', greenwayName: '环二环城市绿道' }
  },
  {
    path: '/liangmahe',
    name: 'LiangmaheDetail',
    component: () => import('@/views/LiangmaheDetail.vue'),
    meta: { title: '亮马河绿道详情', greenwayName: '亮马河绿道' }
  },
  {
    path: '/changying',
    name: 'ChangyingDetail',
    component: () => import('@/views/ChangyingDetail.vue'),
    meta: { title: '常营半马绿道详情', greenwayName: '常营半马绿道' }
  },
  {
    path: '/changping42',
    name: 'Changping42Detail',
    component: () => import('@/views/Changping42Detail.vue'),
    meta: { title: '昌平42绿道详情', greenwayName: '昌平42绿道' }
  },
  {
    path: '/lidu',
    name: 'LiduDetail',
    component: () => import('@/views/LiduDetail.vue'),
    meta: { title: '丽都商圈绿道详情', greenwayName: '丽都商圈绿道' }
  },
  {
    path: '/beiyunhe',
    name: 'BeiyunheDetail',
    component: () => import('@/views/BeiyunheDetail.vue'),
    meta: { title: '北运河绿道详情', greenwayName: '北运河绿道' }
  },
  {
    path: '/aosen',
    name: 'AosenDetail',
    component: () => import('@/views/AosenDetail.vue'),
    meta: { title: '奥林匹克森林公园绿道详情', greenwayName: '奥林匹克森林公园绿道' }
  },
  {
    path: '/yingcheng',
    name: 'YingchengDetail',
    component: () => import('@/views/YingchengDetail.vue'),
    meta: { title: '营城建都绿道详情', greenwayName: '营城建都绿道' }
  },
  {
    path: '/sanshan',
    name: 'SanshanDetail',
    component: () => import('@/views/SanshanDetail.vue'),
    meta: { title: '三山五园绿道详情', greenwayName: '三山五园' }
  },
  {
    path: '/chaoyang',
    name: 'ChaoyangDetail',
    component: () => import('@/views/ChaoyangDetail.vue'),
    meta: { title: '朝阳绿道详情', greenwayName: '朝阳绿道' }
  },
  {
    path: '/beiyi',
    name: 'BeiyiDetail',
    component: () => import('@/views/BeiyiDetail.vue'),
    meta: { title: '北翼山水绿道详情', greenwayName: '北翼山水绿道' }
  },
  {
    path: '/dongyi',
    name: 'DongyiDetail',
    component: () => import('@/views/DongyiDetail.vue'),
    meta: { title: '东翼大河绿道详情', greenwayName: '东翼大河绿道' }
  },
  {
    path: '/jiaoye',
    name: 'JiaoyeDetail',
    component: () => import('@/views/JiaoyeDetail.vue'),
    meta: { title: '郊野休闲环绿道详情', greenwayName: '郊野休闲环绿道' }
  },
  {
    path: '/nansha',
    name: 'NanshaDetail',
    component: () => import('@/views/NanshaDetail.vue'),
    meta: { title: '南沙绿道详情', greenwayName: '南沙绿道' }
  },
  {
    path: '/xiyi',
    name: 'XiyiDetail',
    component: () => import('@/views/XiyiDetail.vue'),
    meta: { title: '西翼山水绿道详情', greenwayName: '西翼山水绿道' }
  },
  {
    path: '/zhongxincheng',
    name: 'ZhongxinchengDetail',
    component: () => import('@/views/ZhongxinchengDetail.vue'),
    meta: { title: '中心城滨水绿道详情', greenwayName: '中心城滨水绿道' }
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
      },
      {
        path: 'ai-stats',
        name: 'AdminAiStats',
        component: () => import('@/views/admin/aistats/AiChatStats.vue'),
        meta: { title: 'AI对话分析', requiresAdmin: true }
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: () => import('@/views/admin/comments/AdminComments.vue'),
        meta: { title: '评论管理', requiresAdmin: true }
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
    next('/mobile/discover')
    return
  }

  next()
})

export default router
