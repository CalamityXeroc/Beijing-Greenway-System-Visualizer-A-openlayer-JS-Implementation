/**
 * Capacitor 本地功能集成
 * 提供原生功能的包装器
 */

import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Device } from '@capacitor/device'
import { Geolocation } from '@capacitor/geolocation'
import { Camera, CameraResultType } from '@capacitor/camera'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Network } from '@capacitor/network'

/**
 * 初始化移动应用
 */
export async function initializeApp() {
  try {
    // 设置状态栏
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#1a5c20' })
    
    console.log('[Capacitor] 移动应用初始化成功')
  } catch (error) {
    console.error('[Capacitor] 初始化失败:', error)
  }
}

/**
 * 获取设备信息
 * @returns {Promise<any>}
 */
export async function getDeviceInfo() {
  try {
    const info = await Device.getInfo()
    return {
      platform: info.platform,
      osVersion: info.operatingSystem + ' ' + info.osVersion,
      model: info.model,
      manufacturer: info.manufacturer,
      isVirtual: info.isVirtual
    }
  } catch (error) {
    console.error('[Capacitor] 获取设备信息失败:', error)
    return null
  }
}

/**
 * 获取我的位置
 * @returns {Promise<any>}
 */
export async function getCurrentLocation() {
  try {
    const coordinates = await Geolocation.getCurrentPosition()
    return {
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude,
      accuracy: coordinates.coords.accuracy,
      altitude: coordinates.coords.altitude,
      altitudeAccuracy: coordinates.coords.altitudeAccuracy,
      heading: coordinates.coords.heading,
      speed: coordinates.coords.speed
    }
  } catch (error) {
    console.error('[Capacitor] 获取位置失败:', error)
    return null
  }
}

/**
 * 监听位置变化
 * @param {Function} callback
 * @returns {string} watchId
 */
export function watchLocation(callback) {
  try {
    const watchId = Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      },
      (position, error) => {
        if (error) {
          console.error('[Capacitor] 位置更新错误:', error)
          return
        }
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      }
    )
    return watchId
  } catch (error) {
    console.error('[Capacitor] 监听位置失败:', error)
    return null
  }
}

/**
 * 停止监听位置
 * @param {string} watchId
 */
export async function stopWatchLocation(watchId) {
  try {
    if (watchId) {
      await Geolocation.clearWatch({ id: watchId })
    }
  } catch (error) {
    console.error('[Capacitor] 停止监听位置失败:', error)
  }
}

/**
 * 获取网络连接状态
 * @returns {Promise<any>}
 */
export async function getNetworkStatus() {
  try {
    const status = await Network.getStatus()
    return {
      connected: status.connected,
      connectionType: status.connectionType
    }
  } catch (error) {
    console.error('[Capacitor] 获取网络状态失败:', error)
    return { connected: false }
  }
}

/**
 * 监听网络变化
 * @param {Function} callback
 */
export function onNetworkStatusChange(callback) {
  try {
    Network.addListener('networkStatusChange', (status) => {
      callback({
        connected: status.connected,
        connectionType: status.connectionType
      })
    })
  } catch (error) {
    console.error('[Capacitor] 监听网络变化失败:', error)
  }
}

/**
 * 打开相机拍照
 * @returns {Promise<string>} base64格式的图片
 */
export async function takePhoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64
    })
    return image.base64String
  } catch (error) {
    console.error('[Capacitor] 拍照失败:', error)
    return null
  }
}

/**
 * 从相册选择图片
 * @returns {Promise<string>} base64格式的图片
 */
export async function pickPhoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: 'Photos'
    })
    return image.base64String
  } catch (error) {
    console.error('[Capacitor] 选择图片失败:', error)
    return null
  }
}

/**
 * 保存文件
 * @param {string} filename
 * @param {string} data
 * @param {string} directory
 * @returns {Promise<void>}
 */
export async function saveFile(filename, data, directory = Directory.Documents) {
  try {
    await Filesystem.writeFile({
      path: filename,
      data: data,
      directory: directory,
      encoding: Encoding.UTF8
    })
    console.log('[Capacitor] 文件已保存:', filename)
  } catch (error) {
    console.error('[Capacitor] 保存文件失败:', error)
  }
}

/**
 * 读取文件
 * @param {string} filename
 * @param {string} directory
 * @returns {Promise<string>}
 */
export async function readFile(filename, directory = Directory.Documents) {
  try {
    const content = await Filesystem.readFile({
      path: filename,
      directory: directory,
      encoding: Encoding.UTF8
    })
    return content.data
  } catch (error) {
    console.error('[Capacitor] 读取文件失败:', error)
    return null
  }
}

/**
 * 删除文件
 * @param {string} filename
 * @param {string} directory
 * @returns {Promise<void>}
 */
export async function deleteFile(filename, directory = Directory.Documents) {
  try {
    await Filesystem.deleteFile({
      path: filename,
      directory: directory
    })
    console.log('[Capacitor] 文件已删除:', filename)
  } catch (error) {
    console.error('[Capacitor] 删除文件失败:', error)
  }
}

/**
 * 处理应用配置（返回键等）
 */
export function setupAppListeners() {
  try {
    // 处理应用返回
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp()
      }
    })

    // 处理应用暂停/恢复
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        console.log('[Capacitor] 应用已恢复')
      } else {
        console.log('[Capacitor] 应用已暂停')
      }
    })
  } catch (error) {
    console.error('[Capacitor] 设置应用监听失败:', error)
  }
}

/**
 * Vue 3 插件 - 注册全局属性
 */
export function CapacitorPlugin(app) {
  app.config.globalProperties.$capacitor = {
    initializeApp,
    getDeviceInfo,
    getCurrentLocation,
    watchLocation,
    stopWatchLocation,
    getNetworkStatus,
    onNetworkStatusChange,
    takePhoto,
    pickPhoto,
    saveFile,
    readFile,
    deleteFile,
    setupAppListeners
  }
}

export default {
  initializeApp,
  getDeviceInfo,
  getCurrentLocation,
  watchLocation,
  stopWatchLocation,
  getNetworkStatus,
  onNetworkStatusChange,
  takePhoto,
  pickPhoto,
  saveFile,
  readFile,
  deleteFile,
  setupAppListeners,
  CapacitorPlugin
}
