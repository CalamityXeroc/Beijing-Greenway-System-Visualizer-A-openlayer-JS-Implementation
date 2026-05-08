<template>
  <div class="app-container">
    <!-- 移动端应用 -->
    <router-view v-if="isMobileRoute" />
    
    <!-- 桌面端应用 -->
    <div v-else class="desktop-app">

      <!-- 路由视图 -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <!-- AI 绿道助手浮窗（仅在地图界面显示） -->
      <AIChatbot v-if="showChatbot" />

      <!-- 页脚备案信息 -->
      <footer class="site-footer" v-if="showFooter">
        <div class="footer-inner">
          <p>© 2025-2026 北京绿道</p>
          <p>
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">京ICP备2025153719号-2</a>
          </p>
          <p class="beian-police">
            <img src="/备案图标.png" alt="公安备案" class="beian-icon">
            <a href="https://beian.mps.gov.cn/#/query/webSearch?code=11022902000516" target="_blank" rel="noopener noreferrer">京公网安备11022902000516号</a>
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useGlobalTheme } from '@/utils/useTheme'
import AIChatbot from '@/components/AIChatbot.vue'
import { useAdminAuth } from '@/stores/adminAuth'
import { 
  useMobileOptimization,
  disabledDoubleClickZoom,
  lazyLoadImages,
  getViewportSize,
  onOrientationChange,
  isMobileDevice
} from '@/utils/useMobileOptimization'

// 使用全局主题管理（供 useTheme 内部同步用）
const { theme } = useGlobalTheme()

// 获取当前路由
const route = useRoute()

// 仅在地图界面（绿道详情/总览页）显示 AI 助手
const showChatbot = computed(() => {
  const p = route.path
  return !p.startsWith('/mobile')
    && p !== '/'
    && p !== '/login'
    && p !== '/register'
    && !p.startsWith('/admin')
})

// 页脚备案信息：桌面端页面显示（首页已有独立 footer，不重复）
const showFooter = computed(() => {
  const p = route.path
  return !p.startsWith('/mobile') && !p.startsWith('/admin') && p !== '/'
})

// 获取移动端优化工具
const mobileOpt = useMobileOptimization()

// 设备信息
const isMobile = ref(false)
const viewportSize = ref({})

// 判断是否在移动端路由
const isMobileRoute = computed(() => route.path.startsWith('/mobile'))


// App 启动时向服务端验证管理员 token 有效性。
// 若 token 已过期或伪造，apiFetch 收到 401 会自动调用 clearSession()，
// 前台"进入后台"按钮随即消失，路由守卫也无法再通过。
const { apiFetch: adminApiFetch, isLoggedIn: adminIsLoggedIn } = useAdminAuth()
if (adminIsLoggedIn.value) {
  adminApiFetch('/api/admin/stats').catch(() => {
    // 401 已在 apiFetch 内处理（clearSession），其他错误（如后端未启动）静默忽略
  })
}

// 生命周期 - 初始化移动端优化
onMounted(() => {
  // 更新设备信息
  isMobile.value = mobileOpt.isMobile
  viewportSize.value = mobileOpt.viewport

  // 禁用双击缩放
  if (mobileOpt.isMobile) {
    disabledDoubleClickZoom()
  }

  // 启用懒加载
  lazyLoadImages()

  // 监听屏幕方向改变
  if (mobileOpt.isMobile) {
    onOrientationChange((orientation) => {
      console.log('[App] 设备方向改变:', orientation)
      viewportSize.value = getViewportSize()
    })
  }

  // 添加视口大小变化监听
  window.addEventListener('resize', () => {
    viewportSize.value = getViewportSize()
  })

  // 预加载关键资源（移动端优化）
  if (mobileOpt.isMobile && mobileOpt.networkType !== '4g') {
    console.log('[App] 检测到非4G网络，启用轻量级模式')
  }

  console.log('[App] 绿道系统 Vue 应用已启动')
  console.log('[App] 全局主题系统已初始化')
  console.log('[App] 移动端优化已启用', {
    isMobile: mobileOpt.isMobile,
    device: mobileOpt.isIOS ? 'iOS' : mobileOpt.isAndroid ? 'Android' : 'Desktop',
    viewport: viewportSize.value,
    network: mobileOpt.networkType
  })
})
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
  
  /* 移动端优化 */
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.desktop-app {
  width: 100%;
  min-height: 100vh;
  overflow: visible;
}

/* 页脚备案信息 */
.site-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-tertiary);
  line-height: 1.8;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
}
.site-footer p {
  margin: 2px 0;
}
.site-footer a {
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color 0.2s;
}
.site-footer a:hover {
  color: var(--theme-green, #4CAF50);
  text-decoration: underline;
}
.beian-police {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.beian-icon {
  width: 18px;
  height: 18px;
  vertical-align: middle;
  opacity: 0.75;
}
</style>

<!-- 全局夜间页面背景覆盖（非 scoped，避免详情页作用域问题） -->
<style>
[data-theme="night"] .greenroad-page,
[data-theme="night"] .beiyunhe-page,
[data-theme="night"] .wenyu-page,
[data-theme="night"] .huanerhuan-page,
[data-theme="night"] .liangmahe-page,
[data-theme="night"] .changying-page,
[data-theme="night"] .changping42-page,
[data-theme="night"] .lidu-page,
[data-theme="night"] .nansha-page,
[data-theme="night"] .aosen-page,
[data-theme="night"] .yingcheng-page,
[data-theme="night"] .sanshan-page,
[data-theme="night"] .chaoyang-page {
  background: var(--bg-primary, #1a1a1a) !important;
}
</style>
