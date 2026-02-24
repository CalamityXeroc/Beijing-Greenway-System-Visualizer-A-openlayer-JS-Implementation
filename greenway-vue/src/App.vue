<template>
  <div class="app-container">
    <!-- 移动端应用 -->
    <router-view v-if="isMobileRoute" />
    
    <!-- 桌面端应用 -->
    <div v-else class="desktop-app">
      <!-- 主题切换按钮 - 仅在主页面显示 -->
      <div v-if="isHomePage" class="theme-switcher">
        <button 
          class="theme-btn"
          @click="toggleTheme"
          :title="theme === 'day' ? '切换到夜间模式' : '切换到日间模式'"
        >
          <i :class="theme === 'day' ? 'fas fa-moon' : 'fas fa-sun'"></i>
        </button>
      </div>

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
import { 
  useMobileOptimization,
  disabledDoubleClickZoom,
  lazyLoadImages,
  getViewportSize,
  onOrientationChange,
  isMobileDevice
} from '@/utils/useMobileOptimization'

// 使用全局主题管理
const { theme, toggleTheme } = useGlobalTheme()

// 获取当前路由
const route = useRoute()

// 获取移动端优化工具
const mobileOpt = useMobileOptimization()

// 设备信息
const isMobile = ref(false)
const viewportSize = ref({})

// 判断是否在移动端路由
const isMobileRoute = computed(() => route.path.startsWith('/mobile'))

// 判断是否在主页面
const isHomePage = computed(() => route.path === '/')

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
  overflow-x: hidden;
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

.theme-switcher {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
  
  /* iOS安全区域处理 */
  top: max(20px, env(safe-area-inset-top));
  left: max(20px, env(safe-area-inset-left));
}
</style>
