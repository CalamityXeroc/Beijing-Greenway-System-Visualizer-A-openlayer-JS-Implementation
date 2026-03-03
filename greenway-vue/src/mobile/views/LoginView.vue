<template>
  <div class="auth-page">
    <!-- 顶部返回栏 -->
    <div class="auth-header">
      <button class="icon-btn back-btn" @click="goBack" aria-label="返回">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- 品牌区域 -->
    <div class="brand-section">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
      <h1 class="brand-title">欢迎回来</h1>
      <p class="brand-sub">登录以探索北京绿道</p>
    </div>

    <!-- 表单卡片 -->
    <div class="form-card">
      <!-- 通知提示 -->
      <Transition name="fade">
        <div v-if="errorMsg" class="alert alert-error">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ errorMsg }}
        </div>
      </Transition>

      <!-- 用户名 -->
      <div class="field-group">
        <label class="field-label">用户名</label>
        <div class="field-wrapper" :class="{ focused: focusField === 'username', error: !!fieldErrors.username }">
          <svg class="field-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
          </svg>
          <input
            v-model="form.username"
            type="text"
            class="field-input"
            placeholder="请输入用户名"
            autocomplete="username"
            @focus="focusField = 'username'"
            @blur="focusField = ''"
          />
        </div>
        <p v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</p>
      </div>

      <!-- 密码 -->
      <div class="field-group">
        <label class="field-label">密码</label>
        <div class="field-wrapper" :class="{ focused: focusField === 'password', error: !!fieldErrors.password }">
          <svg class="field-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input
            v-model="form.password"
            :type="showPwd ? 'text' : 'password'"
            class="field-input"
            placeholder="请输入密码"
            autocomplete="current-password"
            @focus="focusField = 'password'"
            @blur="focusField = ''"
            @keyup.enter="handleLogin"
          />
          <button class="pwd-toggle" @click="showPwd = !showPwd" type="button" :aria-label="showPwd ? '隐藏密码' : '显示密码'">
            <svg v-if="!showPwd" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
        <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
      </div>

      <!-- 记住我 -->
      <label class="remember-row">
        <input type="checkbox" v-model="rememberMe" class="remember-checkbox" />
        <span class="remember-label">记住我</span>
      </label>

      <!-- 登录按钮 -->
      <button class="btn-submit" :class="{ loading: isLoading }" @click="handleLogin" :disabled="isLoading">
        <span v-if="!isLoading">登录</span>
        <span v-else class="btn-spinner"></span>
      </button>

      <!-- 分割线 -->
      <div class="divider-row">
        <span class="divider-line"></span>
        <span class="divider-text">或</span>
        <span class="divider-line"></span>
      </div>

      <!-- 跳转注册 -->
      <button class="btn-link" @click="goRegister">
        还没有账号？<strong>立即注册</strong>
      </button>
    </div>

    <!-- 跳过登录 -->
    <button class="btn-skip" @click="goBack">跳过，以游客身份继续</button>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserAuth } from '@/stores/userAuth'
import { getApiBaseUrl } from '../services/api'

const router = useRouter()
const { setSession } = useUserAuth()

const form = reactive({ username: '', password: '' })
const fieldErrors = reactive({ username: '', password: '' })
const errorMsg = ref('')
const isLoading = ref(false)
const showPwd = ref(false)
const rememberMe = ref(true)
const focusField = ref('')

const getApiBase = getApiBaseUrl

const validate = () => {
  let ok = true
  fieldErrors.username = ''
  fieldErrors.password = ''
  if (!form.username.trim()) { fieldErrors.username = '用户名不能为空'; ok = false }
  if (!form.password) { fieldErrors.password = '密码不能为空'; ok = false }
  return ok
}

const handleLogin = async () => {
  if (!validate()) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch(`${getApiBase()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username, password: form.password })
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || json.error || '登录失败，请检查用户名或密码')
    // 后端响应格式: { code, message, data: { token, user } }
    const payload = json.data || json  // 兼容两种结构
    if (!payload.token) throw new Error('登录失败：服务器未返回令牌')
    setSession(payload.token, payload.user)
    // 跳转到个人页或之前的页面
    const redirect = router.currentRoute.value.query.redirect || '/mobile/profile'
    router.replace(redirect)
  } catch (err) {
    errorMsg.value = err.message || '登录失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => router.back()
const goRegister = () => router.push('/mobile/register')
</script>

<style scoped>
.auth-page {
  position: relative;
  width: 100%;
  min-height: 100%;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 32px);
}

/* 顶部栏 */
.auth-header {
  padding: max(14px, calc(var(--safe-top) + 8px)) 16px 8px;
  display: flex;
  align-items: center;
}
.back-btn {
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

/* 品牌 */
.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 24px 20px;
  gap: 8px;
}
.brand-icon {
  width: 72px; height: 72px;
  border-radius: 20px;
  background: var(--fill-primary);
  color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.brand-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}
.brand-sub {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
}

/* 表单卡片 */
.form-card {
  margin: 0 16px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 24px 20px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 警告 */
.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}
.alert-error {
  background: var(--fill-error);
  color: var(--color-error);
}

/* 字段 */
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: var(--text-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); }
.field-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 50px;
  padding: 0 14px;
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  transition: border-color var(--transition-base), background var(--transition-base);
}
.field-wrapper.focused { border-color: var(--color-primary); background: var(--color-surface); }
.field-wrapper.error { border-color: var(--color-error); }
.field-icon { flex: 0 0 18px; color: var(--color-text-tertiary); }
.field-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  height: 100%;
}
.field-input::placeholder { color: var(--color-text-tertiary); }
.field-error { font-size: var(--text-xs); color: var(--color-error); margin: 0; }

/* 密码显隐 */
.pwd-toggle {
  flex: 0 0 32px; width: 32px; height: 32px;
  border: none; background: none;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-tertiary); cursor: pointer;
}

/* 记住我 */
.remember-row {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
}
.remember-checkbox { accent-color: var(--color-primary); width: 16px; height: 16px; }
.remember-label { font-size: var(--text-sm); color: var(--color-text-secondary); }

/* 提交按钮 */
.btn-submit {
  height: 52px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.btn-submit:active { opacity: 0.82; transform: scale(0.98); }
.btn-submit.loading { opacity: 0.7; }
.btn-submit:disabled { cursor: not-allowed; }

/* 加载动画 */
.btn-spinner {
  width: 22px; height: 22px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 分割线 */
.divider-row { display: flex; align-items: center; gap: 10px; }
.divider-line { flex: 1; height: 1px; background: var(--color-divider); }
.divider-text { font-size: var(--text-xs); color: var(--color-text-tertiary); }

/* 链接按钮 */
.btn-link {
  background: none; border: none;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  cursor: pointer; text-align: center;
  padding: 4px;
}
.btn-link strong { color: var(--color-primary); }

/* 跳过 */
.btn-skip {
  margin-top: 20px;
  background: none; border: none;
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  cursor: pointer; text-align: center;
  padding: 8px;
  align-self: center;
  text-decoration: underline;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
