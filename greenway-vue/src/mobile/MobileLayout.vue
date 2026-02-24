<template>
  <div class="mobile-app">
    <!-- 启动屏 -->
    <SplashScreen v-if="showSplash" @finish="handleSplashFinish" />

    <!-- 主内容 -->
    <div v-else class="app-content">
      <router-view />
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
</style>
