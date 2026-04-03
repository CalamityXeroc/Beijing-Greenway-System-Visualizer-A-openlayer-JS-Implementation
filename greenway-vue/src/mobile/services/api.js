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
    // 使用您的实际后端地址 - 端口3001
    const baseUrl = 'http://10.26.171.159:3001'
    console.log('[API] Capacitor模式，使用后端地址:', baseUrl)
    return baseUrl
  }
  
  // Web开发模式，使用代理
  console.log('[API] Web开发模式，使用相对路径')
  return ''
}

/**
 * 获取绿道数据
 * @returns {Promise<Object>} GeoJSON FeatureCollection
 */
export const fetchGreenways = async () => {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}/api/greenways`
  console.log('[API] 请求绿道列表:', url)
  
  try {
    const res = await fetch(url)
    console.log('[API] 绿道列表响应状态:', res.status)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('[API] 绿道列表请求失败:', res.status, errorText)
      throw new Error(`API ${res.status}: ${url}`)
    }
    
    const data = await res.json()
    console.log('[API] 绿道列表数据加载成功，数量:', data?.features?.length || 0)
    return data
  } catch (error) {
    console.error('[API] 绿道列表请求异常:', error)
    throw error
  }
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

/**
 * 获取最近评论（用于发现页动态流）
 * @param {number} limit 限制条数
 * @returns {Promise<Object>}
 */
export const fetchRecentComments = async (limit = 10) => {
  const params = new URLSearchParams({
    page: '1',
    pageSize: String(limit),
    status: 'visible'
  })
  const res = await fetch(buildUrl(`/api/comments/recent?${params.toString()}`))
  return readJson(res)
}

// ========== 管理员API（移动端） ==========

/**
 * 管理员API请求封装
 */
const adminFetch = async (path, options = {}, token) => {
  const res = await fetch(buildUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  })
  return readJson(res)
}

/**
 * 获取用户列表（管理员）
 */
export const fetchAdminUsers = async (params, token) => {
  const q = new URLSearchParams(params)
  return adminFetch(`/api/admin/users?${q}`, {}, token)
}

/**
 * 更新用户状态（管理员）
 */
export const updateUserStatus = async (userId, status, token) => {
  return adminFetch(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }, token)
}

/**
 * 更新用户信息（管理员）
 */
export const updateUser = async (userId, data, token) => {
  return adminFetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, token)
}

/**
 * 删除用户（管理员）
 */
export const deleteUser = async (userId, token) => {
  return adminFetch(`/api/admin/users/${userId}`, {
    method: 'DELETE'
  }, token)
}

/**
 * 获取评论列表（管理员）
 */
export const fetchAdminComments = async (params, token) => {
  const q = new URLSearchParams(params)
  return adminFetch(`/api/admin/comments?${q}`, {}, token)
}

/**
 * 更新评论状态（管理员）
 */
export const updateCommentStatus = async (commentId, status, token) => {
  return adminFetch(`/api/admin/comments/${commentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }, token)
}

/**
 * 批量更新评论状态（管理员）
 */
export const batchUpdateCommentStatus = async (ids, status, token) => {
  return adminFetch('/api/admin/comments/batch/status', {
    method: 'PATCH',
    body: JSON.stringify({ ids, status })
  }, token)
}

/**
 * 获取评论统计（管理员）
 */
export const fetchCommentStats = async (days, token) => {
  return adminFetch(`/api/admin/comments/stats?days=${days}`, {}, token)
}

/**
 * 获取仪表盘数据（管理员）
 */
export const fetchDashboardStats = async (token) => {
  return adminFetch('/api/admin/dashboard/stats', {}, token)
}
