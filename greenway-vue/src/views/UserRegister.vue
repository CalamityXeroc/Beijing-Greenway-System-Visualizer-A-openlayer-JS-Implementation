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
      <h1 class="card-title">创建账号</h1>
      <p class="card-sub">注册后即可探索更多绿道功能</p>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="field-row">
          <div class="field">
            <label class="label">用户名 *</label>
            <input v-model="form.username" type="text" class="inp" placeholder="3-20个字符" required/>
          </div>
          <div class="field">
            <label class="label">昵称</label>
            <input v-model="form.nickname" type="text" class="inp" placeholder="显示名（可选）"/>
          </div>
        </div>
        <div class="field">
          <label class="label">邮箱</label>
          <input v-model="form.email" type="email" class="inp" placeholder="email@example.com"/>
        </div>
        <div class="field">
          <label class="label">密码 *</label>
          <div class="pw-wrap">
            <input v-model="form.password" :type="showPw ? 'text' : 'password'"
                   class="inp" placeholder="至少6位" autocomplete="new-password" required/>
            <button type="button" class="eye-btn" @click="showPw = !showPw">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="field">
          <label class="label">确认密码 *</label>
          <input v-model="form.confirm" :type="showPw ? 'text' : 'password'"
                 class="inp" placeholder="再输一遍密码" autocomplete="new-password" required/>
        </div>
        <p v-if="errMsg" class="err-msg">{{ errMsg }}</p>
        <p v-if="successMsg" class="ok-msg">{{ successMsg }}</p>
        <button type="submit" class="btn-main" :disabled="loading">
          <span v-if="loading" class="spin"/>{{ loading ? '注册中…' : '注册' }}
        </button>
      </form>

      <div class="links">
        <span>已有账号？</span>
        <a href="/login" class="link">立即登录</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({ username: '', nickname: '', email: '', password: '', confirm: '' })
const loading    = ref(false)
const showPw     = ref(false)
const errMsg     = ref('')
const successMsg = ref('')

async function handleSubmit() {
  errMsg.value     = ''
  successMsg.value = ''
  if (form.value.password !== form.value.confirm) {
    errMsg.value = '两次密码输入不一致'; return
  }
  if (form.value.password.length < 6) {
    errMsg.value = '密码至少 6 位'; return
  }
  loading.value = true
  try {
    const body = {
      username: form.value.username,
      password: form.value.password,
      email:    form.value.email || undefined,
      nickname: form.value.nickname || undefined
    }
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const text = await res.text()
    let json
    try { json = JSON.parse(text) } catch { json = {} }
    if (res.ok) {
      successMsg.value = '注册成功！即将跳转到登录页…'
      setTimeout(() => router.push('/login'), 1500)
    } else {
      errMsg.value = json.message || json.error || '注册失败，请检查输入'
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
  padding: 20px 0;
}
.login-card {
  width: 100%; max-width: 460px; background: #fff; border-radius: 16px;
  padding: 40px 36px; box-shadow: 0 10px 40px rgba(0,0,0,.12);
}
.logo { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
.logo-name { font-size: 1.1rem; font-weight: 700; color: #2E7D32; }
.card-title { font-size: 1.6rem; font-weight: 800; color: #111827; margin: 0 0 4px; }
.card-sub   { font-size: 0.875rem; color: #6b7280; margin: 0 0 28px; }
.field-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { margin-bottom: 16px; }
.label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 6px; }
.inp {
  width: 100%; padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-size: 0.93rem; outline: none; box-sizing: border-box; transition: border-color .2s;
}
.inp:focus { border-color: #2E7D32; }
.pw-wrap { position: relative; }
.pw-wrap .inp { padding-right: 40px; }
.eye-btn {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #9ca3af; padding: 0; line-height: 0;
}
.err-msg { font-size: 0.82rem; color: #dc2626; margin: -8px 0 12px; }
.ok-msg  { font-size: 0.82rem; color: #16a34a; margin: -8px 0 12px; }
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
[data-theme="night"] .link  { color: #4CAF50; }
</style>
