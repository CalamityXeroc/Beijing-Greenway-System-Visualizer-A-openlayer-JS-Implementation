import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { CapacitorPlugin, initializeApp, setupAppListeners } from './utils/capacitorPlugin'
import { isMobileDevice } from './utils/useMobileOptimization'

// 导入全局样式
import './assets/main.css'

// 导入移动端设计系统
import './mobile/styles/design-system.css'

// ─── 提前同步初始化主题（在 Vue 挂载前执行，防止白屏闪烁）────────────────
;(function initThemeEarly() {
  const pref = localStorage.getItem('greenway-theme')
  let mode
  if (pref === 'light') {
    mode = 'day'
  } else if (pref === 'dark') {
    mode = 'night'
  } else {
    // auto: 根据北京时间 (06:00-18:00 = 白天)
    const hour = new Date().getHours()
    mode = (hour >= 6 && hour < 18) ? 'day' : 'night'
  }
  document.documentElement.setAttribute('data-theme', mode)
  document.documentElement.classList.add(mode === 'night' ? 'theme-dark' : 'theme-light')
  console.log(`[main] 早期主题初始化: ${mode} (pref=${pref})`)
})()
// ────────────────────────────────────────────────────────────────────────────

const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')

// 如果是移动设备，初始化Capacitor插件
if (isMobileDevice()) {
  app.use(CapacitorPlugin)
  
  // DOM挂载完成后初始化Capacitor
  setTimeout(() => {
    try {
      initializeApp()
      setupAppListeners()
      console.log('🔌 Capacitor 原生功能已初始化')
    } catch (error) {
      console.log('💡 Capacitor在Web环境可能不完全可用')
    }
  }, 500)
}

console.log('🌳 北京绿道系统 Vue 应用已启动')
console.log('📍 基于 Vue 3 + OpenLayers + OLTB 架构')
if (isMobileDevice()) {
  console.log('📱 移动端模式已启用')
}
