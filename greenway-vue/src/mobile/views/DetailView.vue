<template>
  <div class="detail-view" :class="{ 'theme-dark': isDark }">
    <!-- 顶部导航栏 -->
    <div class="detail-header">
      <button class="icon-btn" @click="goBack" aria-label="返回">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <h1 class="header-title">{{ trail?.name || '绿道详情' }}</h1>
      <button class="icon-btn fav-btn" :class="{ active: isFavorite }" @click="toggleFavorite" aria-label="收藏">
        <svg viewBox="0 0 24 24" width="20" height="20" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadTrail">重试</button>
    </div>

    <!-- 绿道内容 -->
    <div v-else-if="trail" class="detail-content">
      <!-- 迷你地图 -->
      <div ref="miniMapEl" class="mini-map-container"></div>
      <div v-if="!mapReady" class="map-placeholder">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4M9 7l6-3"/></svg>
      </div>

      <!-- 绿道名称 + 色彩条 -->
      <div class="trail-hero" :style="{ '--trail-color': trailColor }">
        <div class="trail-color-bar"></div>
        <h2 class="trail-name">{{ trail.name }}</h2>
        <p class="trail-area" v-if="trail.area || trail.district">{{ trail.area || trail.district }}</p>
      </div>

      <!-- 信息芯片 -->
      <div class="info-chips">
        <div class="chip" v-if="trail.length">
          <span class="chip-icon">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3"/></svg>
          </span>
          <span>{{ trail.length }} km</span>
        </div>
        <div class="chip" v-if="trail.area || trail.district">
          <span class="chip-icon">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </span>
          <span>{{ trail.area || trail.district }}</span>
        </div>
        <div class="chip" v-if="trail.surface">
          <span class="chip-icon">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
          </span>
          <span>{{ trail.surface }}</span>
        </div>
      </div>

      <!-- 简介 -->
      <section class="section" v-if="trail.description || trail.introduction">
        <h3 class="section-title">简介</h3>
        <p class="desc-text">{{ trail.description || trail.introduction }}</p>
      </section>

      <!-- 特色标签 -->
      <section class="section" v-if="featureList.length">
        <h3 class="section-title">特色亮点</h3>
        <div class="feature-tags">
          <span class="feature-tag" v-for="f in featureList" :key="f">{{ f }}</span>
        </div>
      </section>

      <!-- 详细信息表 -->
      <section class="section">
        <h3 class="section-title">详细信息</h3>
        <div class="info-table">
          <div class="info-row" v-if="trail.length">
            <span class="row-label">总长度</span>
            <span class="row-value">{{ trail.length }} km</span>
          </div>
          <div class="info-row" v-if="trail.area || trail.district">
            <span class="row-label">所在区域</span>
            <span class="row-value">{{ trail.area || trail.district }}</span>
          </div>
          <div class="info-row" v-if="trail.surface">
            <span class="row-label">路面类型</span>
            <span class="row-value">{{ trail.surface }}</span>
          </div>
          <div class="info-row" v-if="trail.start_name">
            <span class="row-label">起点</span>
            <span class="row-value">{{ trail.start_name }}</span>
          </div>
          <div class="info-row" v-if="trail.end_name">
            <span class="row-label">终点</span>
            <span class="row-value">{{ trail.end_name }}</span>
          </div>
          <div class="info-row" v-if="trail.id || trail.gid">
            <span class="row-label">编号</span>
            <span class="row-value"># {{ trail.id || trail.gid }}</span>
          </div>
        </div>
      </section>

      <!-- 操作按钮 -->
      <div class="action-row">
        <button class="action-btn primary" @click="navigateTo">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          导航前往
        </button>
        <button class="action-btn secondary" @click="shareTrail">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          分享
        </button>
      </div>

      <!-- 底部安全区 -->
      <div class="bottom-safe"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSONFormat from 'ol/format/GeoJSON'
import XYZ from 'ol/source/XYZ'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import { fromLonLat } from 'ol/proj'
import { useAppTheme } from '../composables/useAppTheme'

const router = useRouter()
const route = useRoute()
const { isDark } = useAppTheme()

const trailId = route.params.id
const trail = ref(null)
const loading = ref(true)
const error = ref(null)
const isFavorite = ref(false)
const miniMapEl = ref(null)
const mapReady = ref(false)
let miniMap = null

const trailColor = computed(() => trail.value?.color || '#2E9640')

const featureList = computed(() => {
  if (!trail.value?.features) return []
  return trail.value.features.split(/[,，、;；]/).map(s => s.trim()).filter(Boolean)
})

async function loadTrail() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('/api/greenways')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const features = data.features || []
    const found = features.find(f => {
      const p = f.properties
      return String(p.id) === String(trailId) || String(p.gid) === String(trailId)
    })
    if (!found) throw new Error('未找到该绿道')
    trail.value = { ...found.properties, _geojson: found }
  } catch (e) {
    error.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function initMiniMap() {
  if (!miniMapEl.value || !trail.value?._geojson) return

  const color = trailColor.value

  const vectorSource = new VectorSource({
    features: new GeoJSONFormat().readFeatures(trail.value._geojson, {
      featureProjection: 'EPSG:3857'
    })
  })

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      stroke: new Stroke({ color, width: 4 }),
      fill: new Fill({ color: color + '33' })
    })
  })

  const tileSource = new XYZ({
    url: isDark.value
      ? 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
      : 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    maxZoom: 18
  })

  miniMap = new Map({
    target: miniMapEl.value,
    layers: [new TileLayer({ source: tileSource }), vectorLayer],
    view: new View({ center: fromLonLat([116.4, 39.9]), zoom: 12 }),
    controls: [],
    interactions: []
  })

  const extent = vectorSource.getExtent()
  if (extent && extent[0] !== Infinity) {
    miniMap.getView().fit(extent, { padding: [24, 24, 24, 24], maxZoom: 16 })
  }

  mapReady.value = true
}

function goBack() {
  router.back()
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value
}

function navigateTo() {
  if (!trail.value) return
  const name = encodeURIComponent(trail.value.name || '绿道')
  window.open(`https://uri.amap.com/search?keywords=${name}&sourceApplication=greenway`, '_blank')
}

function shareTrail() {
  if (navigator.share && trail.value) {
    navigator.share({ title: trail.value.name, text: trail.value.description || trail.value.introduction || '' }).catch(() => {})
  } else {
    const url = window.location.href
    navigator.clipboard?.writeText(url).then(() => alert('链接已复制')).catch(() => {})
  }
}

onMounted(async () => {
  await loadTrail()
  if (trail.value) {
    await new Promise(r => setTimeout(r, 50))
    initMiniMap()
  }
})

onUnmounted(() => {
  if (miniMap) { miniMap.setTarget(null); miniMap = null }
})
</script>

<style scoped>
.detail-view {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text-primary);
  overflow: hidden;
}

/* 顶部栏 */
.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: calc(env(safe-area-inset-top, 12px) + 4px) 12px 12px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex: 0 0 auto;
  z-index: var(--z-fixed);
}
.icon-btn {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent;
  color: var(--color-text-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background var(--transition-fast);
  flex: 0 0 40px;
}
.icon-btn:active { background: var(--color-surface-2); }
.fav-btn.active { color: #e53935; }
.header-title {
  flex: 1;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

/* 加载 / 错误 */
.loading-state, .error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--color-text-secondary);
}
.spinner {
  width: 36px; height: 36px;
  border: 3px solid var(--color-surface-3);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.retry-btn {
  padding: 10px 24px;
  background: var(--color-primary);
  color: #fff;
  border: none; border-radius: var(--radius-full);
  font-size: var(--text-base);
  cursor: pointer;
}

/* 滚动内容 */
.detail-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 迷你地图 */
.mini-map-container {
  width: 100%;
  height: 200px;
  background: var(--color-surface-2);
  position: relative;
}
.map-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

/* 绿道标题区 */
.trail-hero {
  padding: 16px 16px 8px;
  border-left: 4px solid var(--trail-color, var(--color-primary));
  margin: 12px 16px;
  background: var(--color-surface-2);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.trail-color-bar { display: none; }
.trail-name {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.trail-area {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

/* 信息芯片 */
.info-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 16px;
}
.chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: var(--color-surface-2);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}
.chip-icon { display: flex; align-items: center; }

/* 通用 section */
.section {
  padding: 0 16px 20px;
}
.section-title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 10px;
}
.desc-text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0;
}

/* 特色标签 */
.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.feature-tag {
  padding: 6px 14px;
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: var(--font-weight-medium);
}

/* 信息表格 */
.info-table {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.info-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}
.info-row:last-child { border-bottom: none; }
.row-label {
  width: 88px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  flex: 0 0 88px;
}
.row-value {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  text-align: right;
}

/* 操作按钮 */
.action-row {
  display: flex;
  gap: 12px;
  padding: 8px 16px 20px;
}
.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}
.action-btn:active { opacity: 0.8; }
.action-btn.primary {
  background: var(--color-primary);
  color: #fff;
}
.action-btn.secondary {
  background: var(--color-surface-2);
  color: var(--color-text-primary);
}

.bottom-safe {
  height: calc(env(safe-area-inset-bottom, 0px) + 16px);
}
</style>
