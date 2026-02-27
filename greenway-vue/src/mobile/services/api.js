/**
 * 移动端 API 工具
 * 兼容 Capacitor AVD 环境（10.0.2.2:3001）和普通开发环境
 */

const getApiBaseUrl = () => {
  // 检查是否在 Android AVD 中运行
  if (typeof window !== 'undefined' && window.location.hostname === '10.0.2.2') {
    return 'http://10.0.2.2:3001'
  }
  // 其他环境使用相对路径（依靠 Vite 代理）
  return ''
}

/**
 * 获取绿道数据
 * @returns {Promise<Object>} GeoJSON FeatureCollection
 */
export const fetchGreenways = async () => {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}/api/greenways`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`)
  return res.json()
}

/**
 * 获取指定绿道详情
 * @param {string} name 绿道名称
 * @returns {Promise<Object>} GeoJSON FeatureCollection
 */
export const fetchGreenwayByName = async (name) => {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}/api/greenways?name=${encodeURIComponent(name)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`)
  return res.json()
}

/**
 * 检查后端健康状态
 * @returns {Promise<boolean>}
 */
export const checkBackendHealth = async () => {
  try {
    const baseUrl = getApiBaseUrl()
    const url = `${baseUrl}/health`
    const res = await fetch(url, { method: 'GET', timeout: 5000 })
    return res.ok
  } catch {
    return false
  }
}
