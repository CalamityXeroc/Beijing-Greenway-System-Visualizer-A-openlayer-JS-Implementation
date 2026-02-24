<template>
  <div class="admin-login-page">
    <!-- 左侧品牌区 -->
    <div class="brand-panel">
      <div class="brand-content">
        <div class="brand-logo">
          <svg viewBox="0 0 60 60" width="56" height="56" fill="none">
            <circle cx="30" cy="30" r="28" fill="#1B5E20" opacity="0.15"/>
            <path d="M30 10 C18 18 10 26 10 35 C10 45 19 52 30 52 C41 52 50 45 50 35 C50 26 42 18 30 10Z"
                  fill="#2E7D32" opacity="0.8"/>
            <path d="M30 15 L30 48 M20 30 C24 26 30 24 36 26" stroke="#A5D6A7" stroke-width="2"
                  stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="brand-title">北京绿道系统</h1>
        <p class="brand-subtitle">管理后台</p>
        <ul class="brand-features">
          <li><span>✓</span> 用户账号统一管理</li>
          <li><span>✓</span> 绿道数据实时监控</li>
          <li><span>✓</span> 操作日志与安全审计</li>
        </ul>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="form-panel">
      <div class="form-box">
        <div class="form-header">
          <h2>管理员登录</h2>
          <p>仅限具有管理员权限的账号</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="field" :class="{ error: errors.username }">
            <label>账号</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 24 24" width="16" height="16" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input v-model="form.username" type="text" placeholder="用户名或邮箱"
                     autocomplete="username" @input="errors.username = ''" />
            </div>
            <span v-if="errors.username" class="err-msg">{{ errors.username }}</span>
          </div>

          <div class="field" :class="{ error: errors.password }">
            <label>密码</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 24 24" width="16" height="16" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input v-model="form.password" :type="showPwd ? 'text' : 'password'"
                     placeholder="请输入密码" autocomplete="current-password"
                     @input="errors.password = ''" />
              <button type="button" class="pwd-toggle" @click="showPwd = !showPwd" tabindex="-1">
                <svg v-if="!showPwd" viewBox="0 0 24 24" width="16" height="16" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="err-msg">{{ errors.password }}</span>
          </div>

          <div v-if="loginError" class="login-error">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ loginError }}
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="!loading">登 录</span>
            <span v-else class="spinner"></span>
          </button>
        </form>

        <div class="form-footer">
          <a href="/" class="back-link">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            返回绿道主页
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth } from '@/stores/adminAuth'

const router = useRouter()
const { setSession, isLoggedIn } = useAdminAuth()

// 已登录则跳过
if (isLoggedIn.value) router.replace('/admin/dashboard')

const form = reactive({ username: '', password: '' })
const errors = reactive({ username: '', password: '' })
const loginError = ref('')
const loading = ref(false)
const showPwd = ref(false)

function validate() {
  let ok = true
  if (!form.username.trim()) { errors.username = '请输入账号'; ok = false }
  if (!form.password)        { errors.password = '请输入密码'; ok = false }
  return ok
}

async function handleLogin() {
  loginError.value = ''
  if (!validate()) return
  loading.value = true
  try {
    const res = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username, password: form.password }),
    })
    const text = await res.text()
    const data = text ? JSON.parse(text) : {}
    if (!res.ok) throw new Error(data.message || '登录失败')
    setSession(data.data.token, data.data.user)
    router.push('/admin/dashboard')
  } catch (e) {
    loginError.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #f5f7fa;
}

/* 左侧品牌 */
.brand-panel {
  flex: 0 0 420px;
  background: linear-gradient(160deg, #1B5E20 0%, #2E7D32 40%, #388E3C 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  position: relative;
  overflow: hidden;
}
.brand-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='28'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
  pointer-events: none;
}
.brand-content { position: relative; color: #fff; }
.brand-logo { margin-bottom: 20px; }
.brand-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 4px;
  letter-spacing: 2px;
}
.brand-subtitle {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0 0 36px;
}
.brand-features {
  list-style: none;
  padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 14px;
}
.brand-features li {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.95rem; opacity: 0.9;
}
.brand-features span { color: #A5D6A7; font-weight: bold; }

/* 右侧表单 */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}
.form-box {
  width: 100%;
  max-width: 400px;
}
.form-header { margin-bottom: 32px; }
.form-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px;
}
.form-header p {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
}

/* 表单字段 */
.field { margin-bottom: 20px; }
.field label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute; left: 12px;
  color: #9ca3af; pointer-events: none;
}
.input-wrap input {
  width: 100%;
  height: 44px;
  padding: 0 40px 0 38px;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1a1a1a;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  box-sizing: border-box;
}
.input-wrap input:focus {
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46,125,50,0.12);
}
.field.error .input-wrap input { border-color: #ef4444; }
.field.error .input-wrap input:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
.pwd-toggle {
  position: absolute; right: 10px;
  background: none; border: none;
  color: #9ca3af; cursor: pointer; padding: 4px;
  display: flex; align-items: center;
}
.pwd-toggle:hover { color: #6b7280; }
.err-msg {
  display: block;
  font-size: 0.78rem;
  color: #ef4444;
  margin-top: 4px;
}
.login-error {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.875rem; color: #dc2626;
  background: #fef2f2; border: 1px solid #fecaca;
  padding: 10px 14px; border-radius: 8px;
  margin-bottom: 16px;
}

/* 登录按钮 */
.submit-btn {
  width: 100%;
  height: 46px;
  background: linear-gradient(135deg, #2E7D32, #388E3C);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  display: flex; align-items: center; justify-content: center;
  margin-top: 8px;
}
.submit-btn:hover:not(:disabled) { opacity: 0.92; }
.submit-btn:active:not(:disabled) { transform: scale(0.98); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.spinner {
  width: 20px; height: 20px;
  border: 2.5px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 底部 */
.form-footer { margin-top: 24px; text-align: center; }
.back-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.875rem; color: #6b7280;
  text-decoration: none; transition: color 0.2s;
}
.back-link:hover { color: #2E7D32; }

/* 响应式 */
@media (max-width: 768px) {
  .brand-panel { display: none; }
  .form-panel { padding: 32px 20px; }
}

/* ===== 夜间模式 ===== */
[data-theme="night"] .admin-login-page { background: #111; }
[data-theme="night"] .form-panel { background: #1a1a1a; }
[data-theme="night"] .form-title { color: #e8e8e8; }
[data-theme="night"] .form-desc  { color: #9ca3af; }
[data-theme="night"] .field-label { color: #a5d6a7; }
[data-theme="night"] .input-wrap input {
  background: #252525; border-color: #3a3a3a; color: #e8e8e8;
}
[data-theme="night"] .input-wrap input::placeholder { color: #6b7280; }
[data-theme="night"] .input-wrap input:focus { border-color: #4CAF50; background: #2a2a2a; }
[data-theme="night"] .pwd-toggle { color: #6b7280; }
[data-theme="night"] .login-error {
  background: rgba(127,29,29,.3); border-color: rgba(220,38,38,.3); color: #fca5a5;
}
[data-theme="night"] .back-link { color: #9ca3af; }
[data-theme="night"] .back-link:hover { color: #A5D6A7; }
</style>
