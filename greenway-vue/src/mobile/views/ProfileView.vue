<template>
  <div class="page">
    <!-- 顶部用户卡片 -->
    <div class="profile-hero">
      <div class="avatar-ring">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div class="user-info">
        <h2 class="user-name">{{ displayName }}</h2>
        <p class="user-sub">{{ displayEmail || (isLoggedIn ? '已登录' : '未登录') }}</p>
      </div>
      <div v-if="!isLoggedIn" class="auth-btns">
        <button class="btn-login" @click="goLogin">登录</button>
        <button class="btn-register" @click="goRegister">注册</button>
      </div>
      <button v-else class="btn-logout" @click="logout">退出</button>
    </div>

    <!-- 统计行 -->
    <div class="stats-row">
      <div class="stat-block">
        <span class="stat-val">{{ currentUser?.ridesCount ?? 0 }}</span>
        <span class="stat-key">已骑行</span>
      </div>
      <div class="stat-sep"></div>
      <div class="stat-block">
        <span class="stat-val">{{ currentUser?.favoritesCount ?? 0 }}</span>
        <span class="stat-key">已收藏</span>
      </div>
      <div class="stat-sep"></div>
      <div class="stat-block">
        <span class="stat-val">{{ currentUser?.totalDistance ?? 0 }}<small>km</small></span>
        <span class="stat-key">总里程</span>
      </div>
    </div>

    <!-- 菜单区域（可滚动） -->
    <div class="scroll-area">
      <div class="menu-group">
        <button class="menu-row" @click="goToPage('settings')">
          <span class="menu-icon bg-blue">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06..."></path></svg>
          </span>
          <span class="menu-label">账号设置</span>
          <svg class="chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <button class="menu-row" @click="goToPage('theme')" style="justify-content: space-between;">
          <span style="display:flex;align-items:center;gap:12px;">
            <span class="menu-icon bg-purple"></span>
            <span class="menu-label">夜间模式</span>
          </span>
          <label class="toggle" @click.stop>
            <input type="checkbox" :checked="isDark" @change="toggleTheme" />
            <span class="track"></span>
          </label>
        </button>
      </div>

      <div class="menu-group">
        <button class="menu-row" @click="goToPage('my-comments')">
          <span class="menu-icon bg-orange">评</span>
          <span class="menu-label">我的评论</span>
          <svg class="chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <button class="menu-row" @click="goToPage('help')">
          <span class="menu-icon bg-orange"></span>
          <span class="menu-label">帮助与反馈</span>
          <svg class="chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <button class="menu-row" @click="goToPage('about')">
          <span class="menu-icon bg-gray">ℹ</span>
          <span class="menu-label">关于应用</span>
          <svg class="chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <!-- 管理员专属入口（仅 admin 可见） -->
      <div v-if="isAdmin" class="menu-group admin-group">
        <button class="menu-row" @click="goAdmin">
          <span class="menu-icon bg-admin">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </span>
          <span class="menu-label">管理员后台</span>
          <span class="admin-badge">管理员</span>
          <svg class="chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <!-- 管理员登录入口（永远显示，不需登录） -->
      <div class="admin-entry-wrap">
        <button class="admin-entry-btn" @click="goAdminLogin">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          管理员登录
        </button>
      </div>

      <div class="nav-spacer"></div>
    </div>

    <MobileBottomNav v-model="activeTab" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import { useAppTheme } from '../composables/useAppTheme'
import { useUserAuth } from '@/stores/userAuth'

const router = useRouter()
const activeTab = ref('profile')
const { isDark, toggleTheme } = useAppTheme()
const { isLoggedIn, currentUser, nickname, username, clearSession } = useUserAuth()

// 用户显示信息
const displayName = computed(() => {
  if (!isLoggedIn.value) return '游客用户'
  return nickname.value || username.value || '我的账号'
})
const displayEmail = computed(() => currentUser.value?.email || null)
const isAdmin = computed(() => currentUser.value?.role === 'admin')

const goLogin = () => router.push('/mobile/login')
const goRegister = () => router.push('/mobile/register')

const logout = () => {
  clearSession()
}

const goAdmin = () => { window.location.href = '/admin/dashboard' }
const goAdminLogin = () => { window.location.href = '/admin/login' }

const goToPage = (p) => {
  if (p === 'my-comments') {
    router.push('/mobile/my-comments')
    return
  }
  // 预留页面跳转
  console.log('go', p)
}
</script>

<style scoped>
.page { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; background: var(--color-bg); }

/* 用户卡片 */
.profile-hero {
  display: flex; align-items: center; gap: 14px;
  padding: max(16px, var(--safe-top)) 16px 16px;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
}
.avatar-ring {
  width: 60px; height: 60px; border-radius: 50%;
  background: var(--fill-primary);
  color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  flex: 0 0 60px;
}
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: var(--text-lg); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
.user-sub { font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: 2px; }
.btn-login { padding: 7px 16px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-full); font-size: var(--text-sm); font-weight: 600; cursor: pointer; }
.btn-register { padding: 7px 14px; background: var(--color-surface-2); color: var(--color-primary); border: 1px solid var(--color-primary); border-radius: var(--radius-full); font-size: var(--text-sm); font-weight: 600; cursor: pointer; }
.btn-logout { padding: 7px 14px; background: var(--fill-error); color: var(--color-error); border: none; border-radius: var(--radius-full); font-size: var(--text-sm); font-weight: 600; cursor: pointer; }
.auth-btns { display: flex; gap: 8px; }

/* 统计行 */
.stats-row { display: flex; background: var(--color-surface); margin: 12px 16px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: 14px 0; }
.stat-block { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.stat-val { font-size: var(--text-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
.stat-val small { font-size: 13px; font-weight: 400; }
.stat-key { font-size: 11px; color: var(--color-text-tertiary); }
.stat-sep { width: 1px; background: var(--color-divider); margin: 4px 0; }

/* 滚动区 */
.scroll-area { flex: 1; overflow-y: auto; }

/* 菜单组 */
.menu-group { background: var(--color-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin: 0 16px 12px; overflow: hidden; }
.menu-row { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 16px; border: none; background: none; cursor: pointer; color: var(--color-text-primary); border-bottom: 0.5px solid var(--color-divider); transition: background var(--transition-fast); }
.menu-row:last-child { border-bottom: none; }
.menu-row:active { background: var(--color-surface-2); }
.menu-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex: 0 0 30px; }
.bg-blue { background: rgba(50,173,230,0.15); color: #32ade6; }
.bg-purple { background: rgba(88,86,214,0.12); }
.bg-orange { background: rgba(255,159,10,0.12); }
.bg-gray { background: var(--color-surface-3); }
.menu-label { flex: 1; text-align: left; font-size: var(--text-base); }
.chevron { color: var(--color-text-tertiary); margin-left: auto; }

/* 管理员区块 */
.admin-group { border: 1.5px solid rgba(255,59,48,0.25); }
.bg-admin { background: rgba(255,59,48,0.12); color: #ff3b30; }
.admin-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  background: rgba(255,59,48,0.12);
  color: #ff3b30;
  border-radius: var(--radius-full);
  letter-spacing: 0.02em;
}

/* 切换开关 */
.toggle { position: relative; display: inline-block; width: 44px; height: 26px; flex: 0 0 44px; }
.toggle input { display: none; }
.track { position: absolute; inset: 0; background: var(--color-surface-3); border-radius: 13px; transition: background 0.2s; }
.toggle input:checked + .track { background: var(--color-primary); }
.track::after { content: ''; position: absolute; width: 20px; height: 20px; border-radius: 50%; background: #fff; top: 3px; left: 3px; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
.toggle input:checked + .track::after { transform: translateX(18px); }

.nav-spacer { height: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom,0px) + 12px); }

/* 管理员登录入口（常显） */
.admin-entry-wrap {
  display: flex;
  justify-content: center;
  padding: 4px 16px 0;
}
.admin-entry-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.admin-entry-btn:active {
  background: var(--color-surface-2);
  color: var(--color-text-secondary);
}
</style>
