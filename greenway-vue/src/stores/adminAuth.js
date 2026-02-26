// src/stores/adminAuth.js
// 管理员会话状态管理（无 Pinia 依赖，使用 Vue 3 单例 reactive）
import { reactive, computed } from 'vue'

const KEY_TOKEN = 'greenway_admin_token'
const KEY_USER  = 'greenway_admin_user'

// 清理旧版遗留的 localStorage，防止干扰
if (localStorage.getItem(KEY_TOKEN)) {
  localStorage.removeItem(KEY_TOKEN)
  localStorage.removeItem(KEY_USER)
}

const state = reactive({
  token: sessionStorage.getItem(KEY_TOKEN) || null,
  user:  JSON.parse(sessionStorage.getItem(KEY_USER) || 'null'),
})

export function useAdminAuth() {
  const isLoggedIn = computed(() => !!state.token && state.user?.role === 'admin')
  const adminUser  = computed(() => state.user)
  const token      = computed(() => state.token)

  function setSession(token, user) {
    state.token = token
    state.user  = user
    sessionStorage.setItem(KEY_TOKEN, token)
    sessionStorage.setItem(KEY_USER,  JSON.stringify(user))
  }

  function clearSession() {
    state.token = null
    state.user  = null
    sessionStorage.removeItem(KEY_TOKEN)
    sessionStorage.removeItem(KEY_USER)
  }

  /** 通用请求封装，自动携带 Bearer token */
  async function apiFetch(path, options = {}) {
    const res = await fetch(path, {
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
