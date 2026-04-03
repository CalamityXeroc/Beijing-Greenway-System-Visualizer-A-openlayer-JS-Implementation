<template>
  <div class="comments-page">
    <!-- 顶部导航 -->
    <div class="topbar">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h1>我的评论</h1>
      <button class="refresh-btn" @click="loadMyComments" :disabled="loading">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loading }">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-bar" v-if="comments.length">
      <div class="stat-chip">
        <span class="stat-num">{{ comments.length }}</span>
        <span class="stat-label">条评论</span>
      </div>
      <div class="stat-chip">
        <span class="stat-num">{{ visibleCount }}</span>
        <span class="stat-label">已显示</span>
      </div>
    </div>

    <!-- 状态提示 -->
    <div v-if="loading" class="state-card">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="state-card error">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadMyComments">重试</button>
    </div>
    <div v-else-if="!comments.length" class="state-card empty">
      <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <h3>还没有评论</h3>
      <p>去绿道详情页发表你的第一条评论吧</p>
      <button class="explore-btn" @click="goExplore">探索绿道</button>
    </div>

    <!-- 评论列表 -->
    <div v-else class="comment-list">
      <article class="comment-card" v-for="item in comments" :key="item.id">
        <div class="comment-header">
          <div class="greenway-info" @click="goToGreenway(item)">
            <span class="greenway-icon">🌿</span>
            <span class="greenway-name">{{ item.greenway_name || `绿道 #${item.greenway_id}` }}</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
          <span class="status-badge" :class="item.status">
            {{ item.status === 'visible' ? '已显示' : item.status === 'pending' ? '审核中' : '已隐藏' }}
          </span>
        </div>

        <div class="comment-rating">
          <span class="stars">{{ renderStars(item.rating) }}</span>
          <span class="rating-text">{{ item.rating }}星评价</span>
        </div>

        <p class="comment-content">{{ item.content }}</p>

        <div class="comment-footer">
          <span class="comment-time">{{ formatTime(item.created_at) }}</span>
          <div class="comment-actions">
            <button class="action-btn like" v-if="item.like_count">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
              {{ item.like_count }}
            </button>
            <button class="action-btn delete" @click="removeComment(item.id)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              删除
            </button>
          </div>
        </div>
      </article>
    </div>

    <div class="bottom-safe"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMyComments, deleteComment } from '../services/api'
import { useUserAuth } from '@/stores/userAuth'

const router = useRouter()
const { isLoggedIn, token } = useUserAuth()

const loading = ref(false)
const error = ref('')
const comments = ref([])

const visibleCount = computed(() => comments.value.filter(c => c.status === 'visible').length)

function goBack() {
  router.back()
}

function goExplore() {
  router.push('/mobile/list')
}

function goToGreenway(item) {
  router.push(`/mobile/detail/${item.greenway_id}`)
}

function renderStars(value) {
  const n = Math.max(0, Math.min(5, Number(value || 0)))
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function formatTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`
  return d.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

async function loadMyComments() {
  if (!isLoggedIn.value) {
    error.value = '请先登录后查看评论'
    comments.value = []
    return
  }

  loading.value = true
  error.value = ''
  try {
    const res = await fetchMyComments(token.value)
    comments.value = res.data?.list || []
  } catch (err) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

async function removeComment(id) {
  const confirmed = window.confirm('确定删除这条评论吗？')
  if (!confirmed) return

  try {
    await deleteComment(id, token.value)
    await loadMyComments()
  } catch (err) {
    alert(err.message || '删除失败')
  }
}

onMounted(() => {
  loadMyComments()
})
</script>

<style scoped>
.comments-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text-primary);
}

/* 顶部栏 */
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top, 12px) + 8px) 16px 14px;
}
.topbar h1 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
}
.back-btn, .refresh-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--color-surface-2);
  color: var(--color-text-primary);
  border-radius: 50%;
  cursor: pointer;
}
.refresh-btn:disabled { opacity: 0.5; }
.spinning { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 统计栏 */
.stats-bar {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
}
.stat-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
}
.stat-num {
  font-size: var(--text-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

/* 状态卡片 */
.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: var(--color-text-secondary);
}
.state-card h3 {
  font-size: var(--text-lg);
  color: var(--color-text-primary);
  margin: 16px 0 8px;
}
.state-card p {
  font-size: var(--text-sm);
  margin: 0;
}
.state-card.error { color: var(--color-error); }
.state-card.empty svg { opacity: 0.3; }
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-surface-3);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}
.retry-btn, .explore-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
}

/* 评论列表 */
.comment-list {
  padding: 0 16px 16px;
}
.comment-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.greenway-info {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--color-text-primary);
}
.greenway-icon { font-size: 16px; }
.greenway-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}
.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: var(--radius-full);
}
.status-badge.visible { background: var(--fill-primary); color: var(--color-primary); }
.status-badge.pending { background: rgba(50, 173, 230, 0.12); color: var(--color-info); }
.status-badge.hidden { background: var(--fill-error); color: var(--color-error); }

.comment-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.stars {
  color: #f5a623;
  font-size: 14px;
  letter-spacing: 1px;
}
.rating-text {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.comment-content {
  font-size: var(--text-base);
  line-height: 1.7;
  color: var(--color-text-primary);
  margin: 0 0 12px;
  white-space: pre-wrap;
}

.comment-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 0.5px solid var(--color-divider);
}
.comment-time {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
.comment-actions {
  display: flex;
  gap: 8px;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.action-btn.like {
  background: var(--color-surface-2);
  color: var(--color-text-secondary);
}
.action-btn.delete {
  background: var(--fill-error);
  color: var(--color-error);
}
.action-btn:active { opacity: 0.7; }

.bottom-safe {
  height: calc(env(safe-area-inset-bottom, 0px) + 20px);
}
</style>
