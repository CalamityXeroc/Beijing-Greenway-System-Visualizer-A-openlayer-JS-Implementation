<template>
  <div class="login-bg">
    <div class="login-card">
      <div class="logo">
        <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
          <circle cx="20" cy="20" r="20" fill="#2E7D32"/>
          <path d="M10 26 Q15 10 20 18 Q25 26 30 14" stroke="#A5D6A7" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <circle cx="20" cy="18" r="3" fill="#fff"/>
        </svg>
        <span class="logo-name">北京绿道</span>
      </div>
      <h1 class="card-title">用户登录</h1>
      <p class="card-sub">登录后可保存路线、发表评论</p>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="field">
          <label class="label">用户名</label>
          <input v-model="form.username" type="text" class="inp"
                 placeholder="输入用户名" autocomplete="username" required/>
        </div>
        <div class="field">
          <label class="label">密码</label>
          <div class="pw-wrap">
            <input v-model="form.password" :type="showPw ? 'text' : 'password'"
                   class="inp" placeholder="输入密码" autocomplete="current-password" required/>
            <button type="button" class="eye-btn" @click="showPw = !showPw">
              <svg v-if="!showPw" viewBox="0 0 24 24" width="16" height="16" fill="none"
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
        </div>
        <p v-if="errMsg" class="err-msg">{{ errMsg }}</p>
        <button type="submit" class="btn-main" :disabled="loading">
          <span v-if="loading" class="spin"/>{{ loading ? '登录中…' : '登录' }}
        </button>
      </form>

      <div class="links">
        <span>没有账号？</span>
        <a href="/register" class="link">立即注册</a>
      </div>
      <div class="divider"><span>或</span></div>
      <a href="/admin/login" class="btn-admin">管理员登录</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserAuth } from '@/stores/userAuth'
import { useAdminAuth } from '@/stores/adminAuth'

const router = useRouter()
const route  = useRoute()
const { setSession } = useUserAuth()
const { setSession: setAdminSession } = useAdminAuth()

const form   = ref({ username: '', password: '' })
const loading = ref(false)
const showPw  = ref(false)
const errMsg  = ref('')

async function handleSubmit() {
  errMsg.value  = ''
  loading.value = true
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.value.username, password: form.value.password })
    })
    const text = await res.text()
    let json
    try { json = JSON.parse(text) } catch { json = {} }
    if (res.ok && json.data?.token) {
      setSession(json.data.token, json.data.user)
      
      // 如果是管理员登录前台，同时自动设置后台 session，并直接跳转到后台
      if (json.data.user.role === 'admin') {
        setAdminSession(json.data.token, json.data.user)
        window.location.href = '/admin/dashboard'
        return
      }

      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      errMsg.value = json.message || json.error || '用户名或密码错误'
    }
  } catch (e) {
    errMsg.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);
}
.login-card {
  width: 100%; max-width: 400px; background: #fff; border-radius: 16px;
  padding: 40px 36px; box-shadow: 0 10px 40px rgba(0,0,0,.12);
}
.logo { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
.logo-name { font-size: 1.1rem; font-weight: 700; color: #2E7D32; }
.card-title { font-size: 1.6rem; font-weight: 800; color: #111827; margin: 0 0 4px; }
.card-sub   { font-size: 0.875rem; color: #6b7280; margin: 0 0 28px; }
.field { margin-bottom: 18px; }
.label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 6px; }
.inp {
  width: 100%; padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-size: 0.95rem; outline: none; box-sizing: border-box; transition: border-color .2s;
}
.inp:focus { border-color: #2E7D32; }
.pw-wrap { position: relative; }
.pw-wrap .inp { padding-right: 40px; }
.eye-btn {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #9ca3af; padding: 0;
  line-height: 0;
}
.err-msg { font-size: 0.82rem; color: #dc2626; margin: -8px 0 12px; }
.btn-main {
  width: 100%; padding: 12px; background: #2E7D32; color: #fff; font-size: 1rem;
  font-weight: 700; border: none; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background .2s;
}
.btn-main:hover:not(:disabled) { background: #1B5E20; }
.btn-main:disabled { opacity: 0.6; cursor: not-allowed; }
.spin {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.35);
  border-top-color: #fff; border-radius: 50%;
  animation: sp .7s linear infinite; display: inline-block;
}
@keyframes sp { to { transform: rotate(360deg); } }
.links { margin-top: 18px; text-align: center; font-size: 0.875rem; color: #6b7280; }
.link  { color: #2E7D32; font-weight: 600; text-decoration: none; margin-left: 4px; }
.link:hover { text-decoration: underline; }
.divider {
  display: flex; align-items: center; gap: 10px; margin: 16px 0;
  font-size: 0.8rem; color: #d1d5db;
}
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }
.btn-admin {
  display: block; text-align: center; padding: 10px;
  border: 1.5px solid #e5e7eb; border-radius: 8px; color: #6b7280;
  font-size: 0.875rem; text-decoration: none; transition: all .2s;
}
.btn-admin:hover { border-color: #2E7D32; color: #2E7D32; }

/* ===== 夜间模式 ===== */
[data-theme="night"] .login-bg {
  background: linear-gradient(135deg, #0a140a 0%, #111e11 50%, #0d1a0d 100%);
}
[data-theme="night"] .login-card {
  background: #1a251a;
  box-shadow: 0 10px 40px rgba(0,0,0,.5);
  border: 1px solid rgba(76,175,80,0.15);
}
[data-theme="night"] .card-title { color: #e8e8e8; }
[data-theme="night"] .card-sub   { color: #9ca3af; }
[data-theme="night"] .label      { color: #a5d6a7; }
[data-theme="night"] .inp {
  background: #243024; border-color: #3a4e3a; color: #e8e8e8;
}
[data-theme="night"] .inp::placeholder { color: #6b7280; }
[data-theme="night"] .inp:focus { border-color: #4CAF50; background: #2a3a2a; }
[data-theme="night"] .eye-btn { color: #6b7280; }
[data-theme="night"] .links { color: #9ca3af; }
[data-theme="night"] .divider { color: #3a4e3a; }
[data-theme="night"] .divider::before,
[data-theme="night"] .divider::after { background: #3a4e3a; }
[data-theme="night"] .btn-admin {
  border-color: #3a4e3a; color: #9ca3af; background: transparent;
}
[data-theme="night"] .btn-admin:hover { border-color: #4CAF50; color: #A5D6A7; }
</style>
