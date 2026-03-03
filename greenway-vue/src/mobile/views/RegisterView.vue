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
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
      </div>
      <h1 class="brand-title">创建账号</h1>
      <p class="brand-sub">加入绿道探索社区</p>
    </div>

    <!-- 表单卡片 -->
    <div class="form-card">
      <!-- 成功提示 -->
      <Transition name="fade">
        <div v-if="successMsg" class="alert alert-success">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {{ successMsg }}
        </div>
      </Transition>

      <!-- 错误提示 -->
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
          <input v-model="form.username" type="text" class="field-input" placeholder="4-20位字母数字"
            autocomplete="username" @focus="focusField = 'username'" @blur="focusField = ''" />
        </div>
        <p v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</p>
      </div>

      <!-- 昵称 -->
      <div class="field-group">
        <label class="field-label">昵称（可选）</label>
        <div class="field-wrapper" :class="{ focused: focusField === 'nickname' }">
          <svg class="field-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          <input v-model="form.nickname" type="text" class="field-input" placeholder="展示给其他用户的名字"
            @focus="focusField = 'nickname'" @blur="focusField = ''" />
        </div>
      </div>

      <!-- 邮箱 -->
      <div class="field-group">
        <label class="field-label">邮箱（可选）</label>
        <div class="field-wrapper" :class="{ focused: focusField === 'email', error: !!fieldErrors.email }">
          <svg class="field-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input v-model="form.email" type="email" class="field-input" placeholder="example@mail.com"
            autocomplete="email" @focus="focusField = 'email'" @blur="focusField = ''" />
        </div>
        <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
      </div>

      <!-- 密码 -->
      <div class="field-group">
        <label class="field-label">密码</label>
        <div class="field-wrapper" :class="{ focused: focusField === 'password', error: !!fieldErrors.password }">
          <svg class="field-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input v-model="form.password" :type="showPwd ? 'text' : 'password'" class="field-input" placeholder="至少6位"
            autocomplete="new-password" @focus="focusField = 'password'" @blur="focusField = ''" />
          <button class="pwd-toggle" @click="showPwd = !showPwd" type="button">
            <svg v-if="!showPwd" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
        <!-- 密码强度条 -->
        <div v-if="form.password" class="pwd-strength">
          <div class="strength-bar">
            <div class="strength-fill" :class="pwdStrength.cls" :style="{ width: pwdStrength.pct + '%' }"></div>
          </div>
          <span class="strength-label" :class="pwdStrength.cls">{{ pwdStrength.label }}</span>
        </div>
        <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
      </div>

      <!-- 确认密码 -->
      <div class="field-group">
        <label class="field-label">确认密码</label>
        <div class="field-wrapper" :class="{ focused: focusField === 'confirm', error: !!fieldErrors.confirm }">
          <svg class="field-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <input v-model="form.confirm" :type="showPwd ? 'text' : 'password'" class="field-input" placeholder="再次输入密码"
            @focus="focusField = 'confirm'" @blur="focusField = ''" @keyup.enter="handleRegister" />
        </div>
        <p v-if="fieldErrors.confirm" class="field-error">{{ fieldErrors.confirm }}</p>
      </div>

      <!-- 注册按钮 -->
      <button class="btn-submit" :class="{ loading: isLoading }" @click="handleRegister" :disabled="isLoading">
        <span v-if="!isLoading">创建账号</span>
        <span v-else class="btn-spinner"></span>
      </button>

      <!-- 分割线 -->
      <div class="divider-row">
        <span class="divider-line"></span>
        <span class="divider-text">已有账号？</span>
        <span class="divider-line"></span>
      </div>

      <!-- 跳转登录 -->
      <button class="btn-link" @click="goLogin">
        <strong>立即登录</strong>
      </button>
    </div>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserAuth } from '@/stores/userAuth'
import { getApiBaseUrl } from '../services/api'

const router = useRouter()
const { setSession } = useUserAuth()

const form = reactive({ username: '', nickname: '', email: '', password: '', confirm: '' })
const fieldErrors = reactive({ username: '', email: '', password: '', confirm: '' })
const errorMsg = ref('')
const successMsg = ref('')
const isLoading = ref(false)
const showPwd = ref(false)
const focusField = ref('')

const getApiBase = getApiBaseUrl

// 密码强度计算
const pwdStrength = computed(() => {
  const p = form.password
  if (!p) return { label: '', cls: '', pct: 0 }
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { label: '弱', cls: 'weak', pct: 25 }
  if (score <= 2) return { label: '一般', cls: 'fair', pct: 50 }
  if (score <= 3) return { label: '较强', cls: 'good', pct: 75 }
  return { label: '强', cls: 'strong', pct: 100 }
})

const validate = () => {
  let ok = true
  Object.keys(fieldErrors).forEach(k => fieldErrors[k] = '')
  if (!form.username.trim() || form.username.length < 4) {
    fieldErrors.username = '用户名至少4位'; ok = false
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    fieldErrors.username = '用户名只能含字母、数字和下划线'; ok = false
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    fieldErrors.email = '邮箱格式不正确'; ok = false
  }
  if (form.password.length < 6) {
    fieldErrors.password = '密码至少6位'; ok = false
  }
  if (form.password !== form.confirm) {
    fieldErrors.confirm = '两次密码不匹配'; ok = false
  }
  return ok
}

const handleRegister = async () => {
  if (!validate()) return
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const body = { username: form.username, password: form.password }
    if (form.nickname) body.nickname = form.nickname
    if (form.email) body.email = form.email

    const res = await fetch(`${getApiBase()}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || json.error || '注册失败，请稍后重试')

    // 后端响应格式: { code, message, data: { token, user } }
    const payload = json.data || json  // 兼容两种结构
    // 注册成功后自动登录
    if (payload.token && payload.user) {
      setSession(payload.token, payload.user)
      successMsg.value = '注册成功！正在跳转…'
      setTimeout(() => router.replace('/mobile/profile'), 1200)
    } else {
      successMsg.value = '注册成功！请登录'
      setTimeout(() => router.replace('/mobile/login'), 1200)
    }
  } catch (err) {
    errorMsg.value = err.message || '注册失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => router.back()
const goLogin = () => router.push('/mobile/login')
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
}

.auth-header {
  padding: max(14px, calc(var(--safe-top) + 8px)) 16px 8px;
  display: flex; align-items: center;
}
.back-btn { background: var(--color-surface); box-shadow: var(--shadow-sm); }

.brand-section {
  display: flex; flex-direction: column; align-items: center;
  padding: 20px 24px 16px; gap: 8px;
}
.brand-icon {
  width: 72px; height: 72px; border-radius: 20px;
  background: var(--fill-primary); color: var(--color-primary);
  display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
}
.brand-title { font-size: var(--text-3xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
.brand-sub { font-size: var(--text-base); color: var(--color-text-secondary); }

.form-card {
  margin: 0 16px;
  background: var(--color-surface); border-radius: var(--radius-xl);
  padding: 24px 20px; box-shadow: var(--shadow-md);
  display: flex; flex-direction: column; gap: 14px;
}

.alert {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: var(--radius-md); font-size: var(--text-sm);
}
.alert-error { background: var(--fill-error); color: var(--color-error); }
.alert-success { background: rgba(52,199,89,0.12); color: #34c759; }

.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: var(--text-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); }
.field-wrapper {
  display: flex; align-items: center; gap: 10px;
  height: 50px; padding: 0 14px;
  background: var(--color-surface-2); border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  transition: border-color var(--transition-base), background var(--transition-base);
}
.field-wrapper.focused { border-color: var(--color-primary); background: var(--color-surface); }
.field-wrapper.error { border-color: var(--color-error); }
.field-icon { flex: 0 0 18px; color: var(--color-text-tertiary); }
.field-input {
  flex: 1; border: none; background: transparent;
  font-size: var(--text-base); color: var(--color-text-primary); height: 100%;
}
.field-input::placeholder { color: var(--color-text-tertiary); }
.field-error { font-size: var(--text-xs); color: var(--color-error); margin: 0; }
.pwd-toggle {
  flex: 0 0 32px; width: 32px; height: 32px;
  border: none; background: none;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-tertiary); cursor: pointer;
}

/* 密码强度 */
.pwd-strength { display: flex; align-items: center; gap: 8px; }
.strength-bar { flex: 1; height: 4px; background: var(--color-surface-3); border-radius: 2px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s; }
.strength-label { font-size: var(--text-xs); font-weight: 600; min-width: 28px; }
.weak .strength-fill, .weak { color: var(--color-error); background: var(--color-error); }
.fair .strength-fill, .fair { color: var(--color-warning); background: var(--color-warning); }
.good .strength-fill, .good { color: #007aff; background: #007aff; }
.strong .strength-fill, .strong { color: var(--color-success); background: var(--color-success); }

.btn-submit {
  height: 52px; background: var(--color-primary); color: #fff;
  border: none; border-radius: var(--radius-full);
  font-size: var(--text-lg); font-weight: var(--font-weight-semibold);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.btn-submit:active { opacity: 0.82; transform: scale(0.98); }
.btn-submit.loading { opacity: 0.7; }
.btn-submit:disabled { cursor: not-allowed; }

.btn-spinner {
  width: 22px; height: 22px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.divider-row { display: flex; align-items: center; gap: 10px; }
.divider-line { flex: 1; height: 1px; background: var(--color-divider); }
.divider-text { font-size: var(--text-xs); color: var(--color-text-tertiary); white-space: nowrap; }

.btn-link {
  background: none; border: none; font-size: var(--text-base);
  color: var(--color-text-secondary); cursor: pointer; text-align: center; padding: 4px;
}
.btn-link strong { color: var(--color-primary); }

.bottom-spacer { height: calc(env(safe-area-inset-bottom, 0px) + 40px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
