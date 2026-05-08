/**
 * 全局应用主题管理（统一版本）
 * 兼容 `data-theme`（桌面）和 `.theme-light/.theme-dark`（移动端）两套机制
 * 支持 light / dark / auto（北京时间）三种模式
 * 持久化到 localStorage，统一使用 greenway-theme 一个 key
 */
import { ref, watch } from 'vue'
import { useGlobalTheme } from '@/utils/useTheme'

const STORAGE_KEY = 'greenway-theme'

// 单例状态，跨组件共享
const isDark = ref(false)
const isAuto = ref(false)
let autoTimer = null

/**
 * 判断北京时间是否为白天 (06:00-18:00)
 */
function isBeijingDay() {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18
}

/**
 * 同时设置 data-theme（桌面全局 CSS）和 class（移动端设计系统）
 */
function applyTheme(dark) {
  const root = document.documentElement
  const mode = dark ? 'night' : 'day'
  root.setAttribute('data-theme', mode)
  root.classList.add(dark ? 'theme-dark' : 'theme-light')
  root.classList.remove(dark ? 'theme-light' : 'theme-dark')
  // 同步桌面端主题系统
  try {
    localStorage.setItem('appTheme', mode)
    sessionStorage.removeItem('appThemeLock')
  } catch {}
}

function persistValue(val) {
  try {
    localStorage.setItem(STORAGE_KEY, val)
    // 同步桌面端主题
    const mode = val === 'dark' ? 'night' : 'day'
    localStorage.setItem('appTheme', mode)
    sessionStorage.removeItem('appThemeLock')
  } catch {}
}

function startAutoCheck() {
  stopAutoCheck()
  autoTimer = setInterval(() => {
    const shouldBeDark = !isBeijingDay()
    if (shouldBeDark !== isDark.value) {
      applyTheme(shouldBeDark)
      isDark.value = shouldBeDark
    }
  }, 5 * 60 * 1000)
}

function stopAutoCheck() {
  if (autoTimer) {
    clearInterval(autoTimer)
    autoTimer = null
  }
}

export function useAppTheme() {
  const init = () => {
    let saved
    try { saved = localStorage.getItem(STORAGE_KEY) } catch {}

    if (saved === 'dark') {
      isDark.value = true
      isAuto.value = false
      applyTheme(true)
      stopAutoCheck()
    } else if (saved === 'light') {
      isDark.value = false
      isAuto.value = false
      applyTheme(false)
      stopAutoCheck()
    } else {
      // auto 模式
      isAuto.value = true
      const dark = !isBeijingDay()
      isDark.value = dark
      applyTheme(dark)
      startAutoCheck()
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    isAuto.value = false
    stopAutoCheck()
    persistValue(isDark.value ? 'dark' : 'light')
    // 同步桌面端主题内部状态，让 TopNavbar 实时响应
    try {
      const { setTheme: setDesktopTheme } = useGlobalTheme()
      setDesktopTheme(isDark.value ? 'night' : 'day', true)
    } catch {}
  }

  const setTheme = (dark, auto = false) => {
    isDark.value = dark
    applyTheme(dark)
    if (auto) {
      isAuto.value = true
      startAutoCheck()
    } else {
      isAuto.value = false
      stopAutoCheck()
      persistValue(dark ? 'dark' : 'light')
    }
    // 同步桌面端主题内部状态
    try {
      const { setTheme: setDesktopTheme } = useGlobalTheme()
      setDesktopTheme(dark ? 'night' : 'day', true)
    } catch {}
  }

  // 监听变化并同步到 DOM
  watch(isDark, (val) => {
    applyTheme(val)
  })

  return { isDark, isAuto, init, toggleTheme, setTheme }
}
