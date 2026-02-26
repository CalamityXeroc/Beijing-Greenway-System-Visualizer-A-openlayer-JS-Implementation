<template>
  <div class="admin-shell" :class="{ collapsed }">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-brand" @click="router.push('/admin/dashboard')">
        <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
          <circle cx="18" cy="18" r="16" fill="#2E7D32" opacity="0.2"/>
          <path d="M18 4 C10 10 6 16 6 22 C6 28 11.5 32 18 32 C24.5 32 30 28 30 22 C30 16 26 10 18 4Z"
                fill="#2E7D32"/>
          <path d="M18 8 L18 30 M12 20 C15 17 18 16 22 17" stroke="#A5D6A7" stroke-width="1.5"
                stroke-linecap="round"/>
        </svg>
        <span class="brand-text">绿道管理后台</span>
      </div>

      <nav class="sidebar-nav">
        <div v-for="item in navItems" :key="item.path"
             class="nav-item"
             :class="{ active: isActive(item.path) }"
             @click="router.push(item.path)">
          <svg class="nav-icon" viewBox="0 0 24 24" width="18" height="18"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" v-html="item.icon"/>
          <span class="nav-label">{{ item.label }}</span>
        </div>
      </nav>

      <div class="sidebar-user">
        <div class="user-avatar">{{ adminUser?.nickname?.[0] || adminUser?.username?.[0] || 'A' }}</div>
        <div class="user-info" v-if="!collapsed">
          <div class="user-name">{{ adminUser?.nickname || adminUser?.username }}</div>
          <div class="user-role">超级管理员</div>
        </div>
        <button class="logout-btn" @click="confirmLogout" title="退出登录">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- 主体 -->
    <div class="main-wrap">
      <!-- 顶部栏 -->
      <header class="topbar">
        <button class="collapse-btn" @click="collapsed = !collapsed">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="breadcrumb">
          <span class="bcrumb-root" @click="router.push('/admin/dashboard')">管理后台</span>
          <span class="bcrumb-sep">/</span>
          <span class="bcrumb-cur">{{ currentTitle }}</span>
        </div>
        <div class="topbar-right">
          <a href="/" target="_blank" class="visit-site">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            访问前台
          </a>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminAuth } from '@/stores/adminAuth'

const router = useRouter()
const route  = useRoute()
const { adminUser, clearSession, isLoggedIn } = useAdminAuth()

// token 被清除后（如任意请求返回 401）自动跳回登录页
watch(isLoggedIn, (val) => {
  if (!val) router.push('/admin/login')
})

const collapsed = ref(false)

const navItems = [
  {
    path: '/admin/dashboard',
    label: '数据概览',
    icon: `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
           <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>`
  },
  {
    path: '/admin/users',
    label: '用户管理',
    icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
           <circle cx="9" cy="7" r="4"/>
           <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
           <path d="M16 3.13a4 4 0 0 1 0 7.75"/>`
  },
  {
    path: '/admin/logs',
    label: '系统日志',
    icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
           <polyline points="14 2 14 8 20 8"/>
           <line x1="16" y1="13" x2="8" y2="13"/>
           <line x1="16" y1="17" x2="8" y2="17"/>`
  },
]

const currentTitle = computed(() => {
  const item = navItems.find(n => route.path.startsWith(n.path))
  return item?.label || '管理后台'
})

function isActive(path) {
  return route.path.startsWith(path)
}

function confirmLogout() {
  if (confirm('确定退出管理后台？')) {
    clearSession()
    window.location.href = '/admin/login'
  }
}
</script>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #f0f2f5;
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  flex: 0 0 220px;
  background: #1a2e1a;
  display: flex;
  flex-direction: column;
  transition: width 0.25s, flex-basis 0.25s;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
  overflow: hidden;
}
.admin-shell.collapsed .sidebar {
  width: 64px;
  flex: 0 0 64px;
}

.sidebar-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 18px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
  white-space: nowrap;
}
.brand-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #A5D6A7;
  letter-spacing: 0.5px;
  transition: opacity 0.2s;
}
.admin-shell.collapsed .brand-text { opacity: 0; width: 0; }

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #9ca3af;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap; overflow: hidden;
}
.nav-item:hover { background: rgba(255,255,255,0.06); color: #d1fae5; }
.nav-item.active { background: #2E7D32; color: #fff; }
.nav-icon { flex: 0 0 18px; }
.nav-label { font-size: 0.9rem; transition: opacity 0.2s; }
.admin-shell.collapsed .nav-label { opacity: 0; width: 0; }

.sidebar-user {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
  overflow: hidden; white-space: nowrap;
}
.user-avatar {
  width: 36px; height: 36px; flex: 0 0 36px;
  background: #2E7D32;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; font-weight: 700; color: #fff;
}
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 0.85rem; color: #e5e7eb; font-weight: 600; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 0.75rem; color: #6b7280; }
.logout-btn {
  flex: 0 0 auto;
  background: none; border: none;
  color: #6b7280; cursor: pointer; padding: 4px;
  border-radius: 6px; display: flex; align-items: center;
  transition: color 0.2s, background 0.2s;
}
.logout-btn:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

/* 主区域 */
.main-wrap {
  flex: 1;
  margin-left: 220px;
  transition: margin-left 0.25s;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.admin-shell.collapsed .main-wrap { margin-left: 64px; }

/* 顶部栏 */
.topbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex; align-items: center; gap: 12px;
  padding: 0 20px;
  position: sticky; top: 0; z-index: 50;
}
.collapse-btn {
  background: none; border: none;
  color: #6b7280; cursor: pointer; padding: 6px;
  border-radius: 6px; display: flex; align-items: center;
  transition: background 0.2s;
}
.collapse-btn:hover { background: #f3f4f6; color: #374151; }
.breadcrumb {
  flex: 1;
  display: flex; align-items: center; gap: 6px;
  font-size: 0.875rem;
}
.bcrumb-root { color: #6b7280; cursor: pointer; }
.bcrumb-root:hover { color: #2E7D32; }
.bcrumb-sep { color: #d1d5db; }
.bcrumb-cur { color: #111827; font-weight: 600; }
.topbar-right { margin-left: auto; }
.visit-site {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.8rem; color: #6b7280;
  text-decoration: none; padding: 5px 10px;
  border: 1px solid #e5e7eb; border-radius: 6px;
  transition: border-color 0.2s, color 0.2s;
}
.visit-site:hover { color: #2E7D32; border-color: #2E7D32; }

/* 内容区 */
.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar { width: 64px; flex: 0 0 64px; }
  .brand-text, .nav-label, .user-info { opacity: 0; width: 0; }
  .main-wrap { margin-left: 64px; }
}

/* ===== 夜间模式 ===== */
[data-theme="night"] .admin-shell { background: #0f0f0f; }
[data-theme="night"] .topbar {
  background: #1a1a1a;
  border-bottom-color: #2a2a2a;
}
[data-theme="night"] .collapse-btn { color: #9ca3af; }
[data-theme="night"] .collapse-btn:hover { background: #2a2a2a; color: #e8e8e8; }
[data-theme="night"] .bcrumb-root { color: #9ca3af; }
[data-theme="night"] .bcrumb-cur  { color: #e8e8e8; }
[data-theme="night"] .bcrumb-sep  { color: #3a3a3a; }
[data-theme="night"] .visit-site  { color: #9ca3af; border-color: #3a3a3a; }
[data-theme="night"] .visit-site:hover { color: #A5D6A7; border-color: #4CAF50; }
[data-theme="night"] .page-content { background: #0f0f0f; }
</style>
