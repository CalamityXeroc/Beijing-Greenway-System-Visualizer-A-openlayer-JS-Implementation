<template>
  <div class="admin-comments-page">
    <!-- 顶部导航 -->
    <div class="page-nav">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <h1>评论审核</h1>
      <button class="refresh-btn" @click="loadComments">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      </button>
    </div>

    <!-- 状态标签页 -->
    <div class="tabs-bar">
      <button class="tab-item" :class="{ active: statusFilter === '' }" @click="statusFilter = ''; loadComments()">
        全部
        <span class="tab-badge" v-if="stats.all">{{ stats.all }}</span>
      </button>
      <button class="tab-item" :class="{ active: statusFilter === 'pending' }" @click="statusFilter = 'pending'; loadComments()">
        待审核
        <span class="tab-badge warning" v-if="stats.pending">{{ stats.pending }}</span>
      </button>
      <button class="tab-item" :class="{ active: statusFilter === 'visible' }" @click="statusFilter = 'visible'; loadComments()">
        已通过
      </button>
      <button class="tab-item" :class="{ active: statusFilter === 'hidden' }" @click="statusFilter = 'hidden'; loadComments()">
        已隐藏
      </button>
    </div>

    <!-- 批量操作栏 -->
    <Transition name="slide-down">
      <div class="batch-bar" v-if="selectedIds.length">
        <span class="batch-count">已选 {{ selectedIds.length }} 条</span>
        <button class="batch-btn approve" @click="batchApprove">通过</button>
        <button class="batch-btn reject" @click="batchReject">下架</button>
        <button class="batch-btn clear" @click="selectedIds = []">清空</button>
      </div>
    </Transition>

    <!-- 评论列表 -->
    <div class="comment-list" v-if="!loading">
      <div class="comment-card" v-for="comment in comments" :key="comment.id">
        <div class="comment-card-header">
          <label class="checkbox-wrap" @click.stop>
            <input type="checkbox" :checked="selectedIds.includes(comment.id)" @change="toggleSelect(comment.id)" />
            <span class="checkbox-icon"></span>
          </label>
          <div class="comment-info">
            <div class="comment-user">{{ comment.nickname || comment.username || '匿名用户' }}</div>
            <div class="comment-meta">
              {{ comment.greenway_name || `绿道#${comment.greenway_id}` }}
              <span class="dot">·</span>
              {{ formatTime(comment.created_at) }}
            </div>
          </div>
          <span class="status-tag" :class="comment.status">{{ statusLabel(comment.status) }}</span>
        </div>
        
        <div class="comment-rating">
          <span class="stars">{{ renderStars(comment.rating) }}</span>
          <span class="likes">👍 {{ comment.like_count || 0 }}</span>
        </div>
        
        <p class="comment-content">{{ comment.content }}</p>
        
        <div class="comment-actions">
          <button v-if="comment.status === 'pending'" class="action-btn approve" @click="approveComment(comment)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            通过
          </button>
          <button v-if="comment.status !== 'hidden'" class="action-btn reject" @click="rejectComment(comment)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            下架
          </button>
          <button v-if="comment.status === 'hidden'" class="action-btn restore" @click="restoreComment(comment)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            恢复
          </button>
        </div>
      </div>

      <div v-if="!comments.length" class="empty-state-enhanced">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p class="empty-state-title">暂无评论</p>
        <p class="empty-state-desc">{{ statusFilter ? '当前筛选条件下没有评论' : '还没有任何评论' }}</p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-skeleton">
      <div class="skeleton-comment" v-for="i in 4" :key="i">
        <div class="skeleton skeleton-avatar" style="width: 20px; height: 20px;"></div>
        <div class="skeleton-info" style="flex: 1;">
          <div class="skeleton skeleton-text" style="width: 100px;"></div>
          <div class="skeleton skeleton-text" style="width: 80%;"></div>
          <div class="skeleton skeleton-text" style="width: 60%;"></div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="!loading && totalPages > 1">
      <button class="pg-btn" :disabled="page <= 1" @click="page--; loadComments()">上一页</button>
      <span class="pg-info">{{ page }} / {{ totalPages }}</span>
      <button class="pg-btn" :disabled="page >= totalPages" @click="page++; loadComments()">下一页</button>
    </div>

    <div class="bottom-safe"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth } from '@/stores/adminAuth'
import { fetchAdminComments, updateCommentStatus, batchUpdateCommentStatus, fetchCommentStats } from '../services/api'

const router = useRouter()
const { token, isLoggedIn } = useAdminAuth()

const loading = ref(true)
const comments = ref([])
const statusFilter = ref('')
const page = ref(1)
const pageSize = 15
const total = ref(0)
const totalPages = ref(1)
const selectedIds = ref([])

const stats = ref({ all: 0, pending: 0, visible: 0, hidden: 0 })

const goBack = () => router.back()

const statusLabel = (status) => {
  const map = { pending: '待审核', visible: '已通过', hidden: '已隐藏' }
  return map[status] || status
}

const renderStars = (n) => '★'.repeat(Math.min(5, Math.max(0, n || 0))) + '☆'.repeat(5 - Math.min(5, Math.max(0, n || 0)))

const formatTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

const loadComments = async () => {
  if (!isLoggedIn.value) {
    router.replace('/admin/login')
    return
  }
  loading.value = true
  try {
    const res = await fetchAdminComments({
      keyword: '',
      userKeyword: '',
      status: statusFilter.value,
      page: page.value,
      pageSize
    }, token.value)
    comments.value = res.data?.list || []
    total.value = res.data?.total || 0
    totalPages.value = Math.max(1, Math.ceil(total.value / pageSize))
  } catch (e) {
    console.error('加载评论失败:', e)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await fetchCommentStats(30, token.value)
    const dist = res.data?.statusDistribution || {}
    stats.value = {
      all: (dist.pending || 0) + (dist.visible || 0) + (dist.hidden || 0),
      pending: dist.pending || 0,
      visible: dist.visible || 0,
      hidden: dist.hidden || 0
    }
  } catch (e) {
    console.error('加载统计失败:', e)
  }
}

const toggleSelect = (id) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

const approveComment = async (comment) => {
  try {
    await updateCommentStatus(comment.id, 'visible', token.value)
    await loadComments()
    await loadStats()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

const rejectComment = async (comment) => {
  try {
    await updateCommentStatus(comment.id, 'hidden', token.value)
    await loadComments()
    await loadStats()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

const restoreComment = async (comment) => {
  try {
    await updateCommentStatus(comment.id, 'visible', token.value)
    await loadComments()
    await loadStats()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

const batchApprove = async () => {
  if (!selectedIds.value.length) return
  try {
    await batchUpdateCommentStatus(selectedIds.value, 'visible', token.value)
    selectedIds.value = []
    await loadComments()
    await loadStats()
  } catch (e) {
    alert(e.message || '批量操作失败')
  }
}

const batchReject = async () => {
  if (!selectedIds.value.length) return
  try {
    await batchUpdateCommentStatus(selectedIds.value, 'hidden', token.value)
    selectedIds.value = []
    await loadComments()
    await loadStats()
  } catch (e) {
    alert(e.message || '批量操作失败')
  }
}

onMounted(() => {
  loadComments()
  loadStats()
})
</script>

<style scoped>
.admin-comments-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.page-nav {
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
.page-nav h1 {
  flex: 1;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
}
.back-btn, .refresh-btn {
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

/* 标签页 */
.tabs-bar {
  display: flex;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
  padding: 0 8px;
}
.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 4px;
  background: none;
  border: none;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  position: relative;
  transition: color var(--transition-fast);
}
.tab-item.active {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: var(--color-primary);
  border-radius: 2px;
}
.tab-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  background: var(--color-surface-2);
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
}
.tab-badge.warning {
  background: var(--fill-warning);
  color: var(--color-warning);
}

/* 批量操作栏 */
.batch-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
}
.batch-count {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
.batch-btn {
  padding: 6px 14px;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.batch-btn.approve { background: var(--fill-primary); color: var(--color-primary); }
.batch-btn.reject { background: var(--fill-warning); color: var(--color-warning); }
.batch-btn.clear { background: var(--color-surface-2); color: var(--color-text-secondary); }

/* 评论列表 */
.comment-list { padding: 12px 16px; }
.comment-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}
.comment-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}
.checkbox-wrap {
  position: relative;
  cursor: pointer;
}
.checkbox-wrap input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.checkbox-icon {
  display: block;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  transition: all var(--transition-fast);
}
.checkbox-wrap input:checked + .checkbox-icon {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.checkbox-wrap input:checked + .checkbox-icon::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.comment-info { flex: 1; min-width: 0; }
.comment-user {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
.comment-meta {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: 2px;
}
.dot { margin: 0 4px; opacity: 0.5; }

.comment-rating {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.stars { color: #f5a623; font-size: 12px; }
.likes { font-size: var(--text-xs); color: var(--color-text-tertiary); }

.comment-content {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  line-height: 1.6;
  margin: 0 0 12px;
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
.action-btn.approve { background: var(--fill-primary); color: var(--color-primary); }
.action-btn.reject { background: var(--fill-warning); color: var(--color-warning); }
.action-btn.restore { background: rgba(50, 173, 230, 0.12); color: var(--color-info); }
.action-btn:active { opacity: 0.7; }

/* 骨架屏 */
.loading-skeleton { padding: 12px 16px; }
.skeleton-comment {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  margin-bottom: 12px;
}
.skeleton-info { display: flex; flex-direction: column; gap: 8px; }

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
}
.pg-btn {
  padding: 8px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}
.pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pg-info { font-size: var(--text-sm); color: var(--color-text-tertiary); }

/* 过渡动画 */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }

.bottom-safe { height: calc(env(safe-area-inset-bottom, 0px) + 20px); }
</style>
