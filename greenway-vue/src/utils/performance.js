/**
 * 性能优化工具函数
 */

/**
 * 节流函数 - 限制函数执行频率
 * @param {Function} func - 要节流的函数
 * @param {number} wait - 等待时间(毫秒)
 * @returns {Function} 节流后的函数
 */
export function throttle(func, wait = 100) {
  let timeout = null
  let previous = 0

  return function(...args) {
    const now = Date.now()
    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(this, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(this, args)
      }, remaining)
    }
  }
}

/**
 * 防抖函数 - 延迟执行函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间(毫秒)
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait = 300) {
  let timeout = null

  return function(...args) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

/**
 * requestAnimationFrame节流
 * @param {Function} func - 要执行的函数
 * @returns {Function} RAF节流后的函数
 */
export function rafThrottle(func) {
  let rafId = null
  let pending = false

  return function(...args) {
    if (pending) return

    pending = true
    rafId = requestAnimationFrame(() => {
      func.apply(this, args)
      pending = false
    })
  }
}

/**
 * 性能监控
 * @param {string} markName - 标记名称
 */
export function performanceMark(markName) {
  if (window.performance && window.performance.mark) {
    window.performance.mark(markName)
  }
}

/**
 * 测量性能
 * @param {string} measureName - 测量名称
 * @param {string} startMark - 开始标记
 * @param {string} endMark - 结束标记
 * @returns {number} 持续时间(毫秒)
 */
export function performanceMeasure(measureName, startMark, endMark) {
  if (window.performance && window.performance.measure) {
    try {
      window.performance.measure(measureName, startMark, endMark)
      const entries = window.performance.getEntriesByName(measureName)
      if (entries.length > 0) {
        return entries[0].duration
      }
    } catch (e) {
      console.warn('Performance measurement failed:', e)
    }
  }
  return 0
}

/**
 * 批量操作优化 - 使用 requestIdleCallback
 * @param {Function} task - 要执行的任务
 * @param {Object} options - 选项
 */
export function scheduleIdleTask(task, options = {}) {
  const { timeout = 1000 } = options

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(task, { timeout })
    return {
      cancel: () => {
        if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
          window.cancelIdleCallback(handle)
        }
      }
    }
  }

  const timer = setTimeout(task, timeout)
  return {
    cancel: () => clearTimeout(timer)
  }
}

/**
 * 图像懒加载优化
 * @param {HTMLImageElement} img - 图片元素
 * @param {string} src - 图片源
 */
export function lazyLoadImage(img, src) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = src
          observer.unobserve(img)
        }
      })
    })
    observer.observe(img)
  } else {
    img.src = src
  }
}

/**
 * 内存优化 - 清理不用的对象引用
 * @param {Object} obj - 要清理的对象
 */
export function clearObjectReferences(obj) {
  if (!obj || typeof obj !== 'object') return

  Object.keys(obj).forEach(key => {
    delete obj[key]
  })
}

/**
 * FPS监控
 */
export class FPSMonitor {
  constructor() {
    this.fps = 60
    this.lastTime = performance.now()
    this.frameCount = 0
    this.running = false
  }

  start(callback) {
    this.running = true
    this.lastTime = performance.now()
    this.frameCount = 0
    this.loop(callback)
  }

  loop(callback) {
    if (!this.running) return

    this.frameCount++
    const currentTime = performance.now()

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
      this.frameCount = 0
      this.lastTime = currentTime

      if (callback) {
        callback(this.fps)
      }
    }

    requestAnimationFrame(() => this.loop(callback))
  }

  stop() {
    this.running = false
  }

  getFPS() {
    return this.fps
  }
}
