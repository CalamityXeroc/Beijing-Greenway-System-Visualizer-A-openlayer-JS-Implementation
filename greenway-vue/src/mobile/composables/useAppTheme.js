/**
 * 全局应用主题管理
 * 支持亮色/暗色切换，持久化到 localStorage
 * 在根元素上添加 .theme-light / .theme-dark 类
 */
import { ref, watch, onMounted } from 'vue'

const STORAGE_KEY = 'greenway-theme'

// 单例状态，跨组件共享
const isDark = ref(false)

const applyTheme = (dark) => {
  const root = document.documentElement
  if (dark) {
    root.classList.add('theme-dark')
    root.classList.remove('theme-light')
  } else {
    root.classList.add('theme-light')
    root.classList.remove('theme-dark')
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
}

const setTheme = (dark) => {
  isDark.value = dark
}

// 监听变化并持久化
watch(isDark, (val) => {
  applyTheme(val)
  try { localStorage.setItem(STORAGE_KEY, val ? 'dark' : 'light') } catch {}
})

export function useAppTheme() {
  // 初始化时读取存储或系统偏好
  const init = () => {
    let saved
    try { saved = localStorage.getItem(STORAGE_KEY) } catch {}
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      // 跟随系统
      isDark.value = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    }
    applyTheme(isDark.value)
  }

  return { isDark, toggleTheme, setTheme, init }
}
