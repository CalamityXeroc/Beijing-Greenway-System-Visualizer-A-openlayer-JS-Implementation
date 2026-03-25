<template>
  <section class="comments-panel">
    <div class="comments-head">
      <div class="head-main">
        <h3><i class="fas fa-comments"></i> 绿道讨论区</h3>
        <p class="head-sub">分享沿途风景、路况体验和骑行建议</p>
      </div>
      <div class="summary social-summary">
        <div class="summary-pill score-pill">
          <span class="avg">{{ avgRating.toFixed(1) }}</span>
          <span class="stars">{{ stars(Math.round(avgRating)) }}</span>
        </div>
        <div class="summary-pill">{{ total }} 条讨论</div>
        <div class="summary-pill">{{ sort === 'newest' ? '按最新' : '按最热' }}</div>
      </div>
    </div>

    <div class="publish-box" v-if="!replyingToId">
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
          <button type="button" class="btn preview" @click="previewing = !previewing">{{ previewing ? '关闭预览' : '预览' }}</button>
          <button type="button" class="btn primary" :disabled="submitting" @click="submit">{{ submitting ? '提交中...' : '发布评论' }}</button>
        </div>
      </div>

      <div v-if="previewing && draft.trim()" class="preview-box">
        <div class="preview-title">预览</div>
        <div class="preview-content">{{ draft.trim() }}</div>
      </div>
    </div>

    <div class="toolbar">
      <button type="button" class="sort-btn" :class="{ active: sort === 'newest' }" @click="changeSort('newest')">最新</button>
      <button type="button" class="sort-btn" :class="{ active: sort === 'hot' }" @click="changeSort('hot')">最热</button>
    </div>

    <div v-if="loading" class="hint">评论加载中...</div>
    <div v-else-if="error" class="hint error">{{ error }}</div>
    <div v-else-if="!list.length" class="hint">还没有评论，欢迎第一个发言</div>

    <div v-else class="comment-list floor-list">
      <article
        v-for="row in floorRows"
        :key="row.item.id"
        class="comment-card floor-card"
        :style="{ '--floor-depth': row.depth }"
      >
        <div class="floor-rail" v-if="row.depth > 0"></div>
        <header class="card-head">
          <div class="user-meta">
            <div class="floor-title-row">
              <span class="avatar-badge">{{ getAvatarInitial(row.item) }}</span>
              <strong>{{ displayName(row.item) }}</strong>
            </div>
            <span class="meta-row">
              <span class="reply-target" v-if="row.replyToName">回复 {{ row.replyToName }}</span>
              <span class="stars" v-if="row.item.rating">{{ stars(row.item.rating) }}</span>
              <span class="unrated" v-else-if="row.depth === 0">未评分</span>
              <span>{{ formatTime(row.item.created_at) }}</span>
            </span>
          </div>
          <div class="head-actions">
            <button type="button" class="link" @click="startReply(row.item)">回复</button>
            <button type="button" v-if="isOwner(row.item)" class="link danger" @click="remove(row.item)">删除</button>
            <button type="button" class="link" @click="report(row.item)">举报</button>
          </div>
        </header>
        <p class="content">{{ row.item.content }}</p>

        <div v-if="replyingToId === row.item.id" class="reply-box">
          <div class="reply-head">回复 {{ displayName(row.item) }}</div>
          <textarea
            v-model="replyDraft"
            class="draft reply-draft"
            maxlength="500"
            placeholder="继续这一层的讨论..."
          ></textarea>
          <div class="reply-actions">
            <span class="counter">{{ replyDraft.length }}/500</span>
            <div class="btns">
              <button type="button" class="btn" @click="cancelReply">取消</button>
              <button type="button" class="btn primary" :disabled="replySubmitting" @click="submitReply(row.item)">
                {{ replySubmitting ? '提交中...' : '发布回复' }}
              </button>
            </div>
          </div>
        </div>

        <footer class="card-foot">
          <button type="button" class="like-btn" :class="{ active: row.item.liked_by_me }" @click="toggleLike(row.item)">
            👍 有用 {{ row.item.like_count || 0 }}
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
const replyingToId = ref(null)
const replyDraft = ref('')
const replySubmitting = ref(false)

const floorRows = computed(() => {
  const rows = []
  const byId = new Map()
  const top = []

  for (const item of list.value) {
    byId.set(item.id, { ...item, children: [] })
  }

  for (const node of byId.values()) {
    if (node.parent_comment_id && byId.has(node.parent_comment_id)) {
      byId.get(node.parent_comment_id).children.push(node)
    } else {
      top.push(node)
    }
  }

  const time = (v) => new Date(v?.created_at || 0).getTime()
  const rootSorter = sort.value === 'hot'
    ? (a, b) => (Number(b.like_count || 0) - Number(a.like_count || 0)) || (time(b) - time(a))
    : (a, b) => time(b) - time(a)

  const childSorter = (a, b) => time(a) - time(b)

  function walk(node, depth, label, replyToName) {
    rows.push({
      item: node,
      depth,
      floorLabel: label,
      replyToName
    })

    node.children.sort(childSorter)
    node.children.forEach((child, index) => {
      walk(child, depth + 1, `${label}-${index + 1}`, displayName(node))
    })
  }

  top.sort(rootSorter)
  top.forEach((node, index) => {
    walk(node, 0, String(index + 1), '')
  })

  return rows
})

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

function displayName(item) {
  return item?.nickname || item?.username || '匿名用户'
}

function getAvatarInitial(item) {
  const name = displayName(item)
  return String(name).trim().slice(0, 1).toUpperCase() || '匿'
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

function startReply(item) {
  if (!isLoggedIn.value) {
    alert('请先登录后回复')
    return
  }
  replyingToId.value = item.id
  replyDraft.value = ''
}

function cancelReply() {
  replyingToId.value = null
  replyDraft.value = ''
}

async function submitReply(parentItem) {
  if (!isLoggedIn.value) {
    alert('请先登录后回复')
    return
  }
  if (!greenwayId.value) {
    alert('当前绿道ID未识别成功，请刷新页面后重试')
    return
  }
  const content = replyDraft.value.trim()
  if (!content) {
    alert('请输入回复内容')
    return
  }
  if (content.length > 500) {
    alert('回复最多 500 字')
    return
  }

  replySubmitting.value = true
  try {
    const resp = await createComment(
      {
        greenwayId: greenwayId.value,
        content,
        parentCommentId: parentItem.id
      },
      token.value
    )
    cancelReply()
    alert(resp.message || '回复发布成功')
    await loadComments()
  } catch (err) {
    alert(err.message || '回复发布失败')
  } finally {
    replySubmitting.value = false
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
  --gw-primary: #2e9640;
  --gw-primary-deep: #1a5c20;
  --gw-primary-soft: #d8f3dc;
  --gw-surface: #ffffff;
  --gw-surface-soft: #f6fbf7;
  --gw-border: #d3e4d5;
  --gw-text-main: #1d2a1f;
  --gw-text-muted: #5f7263;
  --gw-danger: #d83b3b;
  --gw-star: #f7a72a;

  margin: 28px auto 0;
  width: calc(100% - 56px);
  max-width: 1380px;
  background: radial-gradient(circle at 95% 0%, #eef9f0 0%, #ffffff 40%) var(--gw-surface);
  border-radius: 22px;
  border: 1px solid var(--gw-border);
  padding: 26px;
  box-shadow: 0 18px 40px rgba(30, 56, 33, 0.08);
}
.comments-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 14px;
  margin-bottom: 14px;
}
.comments-head h3 {
  margin: 0;
  color: var(--gw-text-main);
  font-size: 1.25rem;
  letter-spacing: 0.2px;
}
.head-main { display: flex; flex-direction: column; gap: 4px; }
.head-sub { margin: 0; font-size: 13px; color: var(--gw-text-muted); }

.summary { display: flex; gap: 8px; align-items: center; font-size: 13px; color: var(--gw-text-muted); }
.social-summary { flex-wrap: wrap; justify-content: flex-end; }
.summary-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--gw-surface-soft);
  border: 1px solid var(--gw-border);
}
.score-pill {
  background: linear-gradient(90deg, #ecf8ee 0%, #f7fdf8 100%);
}
.avg { font-size: 18px; font-weight: 700; color: var(--gw-primary-deep); }
.stars { color: var(--gw-star); letter-spacing: 0.5px; }

.publish-box {
  border: 1px solid var(--gw-border);
  border-radius: 16px;
  padding: 16px;
  background: linear-gradient(180deg, #f8fcf9 0%, #f3faf5 100%);
}
.rating-row { display: flex; align-items: center; gap: 5px; margin-bottom: 10px; }
.star-btn { border: none; background: transparent; color: #b8c6ba; font-size: 26px; cursor: pointer; padding: 0; }
.star-btn.active { color: var(--gw-star); }
.rating-clear {
  border: 1px solid var(--gw-border);
  background: var(--gw-surface);
  color: var(--gw-text-muted);
  border-radius: 999px;
  padding: 4px 10px;
  margin-left: 8px;
  font-size: 12px;
  cursor: pointer;
}
.rating-text { margin-left: 10px; font-size: 13px; color: var(--gw-text-muted); font-weight: 600; }
.draft {
  width: 100%;
  min-height: 140px;
  resize: vertical;
  border: 1px solid var(--gw-border);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--gw-text-main);
  box-sizing: border-box;
  background: var(--gw-surface);
}
.draft::placeholder { color: #8a9a8d; }
.draft:focus {
  outline: none;
  border-color: var(--gw-primary);
  box-shadow: 0 0 0 3px rgba(46, 150, 64, 0.16);
}
.publish-footer {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.counter { font-size: 12px; color: var(--gw-text-muted); }
.btns { display: flex; gap: 8px; }
.btn {
  border: 1px solid var(--gw-border);
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  background: var(--gw-surface);
  color: var(--gw-text-main);
  cursor: pointer;
  transition: background 0.16s, border-color 0.16s, transform 0.16s;
}
.btn:hover { background: #eef7f0; border-color: #b8d4bc; }
.btn:active { transform: translateY(1px); }

.btn.primary {
  background: var(--gw-primary);
  color: #fff;
  border-color: var(--gw-primary);
}
.btn.primary:hover {
  background: #277f36;
  border-color: #277f36;
}
.btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }

.preview-box {
  margin-top: 12px;
  background: #fbfefb;
  border-radius: 12px;
  border: 1px dashed #b8d5bd;
  padding: 12px 14px;
}
.preview-title { font-size: 12px; color: var(--gw-text-muted); margin-bottom: 8px; font-weight: 600; }
.preview-content { font-size: 15px; color: var(--gw-text-main); white-space: pre-wrap; line-height: 1.8; }

.toolbar { margin-top: 16px; display: flex; gap: 8px; }
.sort-btn {
  border: 1px solid var(--gw-border);
  border-radius: 999px;
  padding: 7px 13px;
  font-size: 13px;
  font-weight: 600;
  background: var(--gw-surface);
  color: var(--gw-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}
.sort-btn.active {
  background: #e6f4e8;
  border-color: #b5d8ba;
  color: var(--gw-primary-deep);
}

.hint { padding: 16px 6px; font-size: 14px; color: var(--gw-text-muted); }
.hint.error { color: var(--gw-danger); }

.comment-list { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
.comment-card {
  border: 1px solid var(--gw-border);
  border-radius: 14px;
  padding: 14px;
  background: var(--gw-surface);
}
.floor-list { gap: 12px; }
.floor-card {
  position: relative;
  margin-left: calc(var(--floor-depth, 0) * 10px);
  background: linear-gradient(180deg, #ffffff 0%, #f8fcf9 100%);
  border-color: #d2e3d5;
  box-shadow: 0 5px 14px rgba(27, 71, 36, 0.06);
}
.floor-rail {
  position: absolute;
  left: -8px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: linear-gradient(180deg, #8dc79a 0%, #c6e5cd 100%);
  border-radius: 2px;
}
.card-head { display: flex; justify-content: space-between; gap: 10px; }
.floor-title-row { display: flex; align-items: center; gap: 8px; }
.avatar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: linear-gradient(135deg, #daf0de 0%, #c4e7cb 100%);
  color: #226530;
  font-size: 13px;
  font-weight: 700;
}
.user-meta strong { font-size: 14px; color: var(--gw-text-main); }
.meta-row { display: flex; gap: 8px; font-size: 12px; color: var(--gw-text-muted); margin-top: 4px; flex-wrap: wrap; }
.reply-target {
  color: #2f6f3a;
  background: #eaf7ed;
  padding: 0 8px;
  border-radius: 999px;
}
.unrated { color: var(--gw-text-muted); font-size: 12px; }
.head-actions { display: flex; gap: 8px; }
.link {
  border: none;
  background: transparent;
  color: #4e6453;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}
.link:hover { color: var(--gw-primary-deep); }
.link.danger { color: #b64141; }
.content {
  margin: 10px 0;
  font-size: 16px;
  line-height: 1.85;
  color: #233228;
  white-space: pre-wrap;
}
.reply-box {
  margin-top: 8px;
  border: 1px solid #c8dfcd;
  background: #f3faf5;
  border-radius: 12px;
  padding: 10px;
}
.reply-head {
  font-size: 12px;
  color: var(--gw-text-muted);
  font-weight: 600;
  margin-bottom: 8px;
}
.reply-draft {
  min-height: 90px;
  font-size: 14px;
}
.reply-actions {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-foot { display: flex; justify-content: flex-end; }
.like-btn {
  border: 1px solid #d3e7d7;
  background: #eef8f0;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  color: #415744;
  cursor: pointer;
  transition: all 0.15s ease;
}
.like-btn:hover { background: #e2f3e6; border-color: #bbd8c1; }
.like-btn.active {
  background: #ddf2e1;
  color: #20622f;
  border-color: #a6d2af;
}

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
  background: radial-gradient(circle at 92% 0%, #1a2a1d 0%, #111813 38%);
  border-color: #2b3e30;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.4);
}

:global([data-theme="night"] .comments-head h3) {
  color: #e3efe5;
}

:global([data-theme="night"] .summary),
:global([data-theme="night"] .head-sub),
:global([data-theme="night"] .rating-text),
:global([data-theme="night"] .counter),
:global([data-theme="night"] .hint),
:global([data-theme="night"] .meta-row),
:global([data-theme="night"] .unrated) {
  color: #9eb2a2;
}

:global([data-theme="night"] .avg),
:global([data-theme="night"] .user-meta strong),
:global([data-theme="night"] .content) {
  color: #e0ebdf;
}

:global([data-theme="night"] .publish-box),
:global([data-theme="night"] .comment-card) {
  background: #1a241d;
  border-color: #324837;
}

:global([data-theme="night"] .floor-card) {
  background: linear-gradient(180deg, #1b251e 0%, #17201a 100%);
  border-color: #39523f;
}

:global([data-theme="night"] .floor-rail) {
  background: linear-gradient(180deg, #4c7f57 0%, #35553c 100%);
}

:global([data-theme="night"] .avatar-badge) {
  background: linear-gradient(135deg, #2b4932 0%, #355d3e 100%);
  color: #bfe3c7;
}

:global([data-theme="night"] .reply-target) {
  background: #23392a;
  color: #a9d3b2;
}

:global([data-theme="night"] .draft),
:global([data-theme="night"] .preview-box),
:global([data-theme="night"] .btn),
:global([data-theme="night"] .sort-btn),
:global([data-theme="night"] .rating-clear) {
  background: #121b15;
  border-color: #38533f;
  color: #d0e3d1;
}

:global([data-theme="night"] .draft::placeholder) {
  color: #819784;
}

:global([data-theme="night"] .preview-content) {
  color: #dce8dc;
}

:global([data-theme="night"] .btn.primary),
:global([data-theme="night"] .sort-btn.active) {
  background: #2f8a42;
  border-color: #2f8a42;
  color: #fff;
}

:global([data-theme="night"] .like-btn) {
  background: #1f3124;
  color: #b6d3bc;
  border-color: #35553d;
}

:global([data-theme="night"] .reply-box) {
  background: #1b2d21;
  border-color: #37563e;
}

:global([data-theme="night"] .summary-pill) {
  background: #1b2b20;
  border-color: #35543c;
  color: #b1c9b5;
}
</style>
