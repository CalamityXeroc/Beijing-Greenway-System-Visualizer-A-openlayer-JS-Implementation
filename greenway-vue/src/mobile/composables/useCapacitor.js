import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

/**
 * 检查是否在原生平台上运行
 */
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform()
}

/**
 * 获取当前位置
 * @returns {Promise<{lat: number, lng: number, accuracy: number}>}
 */
export const getCurrentLocation = async () => {
  try {
    if (!isNativePlatform()) {
      // Web平台降级到浏览器地理位置API
      return await getBrowserLocation()
    }

    // 原生平台使用Capacitor Geolocation
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })

    return {
      lat: coordinates.coords.latitude,
      lng: coordinates.coords.longitude,
      accuracy: coordinates.coords.accuracy,
      altitude: coordinates.coords.altitude,
      altitudeAccuracy: coordinates.coords.altitudeAccuracy,
      heading: coordinates.coords.heading,
      speed: coordinates.coords.speed,
      timestamp: coordinates.timestamp
    }
  } catch (error) {
    console.error('获取位置失败:', error)
    throw error
  }
}

/**
 * 浏览器地理位置API
 * @returns {Promise<{lat: number, lng: number, accuracy: number}>}
 */
export const getBrowserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理位置功能'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        })
      },
      (error) => {
        reject(new Error(`浏览器地理位置错误: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

/**
 * 监听位置变化
 * @param {Function} callback - 位置更新回调函数
 * @returns {string} 监听ID，用于停止监听
 */
export const watchLocation = (callback) => {
  if (!isNativePlatform()) {
    // Web平台使用浏览器API
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        console.error('监听位置变化失败:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
    return `web-${watchId}`
  }

  // 原生平台暂不支持watchPosition，使用定时器模拟
  const intervalId = setInterval(async () => {
    try {
      const location = await getCurrentLocation()
      callback(location)
    } catch (error) {
      console.error('监听位置变化出错:', error)
    }
  }, 5000) // 每5秒更新一次

  return `native-${intervalId}`
}

/**
 * 停止监听位置变化
 * @param {string} watchId - 监听ID
 */
export const clearWatch = (watchId) => {
  if (watchId.startsWith('web-')) {
    const id = parseInt(watchId.split('-')[1])
    navigator.geolocation.clearWatch(id)
  } else if (watchId.startsWith('native-')) {
    const id = parseInt(watchId.split('-')[1])
    clearInterval(id)
  }
}

/**
 * 设置状态栏样式
 */
export const setupStatusBar = async () => {
  if (!isNativePlatform()) return

  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#1a5c20' })
    await StatusBar.setOverlaysWebView({ overlay: false })
  } catch (error) {
    console.warn('设置状态栏失败:', error)
  }
}

/**
 * 隐藏启动屏
 */
export const hideSplashScreen = async () => {
  try {
    await SplashScreen.hide({ fadeOutDuration: 300 })
  } catch (error) {
    console.log('SplashScreen not available on web')
  }
}

/**
 * 显示启动屏
 */
export const showSplashScreen = async () => {
  try {
    await SplashScreen.show({
      autoHide: false
    })
  } catch (error) {
    console.log('SplashScreen not available on web')
  }
}

/**
 * 获取应用信息
 */
export const getAppInfo = async () => {
  try {
    if (!isNativePlatform()) {
      // Web环境返回模拟信息
      return {
        appId: 'com.greenway.mobile',
        appName: '北京绿道',
        version: '1.0.0',
        build: '1',
        platform: 'web'
      }
    }
    const info = await App.getInfo()
    return {
      appId: info.id,
      appName: info.name,
      version: info.version,
      build: info.build,
      platform: Capacitor.getPlatform()
    }
  } catch (error) {
    console.warn('获取应用信息失败 (Web环境正常):', error.message)
    return null
  }
}

/**
 * 处理返回按钮（Android）
 */
export const setupBackButton = (callback) => {
  if (isNativePlatform()) {
    App.addListener('backButton', () => {
      callback()
    })
  }
}

/**
 * 处理应用恢复
 */
export const setupAppResume = (callback) => {
  if (isNativePlatform()) {
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        callback(true)
      }
    })
  }
}

/**
 * 检查权限
 */
export const checkLocationPermission = async () => {
  if (!isNativePlatform()) {
    return true // Web平台总是返回true
  }

  try {
    const permission = await Geolocation.checkPermissions()
    return permission.location === 'granted' || permission.location === 'prompt'
  } catch (error) {
    console.error('检查位置权限失败:', error)
    return false
  }
}

/**
 * 请求位置权限
 */
export const requestLocationPermission = async () => {
  if (!isNativePlatform()) {
    return true // Web平台总是返回true
  }

  try {
    const permission = await Geolocation.requestPermissions()
    return permission.location === 'granted'
  } catch (error) {
    console.error('请求位置权限失败:', error)
    return false
  }
}

/**
 * 初始化Capacitor
 */
export const initializeCapacitor = async () => {
  try {
    // 设置状态栏
    await setupStatusBar()

    // 初始化应用信息
    const appInfo = await getAppInfo()
    console.log('App Info:', appInfo)

    // 返回初始化结果
    return {
      isNative: isNativePlatform(),
      appInfo: appInfo
    }
  } catch (error) {
    console.error('Capacitor初始化失败:', error)
    return {
      isNative: false,
      appInfo: null
    }
  }
}

export default {
  isNativePlatform,
  getCurrentLocation,
  getBrowserLocation,
  watchLocation,
  clearWatch,
  setupStatusBar,
  hideSplashScreen,
  showSplashScreen,
  getAppInfo,
  setupBackButton,
  setupAppResume,
  checkLocationPermission,
  requestLocationPermission,
  initializeCapacitor
}
