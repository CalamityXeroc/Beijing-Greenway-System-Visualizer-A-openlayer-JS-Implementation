import { reactive, computed } from 'vue'

const TOKEN_KEY = 'greenway_user_token'
const USER_KEY  = 'greenway_user'

const state = reactive({
  token:       localStorage.getItem(TOKEN_KEY) || null,
  currentUser: (() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })()
})

const isLoggedIn    = computed(() => !!state.token && !!state.currentUser)
const currentUser   = computed(() => state.currentUser)
const token         = computed(() => state.token)
const username      = computed(() => state.currentUser?.username || '')
const nickname      = computed(() => state.currentUser?.nickname || state.currentUser?.username || '')

function setSession(tokenStr, userObj) {
  state.token       = tokenStr
  state.currentUser = userObj
  localStorage.setItem(TOKEN_KEY, tokenStr)
  localStorage.setItem(USER_KEY, JSON.stringify(userObj))
}

function clearSession() {
  state.token       = null
  state.currentUser = null
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function apiFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`
  return fetch(url, { ...options, headers })
}

export function useUserAuth() {
  return { isLoggedIn, currentUser, token, username, nickname, setSession, clearSession, apiFetch }
}
