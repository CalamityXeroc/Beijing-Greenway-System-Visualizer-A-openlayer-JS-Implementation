<template>
  <div class="mobile-app">
    <!-- 启动屏（带淡出过渡） -->
    <Transition name="splash-fade">
      <SplashScreen v-if="showSplash" @finish="handleSplashFinish" />
    </Transition>

    <!-- 主内容（带页面切换过渡） -->
    <div v-show="!showSplash" class="app-content">
      <router-view v-slot="{ Component }">
        <Transition name="page-slide" mode="out-in">
          <keep-alive include="DiscoverView,MapView,ListView,ProfileView">
            <component :is="Component" />
          </keep-alive>
        </Transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SplashScreen from './components/SplashScreen.vue'
import { initializeCapacitor } from './composables/useCapacitor'
import { useAppTheme } from './composables/useAppTheme'

const showSplash = ref(true)
const { init: initTheme, isDark } = useAppTheme()

const handleSplashFinish = () => {
  showSplash.value = false
}

onMounted(async () => {
  // 初始化主题（读取本地存储或系统偏好）
  initTheme()

  // 初始化 Capacitor 插件
  await initializeCapacitor()
})
</script>

<style scoped>
.mobile-app {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg);
  font-family: var(--font-sans);
}

.app-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ── 启动屏淡出过渡 ── */
.splash-fade-leave-active {
  transition: opacity 0.4s ease;
}
.splash-fade-leave-to {
  opacity: 0;
}

/* ── 页面切换过渡 ── */
.page-slide-enter-active,
.page-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s ease;
}
.page-slide-enter-from {
  transform: translateX(30px);
  opacity: 0;
}
.page-slide-leave-to {
  transform: translateX(-20px);
  opacity: 0.8;
}
</style>
