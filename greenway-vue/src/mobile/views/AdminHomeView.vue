<template>
  <div class="admin-home">
    <!-- 顶部导航 -->
    <div class="admin-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <h1>管理中心</h1>
      <span class="admin-badge-inline">管理员</span>
    </div>

    <!-- 数据概览卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-value">{{ stats.totalUsers || '--' }}</div>
        <div class="stat-card-label">注册用户</div>
        <div class="stat-card-trend up" v-if="stats.newUsersToday">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
          +{{ stats.newUsersToday }}今日
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">{{ stats.totalComments || '--' }}</div>
        <div class="stat-card-label">评论总数</div>
        <div class="stat-card-trend up" v-if="stats.newCommentsToday">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
          +{{ stats.newCommentsToday }}今日
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">{{ stats.pendingComments || 0 }}</div>
        <div class="stat-card-label">待审核</div>
        <div class="stat-card-trend warning" v-if="stats.pendingComments > 0">需处理</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">{{ stats.activeToday || '--' }}</div>
        <div class="stat-card-label">今日活跃</div>
      </div>
    </div>

    <!-- 管理功能入口 -->
    <div class="admin-section">
      <h3 class="section-label">功能入口</h3>
      <div class="admin-menu">
        <button class="list-item" @click="goToUsers">
          <span class="list-item-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          <span class="list-item-content">
            <span class="list-item-title">用户管理</span>
            <span class="list-item-desc">查看、编辑用户信息和权限</span>
          </span>
          <span class="list-item-badge" v-if="stats.newUsersToday">{{ stats.newUsersToday }}</span>
          <svg class="list-item-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        <button class="list-item" @click="goToComments">
          <span class="list-item-icon" style="background: linear-gradient(135deg, #11998e, #38ef7d);">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </span>
          <span class="list-item-content">
            <span class="list-item-title">评论审核</span>
            <span class="list-item-desc">审核、管理用户评论内容</span>
          </span>
          <span class="list-item-badge" v-if="stats.pendingComments">{{ stats.pendingComments }}</span>
          <svg class="list-item-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        <button class="list-item" @click="goToWebAdmin">
          <span class="list-item-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </span>
          <span class="list-item-content">
            <span class="list-item-title">Web管理后台</span>
            <span class="list-item-desc">在浏览器中打开完整管理功能</span>
          </span>
          <svg class="list-item-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="admin-section">
      <h3 class="section-label">快捷操作</h3>
      <div class="quick-actions">
        <button class="action-chip" @click="refreshStats">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          刷新数据
        </button>
        <button class="action-chip" @click="clearCache">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          清除缓存
        </button>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="admin-section" v-if="recentActivities.length">
      <h3 class="section-label">最近活动</h3>
      <div class="activity-list">
        <div class="activity-item" v-for="act in recentActivities" :key="act.id">
          <span class="activity-icon" :class="act.type">{{ act.icon }}</span>
          <span class="activity-content">
            <span class="activity-text">{{ act.text }}</span>
            <span class="activity-time">{{ act.time }}</span>
          </span>
        </div>
      </div>
    </div>

    <div class="bottom-safe"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth } from '@/stores/adminAuth'
import { fetchDashboardStats } from '../services/api'

const router = useRouter()
const { token, isLoggedIn } = useAdminAuth()

const stats = ref({
  totalUsers: 0,
  totalComments: 0,
  pendingComments: 0,
  newUsersToday: 0,
  newCommentsToday: 0,
  activeToday: 0
})

const recentActivities = ref([
  { id: 1, icon: '👤', type: 'user', text: '新用户注册', time: '2分钟前' },
  { id: 2, icon: '💬', type: 'comment', text: '新评论待审核', time: '5分钟前' },
  { id: 3, icon: '⭐', type: 'rating', text: '温榆河绿道收到5星好评', time: '10分钟前' }
])

const goBack = () => router.back()
const goToUsers = () => router.push('/mobile/admin/users')
const goToComments = () => router.push('/mobile/admin/comments')
const goToWebAdmin = () => { window.location.href = '/admin/dashboard' }

const refreshStats = async () => {
  if (!isLoggedIn.value || !token.value) return
  try {
    const res = await fetchDashboardStats(token.value)
    if (res.data) {
      stats.value = { ...stats.value, ...res.data }
    }
  } catch (e) {
    console.error('获取统计失败:', e)
  }
}

const clearCache = () => {
  localStorage.clear()
  alert('缓存已清除')
}

onMounted(() => {
  if (!isLoggedIn.value) {
    router.replace('/admin/login')
    return
  }
  refreshStats()
})
</script>

<style scoped>
.admin-home {
  min-height: 100vh;
  background: var(--color-bg);
}

.admin-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: calc(env(safe-area-inset-top, 12px) + 8px) 16px 14px;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
}
.admin-header h1 {
  flex: 1;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
}
.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-2);
  border: none;
  border-radius: 50%;
  color: var(--color-text-primary);
  cursor: pointer;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}
.stat-card-trend.warning {
  background: var(--fill-warning);
  color: var(--color-warning);
}

/* 管理区块 */
.admin-section {
  padding: 0 16px 20px;
}
.section-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 4px;
}
.admin-menu {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.action-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.action-chip:active {
  background: var(--color-surface-2);
}

/* 活动列表 */
.activity-list {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 0.5px solid var(--color-divider);
}
.activity-item:last-child { border-bottom: none; }
.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: var(--color-surface-2);
}
.activity-icon.user { background: rgba(102, 126, 234, 0.15); }
.activity-icon.comment { background: rgba(17, 153, 142, 0.15); }
.activity-icon.rating { background: rgba(245, 166, 35, 0.15); }
.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.activity-text {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}
.activity-time {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.bottom-safe {
  height: calc(env(safe-area-inset-bottom, 0px) + 20px);
}
</style>
