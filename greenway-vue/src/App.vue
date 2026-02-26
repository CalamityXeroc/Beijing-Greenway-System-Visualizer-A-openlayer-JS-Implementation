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
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useGlobalTheme } from '@/utils/useTheme'
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
}
</style>
