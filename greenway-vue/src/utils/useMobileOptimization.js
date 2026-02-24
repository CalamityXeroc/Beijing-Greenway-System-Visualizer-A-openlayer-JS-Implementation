/**
 * 移动端优化工具函数
 * 提供检测设备、处理触摸、性能监测等功能
 */

/**
 * 检测设备是否为移动设备
 * @returns {boolean}
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * 检测设备是否为iOS
 * @returns {boolean}
 */
export function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * 检测设备是否为Android
 * @returns {boolean}
 */
export function isAndroidDevice() {
  return /Android/.test(navigator.userAgent)
}

/**
 * 获取视口尺寸
 * @returns {Object} { width, height, isMobile }
 */
export function getViewportSize() {
  const width = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  )
  const height = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
  )

  return {
    width,
    height,
    isMobile: width <= 480,
    isTablet: width > 480 && width <= 768,
    isDesktop: width > 768,
    isLandscape: width > height,
    isPortrait: height > width
  }
}

/**
 * 添加触摸事件监听
 * @param {Element} element 
 * @param {Function} callback 
 */
export function addTouchListener(element, callback) {
  let startX = 0
  let startY = 0
  let startTime = 0

  element.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    startTime = Date.now()
  })

  element.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const endTime = Date.now()

    const diffX = endX - startX
    const diffY = endY - startY
    const duration = endTime - startTime

    callback({
      distanceX: diffX,
      distanceY: diffY,
      duration,
      direction: getSwipeDirection(diffX, diffY),
      isSwipe: Math.abs(diffX) > 50 || Math.abs(diffY) > 50
    })
  })
}

/**
 * 判断滑动方向
 * @param {number} distX 
 * @param {number} distY 
 * @returns {string} 'left' | 'right' | 'up' | 'down'
 */
export function getSwipeDirection(distX, distY) {
  if (Math.abs(distX) > Math.abs(distY)) {
    return distX > 0 ? 'right' : 'left'
  } else {
    return distY > 0 ? 'down' : 'up'
  }
}

/**
 * 防止默认触摸行为（用于地图拖拽等）
 * @param {Element} element 
 */
export function preventDefaultTouchBehavior(element) {
  element.addEventListener('touchmove', (e) => {
    e.preventDefault()
  }, { passive: false })
}

/**
 * 启用平滑滚动
 * @param {Element} element 
 */
export function enableSmoothScroll(element) {
  element.style.webkitOverflowScrolling = 'touch'
  element.addEventListener('scroll', () => {
    // iOS 滚动优化
  })
}

/**
 * 获取设备像素比
 * @returns {number}
 */
export function getDevicePixelRatio() {
  return window.devicePixelRatio || 1
}

/**
 * 从缓存中获取数据
 * @param {string} key 
 * @returns {any}
 */
export function getCachedData(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('获取缓存失败:', error)
    return null
  }
}

/**
 * 保存数据到缓存
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttl 缓存时间（毫秒）
 */
export function setCachedData(key, value, ttl = null) {
  try {
    const data = {
      value,
      timestamp: Date.now(),
      ttl
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('保存缓存失败:', error)
  }
}

/**
 * 检查缓存是否过期
 * @param {string} key 
 * @returns {boolean}
 */
export function isCacheExpired(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key))
    if (!data) return true
    if (!data.ttl) return false

    return Date.now() - data.timestamp > data.ttl
  } catch (error) {
    return true
  }
}

/**
 * 清空缓存
 * @param {string} key 
 */
export function clearCache(key) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('清除缓存失败:', error)
  }
}

/**
 * 防抖函数 - 用于移动端事件处理
 * @param {Function} func 
 * @param {number} delay 
 * @returns {Function}
 */
export function debounce(func, delay = 300) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * 节流函数 - 用于高频事件
 * @param {Function} func 
 * @param {number} limit 
 * @returns {Function}
 */
export function throttle(func, limit = 300) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 请求全屏（用于移动端沉浸式体验）
 * @param {Element} element 
 */
export function requestFullscreen(element = document.documentElement) {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  }
}

/**
 * 退出全屏
 */
export function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  }
}

/**
 * 获取网络连接状态
 * @returns {string} '4g' | '3g' | '2g' | 'wifi' | 'unknown'
 */
export function getNetworkType() {
  if (!navigator.connection) return 'unknown'

  const connection = navigator.connection
  const effectiveType = connection.effectiveType

  return effectiveType || connection.type
}

/**
 * 监听网络变化
 * @param {Function} callback 
 */
export function onNetworkChange(callback) {
  if (navigator.connection) {
    navigator.connection.addEventListener('change', () => {
      callback(getNetworkType())
    })
  }
}

/**
 * 获取电池状态
 * @returns {Promise<Object>}
 */
export async function getBatteryStatus() {
  if (navigator.getBattery) {
    return await navigator.getBattery()
  } else if (navigator.battery) {
    return navigator.battery
  }
  return null
}

/**
 * 检测屏幕锁定方向
 * @returns {string}
 */
export function getScreenOrientation() {
  if (window.screen.orientation) {
    return window.screen.orientation.type
  }
  return window.matchMedia('(orientation: portrait)').matches
    ? 'portrait'
    : 'landscape'
}

/**
 * 监听屏幕方向改变
 * @param {Function} callback 
 */
export function onOrientationChange(callback) {
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      callback(getScreenOrientation())
    }, 100)
  })
}

/**
 * 优化图片加载 - 懒加载
 * @param {string} selector 
 */
export function lazyLoadImages(selector = 'img[data-src]') {
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    document.querySelectorAll(selector).forEach((img) => {
      img.src = img.dataset.src
    })
    return
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.removeAttribute('data-src')
        observer.unobserve(img)
      }
    })
  })

  document.querySelectorAll(selector).forEach((img) => {
    imageObserver.observe(img)
  })
}

/**
 * 禁用双击缩放
 */
export function disabledDoubleClickZoom() {
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }, { passive: false })

  let lastTouchEnd = 0
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    },
    false
  )
}

/**
 * 检测是否支持 WebP
 * @returns {Promise<boolean>}
 */
export function supportsWebP() {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAAw='
  })
}

/**
 * Vue 3 组合函数 - 移动端优化
 * @returns {Object}
 */
export function useMobileOptimization() {
  return {
    isMobile: isMobileDevice(),
    isIOS: isIOSDevice(),
    isAndroid: isAndroidDevice(),
    viewport: getViewportSize(),
    networkType: getNetworkType(),
    orientation: getScreenOrientation(),
    debounce,
    throttle,
    getCachedData,
    setCachedData,
    lazyLoadImages,
    disabledDoubleClickZoom
  }
}

export default {
  isMobileDevice,
  isIOSDevice,
  isAndroidDevice,
  getViewportSize,
  addTouchListener,
  getSwipeDirection,
  preventDefaultTouchBehavior,
  enableSmoothScroll,
  getDevicePixelRatio,
  getCachedData,
  setCachedData,
  isCacheExpired,
  clearCache,
  debounce,
  throttle,
  requestFullscreen,
  exitFullscreen,
  getNetworkType,
  onNetworkChange,
  getBatteryStatus,
  getScreenOrientation,
  onOrientationChange,
  lazyLoadImages,
  disabledDoubleClickZoom,
  supportsWebP,
  useMobileOptimization
}
