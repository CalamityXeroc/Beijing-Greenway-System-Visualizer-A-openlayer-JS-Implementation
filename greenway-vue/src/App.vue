<template>
  <div class="app-container">
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
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGlobalTheme } from '@/utils/useTheme'

// 使用全局主题管理
const { theme, toggleTheme } = useGlobalTheme()

// 获取当前路由
const route = useRoute()

// 判断是否在主页面
const isHomePage = computed(() => route.path === '/')

console.log('[App] 绿道系统 Vue 应用已启动')
console.log('[App] 全局主题系统已初始化')
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.theme-switcher {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
}
</style>
