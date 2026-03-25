/**
 * 移动端 API 工具
 * 兼容 Capacitor AVD 环境（10.0.2.2:3001）和普通开发环境
 */

export const getApiBaseUrl = () => {
  // Capacitor 真机/模拟器：window.location 是 capacitor://localhost 或 http://localhost
  const isCapacitor = typeof window !== 'undefined' &&
    (window.Capacitor?.isNativePlatform?.() ||
     window.location.protocol === 'capacitor:' ||
     (window.location.protocol === 'http:' && window.location.hostname === 'localhost' && !import.meta.env.DEV))

  if (isCapacitor) {
    // 强制在这个开发阶段使用 10.0.2.2 (模拟器专属) 如果他在用模拟器
    // 但为了兼顾他手机测试的功能，用一个后备方案
    // 由于他目前说 "我正在用模拟器查看", 使用 10.0.2.2:3001
    return 'http://10.0.2.2:3001'
  }
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

function buildUrl(path) {
  const baseUrl = getApiBaseUrl()
  return `${baseUrl}${path}`
}

async function readJson(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`)
  }
  return data
}

export const fetchCommentsByGreenway = async (greenwayId, options = {}) => {
  const {
    sort = 'newest',
    page = 1,
    pageSize = 20,
    token = null
  } = options

  const params = new URLSearchParams({
    greenwayId: String(greenwayId),
    sort,
    page: String(page),
    pageSize: String(pageSize)
  })

  const res = await fetch(buildUrl(`/api/comments?${params.toString()}`), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  })

  return readJson(res)
}

export const createComment = async (payload, token) => {
  const res = await fetch(buildUrl('/api/comments'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  return readJson(res)
}

export const deleteComment = async (commentId, token) => {
  const res = await fetch(buildUrl(`/api/comments/${commentId}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return readJson(res)
}

export const likeComment = async (commentId, token) => {
  const res = await fetch(buildUrl(`/api/comments/${commentId}/like`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return readJson(res)
}

export const unlikeComment = async (commentId, token) => {
  const res = await fetch(buildUrl(`/api/comments/${commentId}/like`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return readJson(res)
}

export const fetchMyComments = async (token, page = 1, pageSize = 10) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize)
  })

  const res = await fetch(buildUrl(`/api/comments/me?${params.toString()}`), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return readJson(res)
}

export const reportComment = async (commentId, payload, token) => {
  const res = await fetch(buildUrl(`/api/comments/${commentId}/report`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload || {})
  })

  return readJson(res)
}
