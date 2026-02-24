<template>
  <div class="list-view">
    <!-- 固定顶部栏 -->
    <div class="list-header">
      <div class="header-inner">
        <h1 class="header-title">北京绿道</h1>
        <button class="icon-btn filter-btn" :class="{ active: showFilter }" @click="toggleFilter" aria-label="筛选">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
            <line x1="11" y1="18" x2="13" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          class="search-input"
          v-model="searchQuery"
          placeholder="搜索绿道名称或描述"
          @keyup.enter="handleSearch(searchQuery)"
          type="search"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''" aria-label="清除">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- 筛选面板 -->
      <Transition name="filter-slide">
        <div v-if="showFilter" class="filter-panel">
          <div class="filter-row">
            <span class="filter-label">难度</span>
            <div class="filter-chips">
              <button v-for="d in ['easy','medium','hard']" :key="d"
                class="filter-chip" :class="{ active: selectedDifficulty === d }"
                @click="selectedDifficulty = selectedDifficulty === d ? '' : d">
                {{ diffLabel[d] }}
              </button>
            </div>
          </div>
          <div class="filter-row">
            <span class="filter-label">距离  {{ maxDistance }}km</span>
            <input v-model.number="maxDistance" type="range" min="1" max="50" class="range-slider" />
          </div>
          <button class="filter-reset" @click="clearFilter">重置筛选</button>
        </div>
      </Transition>
    </div>

    <!-- 可滚动内容区 -->
    <div class="scroll-area" ref="scrollEl">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中</p>
      </div>

      <template v-else>
        <!-- 推荐 -->
        <div v-if="!searchQuery && featuredTrails.length" class="section">
          <div class="section-header">
            <span class="section-title">推荐</span>
            <span class="section-count">{{ featuredTrails.length }} 条</span>
          </div>
          <div class="card-list">
            <TrailCard v-for="trail in featuredTrails" :key="trail.id" :trail="trail"
              @click="viewDetail" @toggle-favorite="handleFav" />
          </div>
        </div>

        <!-- 全部 -->
        <div class="section">
          <div class="section-header">
            <span class="section-title">{{ searchQuery ? '搜索结果' : '全部绿道' }}</span>
            <span class="section-count">{{ filteredTrails.length }} 条</span>
          </div>

          <div v-if="filteredTrails.length" class="card-list">
            <TrailCard v-for="trail in filteredTrails" :key="trail.id" :trail="trail"
              @click="viewDetail" @toggle-favorite="handleFav" />
          </div>
          <div v-else class="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <p>没有匹配的绿道</p>
            <button class="btn-primary" style="min-height: 40px; font-size: 14px;" @click="clearFilter">清除筛选</button>
          </div>
        </div>

        <!-- 底部间距（为导航栏留空） -->
        <div class="nav-spacer"></div>
      </template>
    </div>

    <!-- 底部导航 -->
    <MobileBottomNav v-model="activeTab" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TrailCard from '../components/TrailCard.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'

const router = useRouter()
const route = useRoute()

const activeTab = ref('list')
const searchQuery = ref('')
const showFilter = ref(false)
const selectedDifficulty = ref('')
const maxDistance = ref(50)
const loading = ref(true)
const allTrails = ref([])
const scrollEl = ref(null)

const diffLabel = { easy: '简单', medium: '中等', hard: '困难' }

const fetchGreenways = async () => {
  try {
    loading.value = true
    const res = await fetch('/api/greenways')
    if (!res.ok) throw new Error(`API ${res.status}`)
    const geojson = await res.json()
    allTrails.value = (geojson.features || []).map(f => {
      const p = f.properties || {}
      return {
        id: p.id || Math.random(),
        name: p.name || '未知绿道',
        description: p.description || p.introduction || p.features || '',
        color: p.color,
        image: null,
        difficulty: 'medium',
        length: parseFloat(p.length) || 0,
        duration: '2-3小时',
        distance: Math.floor(Math.random() * 20) + 1,
        tags: p.features ? p.features.split('、').slice(0, 2) : ['绿道']
      }
    })
  } catch (e) {
    console.error('加载绿道失败:', e)
  } finally {
    loading.value = false
  }
}

const featuredTrails = computed(() => allTrails.value.slice(0, 3))

const filteredTrails = computed(() => {
  let list = allTrails.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t =>
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    )
  }
  if (selectedDifficulty.value) list = list.filter(t => t.difficulty === selectedDifficulty.value)
  list = list.filter(t => t.distance <= maxDistance.value)
  return list
})

const toggleFilter = () => { showFilter.value = !showFilter.value }
const clearFilter = () => { searchQuery.value = ''; selectedDifficulty.value = ''; maxDistance.value = 50; showFilter.value = false }
const handleSearch = (q) => { searchQuery.value = q }
const viewDetail = (trail) => router.push(`/mobile/detail/${trail.id}`)
const handleFav = ({ trail, isFavorite }) => console.log(`${isFavorite ? '收藏' : '取消'}:`, trail.name)

onMounted(() => {
  fetchGreenways()
  if (route.query.search === 'true') showFilter.value = true
})
</script>

<style scoped>
.list-view {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg);
}

/* 顶部固定栏 */
.list-header {
  flex: 0 0 auto;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
  padding-top: max(12px, var(--safe-top));
  z-index: var(--z-sticky);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 10px;
}
.header-title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.icon-btn {
  width: 36px; height: 36px;
  border-radius: 50%; border: none;
  background: var(--color-surface-2);
  color: var(--color-text-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.icon-btn.active { background: var(--fill-primary); color: var(--color-primary); }
.icon-btn:active { transform: scale(0.9); }

/* 搜索框 */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  margin: 0 16px 12px;
  background: var(--color-surface-2);
  border-radius: var(--radius-full);
}
.search-icon {
  position: absolute; left: 12px;
  color: var(--color-text-tertiary); pointer-events: none;
}
.search-input {
  flex: 1; border: none; background: none;
  padding: 10px 36px 10px 36px;
  font-size: var(--text-sm); color: var(--color-text-primary);
  appearance: none;
}
.search-input::placeholder { color: var(--color-text-tertiary); }
.clear-btn {
  position: absolute; right: 10px;
  width: 22px; height: 22px; border-radius: 50%; border: none;
  background: var(--color-text-tertiary); color: var(--color-surface);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}

/* 筛选面板 */
.filter-panel {
  padding: 12px 16px 14px;
  border-top: 0.5px solid var(--color-divider);
  display: flex; flex-direction: column; gap: 10px;
}
.filter-row { display: flex; align-items: center; gap: 12px; }
.filter-label { font-size: var(--text-sm); color: var(--color-text-secondary); white-space: nowrap; min-width: 60px; }
.filter-chips { display: flex; gap: 6px; }
.filter-chip {
  padding: 5px 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text-secondary);
  font-size: var(--text-sm); cursor: pointer;
  transition: all var(--transition-fast);
}
.filter-chip.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.range-slider { flex: 1; accent-color: var(--color-primary); height: 3px; }
.filter-reset { align-self: flex-end; padding: 5px 14px; background: none; border: 1px solid var(--color-border); border-radius: var(--radius-full); color: var(--color-text-secondary); font-size: var(--text-sm); cursor: pointer; }

/* 过渡动画 */
.filter-slide-enter-active, .filter-slide-leave-active { transition: all 0.2s ease; overflow: hidden; }
.filter-slide-enter-from, .filter-slide-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.filter-slide-enter-to, .filter-slide-leave-from { opacity: 1; max-height: 200px; }

/* 滚动区域 */
.scroll-area {
  flex: 1; overflow-y: auto; overscroll-behavior: contain;
}

/* 内容分节 */
.section { padding: 16px 16px 0; }
.section-header {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 12px;
}
.section-title { font-size: var(--text-lg); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
.section-count { font-size: var(--text-sm); color: var(--color-text-tertiary); }

.card-list { display: flex; flex-direction: column; gap: 10px; }

/* 加载状态 */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 64px 0; gap: 12px;
  color: var(--color-text-tertiary);
}
.spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--color-surface-3);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 空状态 */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 48px 24px; gap: 12px; color: var(--color-text-tertiary); text-align: center;
}
.empty-state svg { opacity: 0.4; }

/* 底部导航留空 */
.nav-spacer { height: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 16px); }
</style>
