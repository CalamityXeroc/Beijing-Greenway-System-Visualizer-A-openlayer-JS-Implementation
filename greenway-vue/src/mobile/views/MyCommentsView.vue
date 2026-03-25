<template>
  <div class="comments-page">
    <div class="topbar">
      <button class="back-btn" @click="goBack">返回</button>
      <h1>我的评论</h1>
      <button class="refresh-btn" @click="loadMyComments">刷新</button>
    </div>

    <div v-if="loading" class="state">加载中...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="!comments.length" class="state">你还没有发布评论</div>

    <div v-else class="comment-list">
      <article class="comment-item" v-for="item in comments" :key="item.id">
        <header class="comment-head">
          <div>
            <h3>{{ item.greenway_name || `绿道 #${item.greenway_id}` }}</h3>
            <p>{{ formatTime(item.created_at) }}</p>
          </div>
          <span class="status" :class="item.status">{{ item.status === 'visible' ? '已显示' : '已隐藏' }}</span>
        </header>

        <p class="rating">{{ renderStars(item.rating) }}</p>
        <p class="content">{{ item.content }}</p>

        <div class="actions">
          <button class="delete-btn" @click="removeComment(item.id)">删除</button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMyComments, deleteComment } from '../services/api'
import { useUserAuth } from '@/stores/userAuth'

const router = useRouter()
const { isLoggedIn, token } = useUserAuth()

const loading = ref(false)
const error = ref('')
const comments = ref([])

function goBack() {
  router.back()
}

function renderStars(value) {
  const n = Math.max(0, Math.min(5, Number(value || 0)))
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function formatTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
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

.topbar {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top, 12px) + 6px) 12px 12px;
}

.topbar h1 {
  margin: 0;
  font-size: 16px;
}

.back-btn,
.refresh-btn {
  border: none;
  background: var(--color-surface-2);
  color: var(--color-text-primary);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
}

.state {
  padding: 24px 16px;
  color: var(--color-text-secondary);
}

.state.error {
  color: var(--color-error, #e53935);
}

.comment-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 12px;
}

.comment-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.comment-head h3 {
  margin: 0;
  font-size: 14px;
}

.comment-head p {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.status {
  font-size: 11px;
  border-radius: 999px;
  padding: 2px 8px;
}

.status.visible {
  background: rgba(46, 204, 113, 0.15);
  color: #2e9640;
}

.status.hidden {
  background: rgba(244, 67, 54, 0.15);
  color: #d84315;
}

.rating {
  color: #f5a623;
  margin: 8px 0 4px;
}

.content {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.delete-btn {
  border: none;
  background: transparent;
  color: var(--color-error, #e53935);
  font-size: 12px;
}
</style>
