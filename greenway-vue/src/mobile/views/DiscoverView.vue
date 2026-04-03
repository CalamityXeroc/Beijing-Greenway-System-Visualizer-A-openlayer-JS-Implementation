<template>
  <div class="discover-page">
    <!-- 顶部大标题 -->
    <div class="page-header-large">
      <h1 class="page-title-large">发现</h1>
      <p class="page-subtitle">探索北京绿道，发现美好生活</p>
    </div>

    <!-- 可滚动内容区 -->
    <div class="scroll-area" ref="scrollEl">
      <!-- 轮播图 -->
      <div class="carousel-section">
        <div class="carousel" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
          <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div class="carousel-slide" v-for="(item, idx) in banners" :key="idx" @click="viewDetail(item)">
              <div class="slide-bg" :style="{ background: item.gradient }"></div>
              <div class="slide-content">
                <span class="slide-badge">{{ item.badge }}</span>
                <h3 class="slide-title">{{ item.title }}</h3>
                <p class="slide-desc">{{ item.desc }}</p>
              </div>
              <div class="slide-icon">{{ item.icon }}</div>
            </div>
          </div>
          <div class="carousel-dots">
            <span v-for="(_, idx) in banners" :key="idx" 
              class="carousel-dot" :class="{ active: idx === currentSlide }"></span>
          </div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="quick-section">
        <div class="quick-grid">
          <button class="quick-item" v-for="entry in quickEntries" :key="entry.id" @click="handleQuickEntry(entry)">
            <span class="quick-item-icon" :style="{ background: entry.bg }">{{ entry.icon }}</span>
            <span class="quick-item-label">{{ entry.label }}</span>
          </button>
        </div>
      </div>

      <!-- 热门绿道 -->
      <section class="section">
        <div class="section-header">
          <span class="section-title">🔥 热门绿道</span>
          <button class="section-action" @click="goToList">查看全部</button>
        </div>
        <div class="hot-trails">
          <div class="hot-trail-card" v-for="trail in hotTrails" :key="trail.id" @click="viewTrailDetail(trail)">
            <div class="hot-trail-rank" :class="{ top: trail.rank <= 3 }">{{ trail.rank }}</div>
            <div class="hot-trail-info">
              <h4 class="hot-trail-name">{{ trail.name }}</h4>
              <p class="hot-trail-meta">
                <span>{{ trail.length }}km</span>
                <span class="dot">·</span>
                <span>{{ trail.area }}</span>
              </p>
            </div>
            <div class="hot-trail-score">
              <span class="score-value">{{ trail.score }}</span>
              <span class="score-star">★</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 社区动态 -->
      <section class="section">
        <div class="section-header">
          <span class="section-title">💬 社区动态</span>
          <button class="section-action" @click="refreshFeed">刷新</button>
        </div>
        
        <!-- 骨架屏 -->
        <div v-if="feedLoading" class="feed-skeleton">
          <div class="feed-card" v-for="i in 2" :key="i">
            <div class="feed-card-header">
              <div class="skeleton skeleton-avatar"></div>
              <div class="feed-card-info">
                <div class="skeleton skeleton-text" style="width: 80px;"></div>
                <div class="skeleton skeleton-text-sm" style="width: 60px;"></div>
              </div>
            </div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 70%;"></div>
          </div>
        </div>

        <!-- 动态列表 -->
        <div v-else class="feed-list">
          <article class="feed-card" v-for="feed in feedList" :key="feed.id">
            <div class="feed-card-header">
              <div class="avatar avatar-md" :style="{ background: getAvatarBg(feed.user) }">
                {{ feed.user?.charAt(0) || '?' }}
              </div>
              <div class="feed-card-info">
                <span class="feed-card-name">{{ feed.user }}</span>
                <span class="feed-card-meta">
                  {{ feed.greenway }} · {{ formatTime(feed.time) }}
                </span>
              </div>
              <span class="feed-rating">{{ renderStars(feed.rating) }}</span>
            </div>
            <p class="feed-card-content">{{ feed.content }}</p>
            <div class="feed-card-actions">
              <button class="feed-action-btn" :class="{ active: feed.liked }" @click="toggleFeedLike(feed)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                {{ feed.likes || 0 }}
              </button>
              <button class="feed-action-btn" @click="viewComment(feed)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                回复
              </button>
            </div>
          </article>
        </div>

        <!-- 加载更多 -->
        <div v-if="!feedLoading && feedList.length" class="load-more">
          <button class="load-more-btn" @click="loadMoreFeed" :disabled="loadingMore">
            {{ loadingMore ? '加载中...' : '加载更多动态' }}
          </button>
        </div>
      </section>

      <!-- 底部安全区 -->
      <div class="nav-spacer"></div>
    </div>

    <!-- 底部导航 -->
    <MobileBottomNav v-model="activeTab" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import { fetchGreenways, fetchRecentComments } from '../services/api'

const router = useRouter()
const activeTab = ref('discover')
const scrollEl = ref(null)
const currentSlide = ref(0)
const feedLoading = ref(true)
const loadingMore = ref(false)
const feedList = ref([])
const hotTrails = ref([])

// 轮播图数据
const banners = [
  { 
    title: '温榆河绿道', 
    desc: '京城最美滨河骑行线', 
    badge: '精选推荐',
    icon: '🌊',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    id: 1
  },
  { 
    title: '奥林匹克森林公园', 
    desc: '感受绿色奥运遗产', 
    badge: '热门打卡',
    icon: '🌳',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    id: 9
  },
  { 
    title: '亮马河绿道', 
    desc: '城市夜景最佳观赏地', 
    badge: '新鲜上线',
    icon: '🌃',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    id: 3
  }
]

// 快捷入口
const quickEntries = [
  { id: 'nearby', icon: '📍', label: '附近', bg: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'hot', icon: '🔥', label: '热门', bg: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 'riding', icon: '🚴', label: '骑行', bg: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { id: 'running', icon: '🏃', label: '跑步', bg: 'linear-gradient(135deg, #fc4a1a, #f7b733)' }
]

// 轮播自动播放
let slideTimer = null
const startAutoSlide = () => {
  slideTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % banners.length
  }, 4000)
}
const stopAutoSlide = () => {
  if (slideTimer) clearInterval(slideTimer)
}

// 触摸滑动
let touchStartX = 0
const onTouchStart = (e) => {
  stopAutoSlide()
  touchStartX = e.touches[0].clientX
}
const onTouchMove = () => {}
const onTouchEnd = (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX
  if (Math.abs(diff) > 50) {
    if (diff > 0 && currentSlide.value < banners.length - 1) {
      currentSlide.value++
    } else if (diff < 0 && currentSlide.value > 0) {
      currentSlide.value--
    }
  }
  startAutoSlide()
}

// 加载热门绿道
const loadHotTrails = async () => {
  try {
    const geojson = await fetchGreenways()
    const features = geojson.features || []
    hotTrails.value = features
      .slice(0, 5)
      .map((f, idx) => ({
        id: f.properties?.id || idx,
        name: f.properties?.name || '未知绿道',
        length: parseFloat(f.properties?.length) || 0,
        area: f.properties?.area || f.properties?.district || '北京',
        score: (4 + Math.random()).toFixed(1),
        rank: idx + 1
      }))
  } catch (e) {
    console.error('加载热门绿道失败:', e)
  }
}

// 加载社区动态
const loadFeed = async () => {
  feedLoading.value = true
  try {
    const res = await fetchRecentComments(10)
    feedList.value = (res.data?.list || []).map(c => ({
      id: c.id,
      user: c.nickname || c.username || '绿道爱好者',
      greenway: c.greenway_name || `绿道#${c.greenway_id}`,
      content: c.content,
      rating: c.rating || 5,
      time: c.created_at,
      likes: c.like_count || 0,
      liked: false
    }))
  } catch (e) {
    console.error('加载动态失败:', e)
    feedList.value = []
  } finally {
    feedLoading.value = false
  }
}

const refreshFeed = () => loadFeed()
const loadMoreFeed = async () => {
  loadingMore.value = true
  await new Promise(r => setTimeout(r, 1000))
  loadingMore.value = false
}

// 工具函数
const getAvatarBg = (name) => {
  const colors = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #11998e, #38ef7d)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #fc4a1a, #f7b733)'
  ]
  return colors[(name?.charCodeAt(0) || 0) % colors.length]
}

const renderStars = (n) => '★'.repeat(Math.min(5, Math.max(0, n))) + '☆'.repeat(5 - Math.min(5, Math.max(0, n)))

const formatTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`
  return d.toLocaleDateString('zh-CN')
}

// 交互
const viewDetail = (item) => router.push(`/mobile/detail/${item.id}`)
const viewTrailDetail = (trail) => router.push(`/mobile/detail/${trail.id}`)
const goToList = () => router.push('/mobile/list')
const handleQuickEntry = (entry) => {
  if (entry.id === 'nearby' || entry.id === 'hot') {
    router.push({ path: '/mobile/list', query: { filter: entry.id } })
  } else {
    router.push('/mobile/list')
  }
}
const toggleFeedLike = (feed) => { feed.liked = !feed.liked; feed.likes += feed.liked ? 1 : -1 }
const viewComment = (feed) => router.push(`/mobile/detail/${feed.greenway_id || 1}`)

onMounted(() => {
  startAutoSlide()
  loadHotTrails()
  loadFeed()
})

onUnmounted(() => {
  stopAutoSlide()
})
</script>

<style scoped>
.discover-page {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg);
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* 轮播图 */
.carousel-section {
  padding: 0 16px 16px;
}
.carousel {
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
.carousel-track {
  display: flex;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.carousel-slide {
  flex: 0 0 100%;
  position: relative;
  height: 180px;
  cursor: pointer;
}
.slide-bg {
  position: absolute;
  inset: 0;
}
.slide-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  color: #fff;
}
.slide-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(255,255,255,0.2);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 8px;
  backdrop-filter: blur(8px);
}
.slide-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.slide-desc {
  font-size: 13px;
  margin: 6px 0 0;
  opacity: 0.9;
}
.slide-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 40px;
  opacity: 0.3;
}
.carousel-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}
.carousel-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  transition: all 0.3s;
}
.carousel-dot.active {
  width: 20px;
  border-radius: 3px;
  background: #fff;
}

/* 快捷入口 */
.quick-section {
  padding: 8px 0 20px;
}

/* 热门绿道 */
.hot-trails {
  padding: 0 16px;
}
.hot-trail-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  margin-bottom: 10px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--transition-fast);
}
.hot-trail-card:active {
  transform: scale(0.98);
}
.hot-trail-rank {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--color-surface-2);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hot-trail-rank.top {
  background: linear-gradient(135deg, #f5af19, #f12711);
  color: #fff;
}
.hot-trail-info {
  flex: 1;
  min-width: 0;
}
.hot-trail-name {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hot-trail-meta {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin: 4px 0 0;
}
.hot-trail-meta .dot {
  margin: 0 4px;
}
.hot-trail-score {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.score-value {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
}
.score-star {
  color: #f5a623;
  font-size: 14px;
}

/* 动态 */
.feed-list {
  padding: 0 16px;
}
.feed-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}
.feed-rating {
  color: #f5a623;
  font-size: 12px;
}

/* 加载更多 */
.load-more {
  padding: 16px;
  text-align: center;
}
.load-more-btn {
  padding: 12px 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.load-more-btn:active:not(:disabled) {
  background: var(--color-surface-2);
}
.load-more-btn:disabled {
  opacity: 0.6;
}

/* 通用 */
.section {
  padding: 20px 0;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 14px;
}
.section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}
.section-action {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.nav-spacer {
  height: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 16px);
}
</style>
