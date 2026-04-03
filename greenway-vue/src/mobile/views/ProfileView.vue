<template>
  <div class="page">
    <!-- 顶部用户卡片 - 现代化重构 -->
    <div class="profile-hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="avatar-container">
          <div class="avatar-ring" :style="{ background: avatarBg }">
            <span v-if="!currentUser?.avatar">{{ avatarLetter }}</span>
            <img v-else :src="currentUser.avatar" alt="头像" />
          </div>
          <span v-if="isAdmin" class="admin-crown">👑</span>
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ displayName }}</h2>
          <p class="user-sub">{{ displayEmail || (isLoggedIn ? '已登录' : '未登录') }}</p>
        </div>
        <div v-if="!isLoggedIn" class="auth-btns">
          <button class="btn-login" @click="goLogin">登录</button>
          <button class="btn-register" @click="goRegister">注册</button>
        </div>
        <button v-else class="btn-logout" @click="logout">退出登录</button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-card">
      <div class="stat-item" @click="goToPage('rides')">
        <span class="stat-val">{{ currentUser?.ridesCount ?? 0 }}</span>
        <span class="stat-key">骑行记录</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item" @click="goToPage('favorites')">
        <span class="stat-val">{{ currentUser?.favoritesCount ?? 0 }}</span>
        <span class="stat-key">我的收藏</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-val">{{ currentUser?.totalDistance ?? 0 }}<small>km</small></span>
        <span class="stat-key">总里程</span>
      </div>
    </div>

    <!-- 菜单区域（可滚动） -->
    <div class="scroll-area">
      <!-- 管理员专属入口 -->
      <div v-if="isAdmin" class="menu-group admin-group">
        <h3 class="group-title">管理员功能</h3>
        <button class="menu-row" @click="goMobileAdmin">
          <span class="menu-icon admin-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </span>
          <span class="menu-content">
            <span class="menu-label">管理中心</span>
            <span class="menu-desc">用户管理、评论审核</span>
          </span>
          <span class="admin-badge">管理员</span>
          <svg class="chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <!-- 我的内容 -->
      <div class="menu-group">
        <h3 class="group-title">我的内容</h3>
        <button class="menu-row" @click="goToPage('my-comments')">
          <span class="menu-icon" style="background: linear-gradient(135deg, #ff9500, #ff5e3a);">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </span>
          <span class="menu-content">
            <span class="menu-label">我的评论</span>
            <span class="menu-desc">查看和管理我发布的评论</span>
          </span>
          <svg class="chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <button class="menu-row" @click="goToPage('favorites')">
          <span class="menu-icon" style="background: linear-gradient(135deg, #ff2d55, #ff375f);">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </span>
          <span class="menu-content">
            <span class="menu-label">收藏绿道</span>
            <span class="menu-desc">我收藏的绿道列表</span>
          </span>
          <svg class="chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <!-- 设置 -->
      <div class="menu-group">
        <h3 class="group-title">设置</h3>
        <button class="menu-row" @click="goToPage('settings')">
          <span class="menu-icon" style="background: linear-gradient(135deg, #5856d6, #af52de);">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </span>
          <span class="menu-content">
            <span class="menu-label">账号设置</span>
          </span>
          <svg class="chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <button class="menu-row" style="justify-content: space-between;">
          <span style="display:flex;align-items:center;gap:14px;">
            <span class="menu-icon" style="background: linear-gradient(135deg, #1c1c1e, #3a3a3c);">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </span>
            <span class="menu-label">深色模式</span>
          </span>
          <label class="toggle" @click.stop>
            <input type="checkbox" :checked="isDark" @change="toggleTheme" />
            <span class="track"></span>
          </label>
        </button>
      </div>

      <!-- 其他 -->
      <div class="menu-group">
        <h3 class="group-title">其他</h3>
        <button class="menu-row" @click="goToPage('help')">
          <span class="menu-icon" style="background: linear-gradient(135deg, #30d158, #34c759);">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>
          <span class="menu-content">
            <span class="menu-label">帮助与反馈</span>
          </span>
          <svg class="chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <button class="menu-row" @click="goToPage('about')">
          <span class="menu-icon" style="background: linear-gradient(135deg, #007aff, #5856d6);">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </span>
          <span class="menu-content">
            <span class="menu-label">关于应用</span>
            <span class="menu-desc">版本 1.0.0</span>
          </span>
          <svg class="chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <!-- 非管理员也可见的管理员登录入口 -->
      <div v-if="!isAdmin" class="admin-login-entry">
        <button class="admin-login-btn" @click="goAdminLogin">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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

// 头像
const avatarLetter = computed(() => {
  const name = nickname.value || username.value || '?'
  return name.charAt(0).toUpperCase()
})
const avatarBg = computed(() => {
  const colors = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #11998e, #38ef7d)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #fc4a1a, #f7b733)'
  ]
  const name = username.value || ''
  return colors[(name.charCodeAt(0) || 0) % colors.length]
})

const goLogin = () => router.push('/mobile/login')
const goRegister = () => router.push('/mobile/register')

const logout = () => {
  clearSession()
}

const goMobileAdmin = () => router.push('/mobile/admin')
const goAdminLogin = () => { window.location.href = '/admin/login' }

const goToPage = (p) => {
  if (p === 'my-comments') {
    router.push('/mobile/my-comments')
    return
  }
  if (p === 'favorites') {
    router.push('/mobile/favorites')
    return
  }
  if (p === 'settings') {
    router.push('/mobile/settings')
    return
  }
  if (p === 'help' || p === 'about') {
    router.push('/mobile/settings')
    return
  }
  console.log('go', p)
}
</script>

<style scoped>
.page { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; background: var(--color-bg); }

/* 用户卡片 - 现代化 */
.profile-hero {
  position: relative;
  padding-top: max(16px, var(--safe-top));
}
.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 140px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: 0 0 32px 32px;
}
.hero-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px 24px;
}
.avatar-container {
  position: relative;
  margin-bottom: 12px;
}
.avatar-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  border: 4px solid var(--color-surface);
  box-shadow: var(--shadow-lg);
}
.avatar-ring img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.admin-crown {
  position: absolute;
  top: -8px;
  right: -4px;
  font-size: 20px;
}
.user-info {
  text-align: center;
  margin-bottom: 16px;
}
.user-name {
  font-size: 22px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}
.user-sub {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 4px 0 0;
}
.auth-btns {
  display: flex;
  gap: 12px;
}
.btn-login {
  padding: 10px 32px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}
.btn-register {
  padding: 10px 24px;
  background: var(--color-surface);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
}
.btn-logout {
  padding: 8px 20px;
  background: var(--fill-error);
  color: var(--color-error);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
}

/* 统计卡片 */
.stats-card {
  display: flex;
  background: var(--color-surface);
  margin: -12px 16px 16px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: 20px 0;
  position: relative;
  z-index: 1;
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.stat-val {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}
.stat-val small {
  font-size: 14px;
  font-weight: 400;
}
.stat-key {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
.stat-divider {
  width: 1px;
  background: var(--color-divider);
  margin: 4px 0;
}

/* 滚动区 */
.scroll-area { flex: 1; overflow-y: auto; padding: 0 16px; }

/* 菜单组 */
.menu-group {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: 16px;
  overflow: hidden;
}
.group-title {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 14px 16px 8px;
  margin: 0;
}
.menu-row {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text-primary);
  border-top: 0.5px solid var(--color-divider);
  transition: background var(--transition-fast);
}
.menu-group .menu-row:first-of-type { border-top: none; }
.menu-row:active { background: var(--color-surface-2); }
.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.admin-icon {
  background: linear-gradient(135deg, #ff6b6b, #ee5253);
}
.menu-content {
  flex: 1;
  text-align: left;
  min-width: 0;
}
.menu-label {
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  display: block;
}
.menu-desc {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: 2px;
}
.chevron { color: var(--color-text-tertiary); flex-shrink: 0; }

/* 管理员区块 */
.admin-group {
  border: 1.5px solid rgba(255, 107, 107, 0.3);
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.05), rgba(238, 82, 83, 0.05));
}
.admin-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  background: linear-gradient(135deg, #ff6b6b, #ee5253);
  color: #fff;
  border-radius: var(--radius-full);
}

/* 切换开关 */
.toggle { position: relative; display: inline-block; width: 50px; height: 30px; flex: 0 0 50px; }
.toggle input { display: none; }
.track {
  position: absolute;
  inset: 0;
  background: var(--color-surface-3);
  border-radius: 15px;
  transition: background 0.3s;
}
.toggle input:checked + .track { background: var(--color-primary); }
.track::after {
  content: '';
  position: absolute;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fff;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.toggle input:checked + .track::after { transform: translateX(20px); }

/* 管理员登录入口 */
.admin-login-entry {
  display: flex;
  justify-content: center;
  padding: 8px 0 16px;
}
.admin-login-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.admin-login-btn:active {
  background: var(--color-surface-2);
}

.nav-spacer { height: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom,0px) + 16px); }
</style>
