import { ref, watch, onMounted } from 'vue'

/**
 * 判断北京时间是否为白天 (06:00-18:00)
 */
function isBeiJingDayTime(now = new Date()) {
  const beijingTime = new Date(now.getTime() + (8 - (-now.getTimezoneOffset() / 60)) * 3600000)
  const hour = beijingTime.getHours()
  return hour >= 6 && hour < 18
}

/**
 * 全局主题管理 composable
 * 控制整个应用的黑夜/白天模式
 */
export function useTheme() {
  const theme = ref('day')
  const isAutoMode = ref(false)
  let autoThemeTimer = null
  let initialized = false

  /**
   * 初始化主题
   */
  function initTheme() {
    if (initialized) return
    initialized = true
    // 检查 localStorage 中是否有用户的主题选择
    const userPref = localStorage.getItem('appTheme')
    const isLocked = sessionStorage.getItem('appThemeLock') === 'locked'

    let initialMode
    if (userPref && isLocked) {
      // 用户之前手动选择过，使用用户选择
      initialMode = userPref
      isAutoMode.value = false
      console.log(`[useTheme] 使用已保存的用户主题偏好: ${userPref}`)
    } else {
      // 使用北京时间自动判断
      initialMode = isBeiJingDayTime() ? 'day' : 'night'
      isAutoMode.value = !isLocked
      console.log(`[useTheme] 根据北京时间初始化主题: ${initialMode}`)
    }

    setTheme(initialMode, false)

    // 如果没有被锁定，启动自动切换
    if (!isLocked) {
      startAutoSwitch()
    }
  }

  /**
   * 设置主题
   */
  function setTheme(mode, isManual = false) {
    const validMode = mode === 'night' ? 'night' : 'day'
    theme.value = validMode

    // 修改 HTML 元素的 data-theme 属性
    document.documentElement.setAttribute('data-theme', validMode)
    console.log(`[useTheme] 主题已切换为: ${validMode}`)

    // 如果是用户手动切换
    if (isManual) {
      localStorage.setItem('appTheme', validMode)
      sessionStorage.setItem('appThemeLock', 'locked')  // 锁定只在当前会话生效，下次打开新页面恢复自动检测
      isAutoMode.value = false
      stopAutoSwitch()
      console.log(`[useTheme] 用户手动切换主题为: ${validMode}, 已停止自动切换`)
    }

    return validMode
  }

  /**
   * 切换主题 (调用时为手动切换)
   */
  function toggleTheme() {
    const newMode = theme.value === 'day' ? 'night' : 'day'
    return setTheme(newMode, true)
  }

  /**
   * 启动自动主题切换
   */
  function startAutoSwitch() {
    if (autoThemeTimer) {
      clearInterval(autoThemeTimer)
    }

    console.log('[useTheme] 启动自动主题切换 (每5分钟检查一次)')
    isAutoMode.value = true

    autoThemeTimer = setInterval(() => {
      // 检查是否被用户锁定
      if (sessionStorage.getItem('appThemeLock') === 'locked') {
        console.log('[useTheme] 自动切换已被用户锁定，停止检查')
        stopAutoSwitch()
        return
      }

      const shouldBeNight = !isBeiJingDayTime()
      const targetMode = shouldBeNight ? 'night' : 'day'

      if (targetMode !== theme.value) {
        setTheme(targetMode, false)
      }
    }, 5 * 60 * 1000) // 每 5 分钟检查一次
  }

  /**
   * 停止自动主题切换
   */
  function stopAutoSwitch() {
    if (autoThemeTimer) {
      clearInterval(autoThemeTimer)
      autoThemeTimer = null
      console.log('[useTheme] 已停止自动主题切换')
    }
    isAutoMode.value = false
  }

  /**
   * 重置为自动模式
   */
  function resetToAutoMode() {
    localStorage.removeItem('appTheme')
    sessionStorage.removeItem('appThemeLock')
    isAutoMode.value = true
    startAutoSwitch()
    const initialMode = isBeiJingDayTime() ? 'day' : 'night'
    setTheme(initialMode, false)
    console.log('[useTheme] 已重置为自动模式')
  }

  onMounted(() => {
    // 组件级使用时自动初始化；单例由 useGlobalTheme 直接调用 initTheme
    initTheme()
  })

  return {
    theme,
    isAutoMode,
    setTheme,
    toggleTheme,
    startAutoSwitch,
    stopAutoSwitch,
    resetToAutoMode,
    initTheme   // 供 useGlobalTheme 直接调用
  }
}

// 导出全局单例实例
let globalThemeInstance = null

export function useGlobalTheme() {
  if (!globalThemeInstance) {
    globalThemeInstance = useTheme()
    // 直接初始化，不依赖 onMounted（单例不一定在组件 setup 里调用）
    globalThemeInstance.initTheme()
  }
  return globalThemeInstance
}
