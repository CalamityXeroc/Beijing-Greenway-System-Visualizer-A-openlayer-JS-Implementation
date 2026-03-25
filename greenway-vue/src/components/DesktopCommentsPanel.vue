<template>
  <section class="comments-panel">
    <div class="comments-head">
      <h3><i class="fas fa-comments"></i> 用户评论</h3>
      <div class="summary">
        <span class="avg">{{ avgRating.toFixed(1) }}</span>
        <span class="stars">{{ stars(Math.round(avgRating)) }}</span>
        <span class="count">{{ total }} 条</span>
      </div>
    </div>

    <div class="publish-box">
      <div class="rating-row">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="star-btn"
          :class="{ active: n <= (rating || 0) }"
          @click="rating = n"
        >★</button>
        <button type="button" class="rating-clear" @click="rating = null">不评分</button>
        <span class="rating-text">{{ rating ? `${rating} 星` : '未评分' }}</span>
      </div>

      <textarea
        v-model="draft"
        class="draft"
        maxlength="500"
        placeholder="分享一下这条绿道的体验、路况或风景..."
      ></textarea>

      <div class="publish-footer">
        <span class="counter">{{ draft.length }}/500</span>
        <div class="btns">
          <button class="btn preview" @click="previewing = !previewing">{{ previewing ? '关闭预览' : '预览' }}</button>
          <button class="btn primary" :disabled="submitting" @click="submit">{{ submitting ? '提交中...' : '发布评论' }}</button>
        </div>
      </div>

      <div v-if="previewing && draft.trim()" class="preview-box">
        <div class="preview-title">预览</div>
        <div class="preview-content">{{ draft.trim() }}</div>
      </div>
    </div>

    <div class="toolbar">
      <button class="sort-btn" :class="{ active: sort === 'newest' }" @click="changeSort('newest')">最新</button>
      <button class="sort-btn" :class="{ active: sort === 'hot' }" @click="changeSort('hot')">最热</button>
    </div>

    <div v-if="loading" class="hint">评论加载中...</div>
    <div v-else-if="error" class="hint error">{{ error }}</div>
    <div v-else-if="!list.length" class="hint">还没有评论，欢迎第一个发言</div>

    <div v-else class="comment-list">
      <article v-for="item in list" :key="item.id" class="comment-card">
        <header class="card-head">
          <div class="user-meta">
            <strong>{{ item.nickname || item.username || '匿名用户' }}</strong>
            <span class="meta-row">
              <span class="stars" v-if="item.rating">{{ stars(item.rating) }}</span>
              <span class="unrated" v-else>未评分</span>
              <span>{{ formatTime(item.created_at) }}</span>
            </span>
          </div>
          <div class="head-actions">
            <button v-if="isOwner(item)" class="link danger" @click="remove(item)">删除</button>
            <button class="link" @click="report(item)">举报</button>
          </div>
        </header>
        <p class="content">{{ item.content }}</p>
        <footer class="card-foot">
          <button class="like-btn" :class="{ active: item.liked_by_me }" @click="toggleLike(item)">
            👍 有用 {{ item.like_count || 0 }}
          </button>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useUserAuth } from '@/stores/userAuth'
import {
  fetchGreenwayByName,
  fetchGreenways,
  fetchCommentsByGreenway,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
  reportComment
} from '@/mobile/services/api'

const props = defineProps({
  greenwayName: {
    type: String,
    required: true
  }
})

const { isLoggedIn, token, currentUser } = useUserAuth()

const greenwayId = ref(null)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const list = ref([])
const total = ref(0)
const avgRating = ref(0)
const sort = ref('newest')

const draft = ref('')
const rating = ref(null)
const previewing = ref(false)

function normalizeGreenwayName(value) {
  return String(value || '')
    .replace(/^北京/, '')
    .replace(/示范段/g, '')
    .replace(/滨水/g, '')
    .replace(/城市/g, '')
    .replace(/绿道/g, '')
    .replace(/\s+/g, '')
    .toLowerCase()
}

function stars(n) {
  const m = Math.max(0, Math.min(5, Number(n || 0)))
  return '★'.repeat(m) + '☆'.repeat(5 - m)
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function isOwner(item) {
  return Number(item.user_id) === Number(currentUser.value?.id)
}

async function resolveGreenwayId() {
  const res = await fetchGreenwayByName(props.greenwayName)
  let id = res.features?.[0]?.properties?.id

  if (!id) {
    const all = await fetchGreenways()
    const target = normalizeGreenwayName(props.greenwayName)
    const found = (all.features || []).find((feature) => {
      const name = normalizeGreenwayName(feature?.properties?.name)
      return Boolean(name) && (target.includes(name) || name.includes(target))
    })
    id = found?.properties?.id
  }

  if (!id) throw new Error('未找到对应绿道 ID')
  greenwayId.value = Number(id)
}

async function loadComments() {
  if (!greenwayId.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await fetchCommentsByGreenway(greenwayId.value, {
      sort: sort.value,
      token: token.value || null
    })
    list.value = res.data?.list || []
    total.value = Number(res.data?.summary?.total || 0)
    avgRating.value = Number(res.data?.summary?.avgRating || 0)
  } catch (err) {
    error.value = err.message || '评论加载失败'
  } finally {
    loading.value = false
  }
}

function changeSort(v) {
  sort.value = v
  loadComments()
}

async function submit() {
  if (!isLoggedIn.value) {
    alert('请先登录后评论')
    return
  }
  if (!greenwayId.value) {
    alert('当前绿道ID未识别成功，请刷新页面后重试')
    return
  }
  const content = draft.value.trim()
  if (!content) {
    alert('请输入评论内容')
    return
  }
  if (content.length > 500) {
    alert('评论最多 500 字')
    return
  }
  submitting.value = true
  try {
    const resp = await createComment(
      { greenwayId: greenwayId.value, content, rating: rating.value },
      token.value
    )
    draft.value = ''
    rating.value = null
    previewing.value = false
    alert(resp.message || '评论发布成功，待审核后展示')
    await loadComments()
  } catch (err) {
    alert(err.message || '评论发布失败')
  } finally {
    submitting.value = false
  }
}

async function toggleLike(item) {
  if (!isLoggedIn.value) {
    alert('请先登录后点赞')
    return
  }
  try {
    if (item.liked_by_me) {
      const res = await unlikeComment(item.id, token.value)
      item.liked_by_me = false
      item.like_count = Number(res.data?.likeCount ?? item.like_count ?? 0)
    } else {
      const res = await likeComment(item.id, token.value)
      item.liked_by_me = true
      item.like_count = Number(res.data?.likeCount ?? item.like_count ?? 0)
    }
  } catch (err) {
    alert(err.message || '操作失败')
  }
}

async function remove(item) {
  if (!isOwner(item)) return
  if (!window.confirm('确定删除这条评论吗？')) return
  try {
    await deleteComment(item.id, token.value)
    await loadComments()
  } catch (err) {
    alert(err.message || '删除失败')
  }
}

async function report(item) {
  if (!isLoggedIn.value) {
    alert('请先登录后举报')
    return
  }
  const reason = window.prompt('请输入举报原因（如：广告、辱骂、违法信息）', '不当内容')
  if (!reason) return
  try {
    await reportComment(item.id, { reason: reason.slice(0, 100) }, token.value)
    alert('举报已提交，感谢反馈')
  } catch (err) {
    alert(err.message || '举报失败')
  }
}

watch(() => props.greenwayName, async () => {
  if (!props.greenwayName) return
  try {
    await resolveGreenwayId()
    await loadComments()
  } catch (err) {
    error.value = err.message || '绿道信息解析失败'
  }
})

onMounted(async () => {
  try {
    await resolveGreenwayId()
    await loadComments()
  } catch (err) {
    error.value = err.message || '绿道信息解析失败'
  }
})
</script>

<style scoped>
.comments-panel {
  margin: 28px auto 0;
  width: calc(100% - 64px);
  max-width: 1440px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #dbe4f0;
  padding: 24px;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
}
.comments-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.comments-head h3 {
  margin: 0;
  color: #0f1f3d;
  font-size: 1.2rem;
}
.summary { display: flex; gap: 8px; align-items: center; font-size: 14px; color: #475569; }
.avg { font-size: 22px; font-weight: 700; color: #0f172a; }
.stars { color: #f59e0b; letter-spacing: 0.5px; }

.publish-box {
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  padding: 14px;
  background: linear-gradient(180deg, #f8fbff 0%, #f4f8ff 100%);
}
.rating-row { display: flex; align-items: center; gap: 5px; margin-bottom: 10px; }
.star-btn { border: none; background: transparent; color: #94a3b8; font-size: 26px; cursor: pointer; padding: 0; }
.star-btn.active { color: #f59e0b; }
.rating-clear {
  border: 1px solid #c4d3e7;
  background: #fff;
  color: #475569;
  border-radius: 999px;
  padding: 4px 10px;
  margin-left: 8px;
  font-size: 12px;
  cursor: pointer;
}
.rating-text { margin-left: 10px; font-size: 14px; color: #334155; font-weight: 600; }
.draft {
  width: 100%;
  min-height: 150px;
  resize: vertical;
  border: 1px solid #bccadd;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 16px;
  line-height: 1.7;
  color: #111111;
  box-sizing: border-box;
  background: #fff;
}
.draft::placeholder { color: #6b7280; }
.draft:focus {
  outline: none;
  border-color: #2b6de3;
  box-shadow: 0 0 0 3px rgba(43, 109, 227, 0.16);
}
.publish-footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.counter { font-size: 13px; color: #475569; }
.btns { display: flex; gap: 8px; }
.btn {
  border: 1px solid #bfd0e6;
  border-radius: 10px;
  padding: 8px 15px;
  font-size: 13px;
  font-weight: 600;
  background: #fff;
  cursor: pointer;
}
.btn.primary { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }
.btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }

.preview-box {
  margin-top: 12px;
  background: #fff;
  border-radius: 12px;
  border: 1px dashed #9fb4cf;
  padding: 12px 14px;
}
.preview-title { font-size: 13px; color: #334155; margin-bottom: 8px; font-weight: 600; }
.preview-content { font-size: 16px; color: #111111; white-space: pre-wrap; line-height: 1.7; }

.toolbar { margin-top: 16px; display: flex; gap: 8px; }
.sort-btn {
  border: 1px solid #c4d3e7;
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  background: #fff;
  cursor: pointer;
}
.sort-btn.active { background: #1d4ed8; border-color: #1d4ed8; color: #fff; }

.hint { padding: 16px 6px; font-size: 14px; color: #64748b; }
.hint.error { color: #dc2626; }

.comment-list { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
.comment-card {
  border: 1px solid #dde6f3;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
}
.card-head { display: flex; justify-content: space-between; gap: 10px; }
.user-meta strong { font-size: 14px; color: #111827; }
.meta-row { display: flex; gap: 8px; font-size: 12px; color: #6b7280; margin-top: 4px; }
.unrated { color: #64748b; font-size: 12px; }
.head-actions { display: flex; gap: 8px; }
.link { border: none; background: transparent; color: #2563eb; cursor: pointer; font-size: 13px; }
.link.danger { color: #dc2626; }
.content { margin: 8px 0; font-size: 15px; line-height: 1.8; color: #1f2937; white-space: pre-wrap; }
.card-foot { display: flex; justify-content: flex-end; }
.like-btn {
  border: none;
  background: #eaf1fb;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
}
.like-btn.active { background: #dbeafe; color: #1d4ed8; }

@media (max-width: 768px) {
  .comments-panel {
    width: calc(100% - 24px);
    padding: 14px;
    border-radius: 14px;
  }

  .draft {
    min-height: 120px;
    font-size: 15px;
  }
}

:global([data-theme="night"] .comments-panel) {
  background: #171a20;
  border-color: #2d3340;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.38);
}

:global([data-theme="night"] .comments-head h3) {
  color: #e5e7eb;
}

:global([data-theme="night"] .summary),
:global([data-theme="night"] .rating-text),
:global([data-theme="night"] .counter),
:global([data-theme="night"] .hint),
:global([data-theme="night"] .meta-row),
:global([data-theme="night"] .unrated) {
  color: #aeb8c7;
}

:global([data-theme="night"] .avg),
:global([data-theme="night"] .user-meta strong),
:global([data-theme="night"] .content) {
  color: #e5e7eb;
}

:global([data-theme="night"] .publish-box),
:global([data-theme="night"] .comment-card) {
  background: #1f2430;
  border-color: #313949;
}

:global([data-theme="night"] .draft),
:global([data-theme="night"] .preview-box),
:global([data-theme="night"] .btn),
:global([data-theme="night"] .sort-btn),
:global([data-theme="night"] .rating-clear) {
  background: #11151d;
  border-color: #3a4354;
  color: #d1d5db;
}

:global([data-theme="night"] .draft::placeholder) {
  color: #7c8799;
}

:global([data-theme="night"] .preview-content) {
  color: #e5e7eb;
}

:global([data-theme="night"] .btn.primary),
:global([data-theme="night"] .sort-btn.active) {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}

:global([data-theme="night"] .like-btn) {
  background: #263449;
  color: #c7d2e4;
}
</style>
