// src/stores/adminAuth.js
// 管理员会话状态管理（无 Pinia 依赖，使用 Vue 3 单例 reactive）
import { reactive, computed } from 'vue'
import { getApiBaseUrl } from '../mobile/services/api'

const KEY_TOKEN = 'greenway_admin_token'
const KEY_USER  = 'greenway_admin_user'

const state = reactive({
  token: localStorage.getItem(KEY_TOKEN) || null,
  user:  JSON.parse(localStorage.getItem(KEY_USER) || 'null'),
})

export function useAdminAuth() {
  const isLoggedIn = computed(() => !!state.token && state.user?.role === 'admin')
  const adminUser  = computed(() => state.user)
  const token      = computed(() => state.token)

  function setSession(token, user) {
    state.token = token
    state.user  = user
    localStorage.setItem(KEY_TOKEN, token)
    localStorage.setItem(KEY_USER,  JSON.stringify(user))
  }

  function clearSession() {
    state.token = null
    state.user  = null
    localStorage.removeItem(KEY_TOKEN)
    localStorage.removeItem(KEY_USER)
  }

  /** 通用请求封装，自动携带 Bearer token */
  async function apiFetch(path, options = {}) {
    const baseUrl = getApiBaseUrl()
    const fullPath = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`

    const res = await fetch(fullPath, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
        ...(options.headers || {}),
      },
    })
    const data = await res.json()
    if (!res.ok) {
      if (res.status === 401) clearSession()   // token 过期/无效，立即清除本地会话
      throw new Error(data.message || `HTTP ${res.status}`)
    }
    return data
  }

  return { isLoggedIn, adminUser, token, setSession, clearSession, apiFetch }
}
