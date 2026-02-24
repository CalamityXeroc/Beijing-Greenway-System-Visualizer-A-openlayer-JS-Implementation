<template>
  <div class="map-view">
    <!-- 鍦板浘鍏ㄥ睆瀹瑰櫒 -->
    <div ref="mapContainer" class="map-container" :class="{ 'night-mode': isDark }"></div>

    <!-- 椤堕儴鎼滅储鏍忥紙鎮诞鍦ㄥ湴鍥句笂鏂癸級 -->
    <div class="top-bar">
      <div class="search-pill" @click="showSearch">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>搜索绿道、景点…</span>
      </div>
    </div>

    <!-- 鍙充晶 FAB 鎸夐挳缁?-->
    <div class="fab-column">
      <!-- 瀹氫綅 -->
      <button class="fab fab-surface" title="我的位置" @click="locateUser">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
        </svg>
      </button>
      <!-- 澶滈棿/鏃ラ棿鍒囨崲 -->
    </div>

    <!-- 搴曢儴娓愬彉閬僵 + 瀵艰埅鏍?-->
    <div class="bottom-gradient"></div>

    <!-- 绿道信息面板 -->
    <Transition name="trail-sheet">
      <div v-if="selectedTrail" class="trail-sheet">
        <div class="sheet-drag-bar"></div>
        <div class="sheet-row">
          <div class="sheet-color-dot" :style="{ background: selectedTrail.color }"></div>
          <div class="sheet-text">
            <h3 class="sheet-name">{{ selectedTrail.name }}</h3>
            <p v-if="selectedTrail.area" class="sheet-area">{{ selectedTrail.area }}</p>
          </div>
          <button class="sheet-close-btn" @click="selectedTrail = null" aria-label="关闭">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="sheet-chips">
          <span v-if="selectedTrail.length" class="s-chip">{{ selectedTrail.length }}km</span>
          <span v-if="selectedTrail.area" class="s-chip">{{ selectedTrail.area }}</span>
          <span v-if="selectedTrail.features" class="s-chip">{{ selectedTrail.features.split('、')[0] }}</span>
        </div>
        <p v-if="selectedTrail.description" class="sheet-desc">{{ selectedTrail.description.length > 80 ? selectedTrail.description.slice(0, 80) + '…' : selectedTrail.description }}</p>
        <button class="sheet-go-btn" @click="goToDetail(selectedTrail.id)">
          查看详情
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </Transition>

    <MobileBottomNav v-model="activeTab" />
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Stroke } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import { getCurrentLocation } from '../composables/useCapacitor'
import { useAppTheme } from '../composables/useAppTheme'

const router = useRouter()
const mapContainer = ref(null)
let map = null
const mapInstance = shallowRef(null)
const activeTab = ref('map')
const { isDark } = useAppTheme()
const selectedTrail = ref(null)
const goToDetail = (id) => { if (id) router.push(`/mobile/detail/${id}`) }

/* ---- 地图初始化 ---- */
const initMap = () => {
  if (!mapContainer.value) return
  const rect = mapContainer.value.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    setTimeout(() => initMap(), 200); return
  }

  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        className: 'gaode-base-layer',
        source: new XYZ({
          url: 'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
          crossOrigin: 'anonymous',
          tileSize: 256
        })
      })
    ],
    view: new View({
      center: fromLonLat([116.4074, 39.9042]),
      zoom: 12
    }),
    controls: []  // 鍘绘帀榛樿 OL 鎺т欢
  })

  mapInstance.value = map
  loadAllGreenways()
}

/* ---- 鍔犺浇缁块亾鏁版嵁 ---- */
const loadAllGreenways = async () => {
  try {
    const res = await fetch('/api/greenways')
    if (!res.ok) throw new Error(`API ${res.status}`)
    const geojson = await res.json()

    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, { featureProjection: 'EPSG:3857' })
    })

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => new Style({
        stroke: new Stroke({ color: feature.get('color') || '#2E7D32', width: 4 })
      }),
      zIndex: 10
    })

    map.addLayer(vectorLayer)

    const extent = vectorSource.getExtent()
    if (extent?.length === 4 && !extent.includes(Infinity)) {
      map.getView().fit(extent, { padding: [80, 20, 140, 20], duration: 800 })
    }

    // 点击绿道显示信息面板
    map.on('click', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, f => f)
      if (!feature) { selectedTrail.value = null; return }
      const p = feature.getProperties()
      selectedTrail.value = {
        id: p.id || p.gid || null,
        name: p.name || '未知绿道',
        length: p.length,
        area: p.area || p.district || '',
        color: p.color || '#2E9640',
        description: p.description || p.introduction || '',
        features: p.features || ''
      }
    })

    map.on('pointermove', (event) => {
      map.getTargetElement().style.cursor = map.hasFeatureAtPixel(event.pixel) ? 'pointer' : ''
    })
  } catch (e) {
    console.error('加载绿道失败:', e)
  }
}

/* ---- 定位 ---- */
const locateUser = async () => {
  try {
    const loc = await getCurrentLocation()
    map?.getView().animate({ center: fromLonLat([loc.lng, loc.lat]), zoom: 15, duration: 500 })
  } catch {
    map?.getView().animate({ center: fromLonLat([116.4074, 39.9042]), zoom: 12, duration: 500 })
  }
}

const showSearch = () => router.push('/mobile/list?search=true')

onMounted(async () => {
  await nextTick()
  setTimeout(initMap, 300)
})

onUnmounted(() => { map?.dispose() })
</script>

<style scoped>
.map-view {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 鍦板浘鍏ㄥ睆 */
.map-container {
  position: absolute;
  inset: 0;
  background: #e8f0e8;
}

/* 澶滈棿妯″紡婊ら暅 */
.map-container.night-mode :deep(.gaode-base-layer) {
  filter: grayscale(100%) invert(100%) sepia(100%)
          hue-rotate(190deg) saturate(400%) brightness(88%) contrast(85%) !important;
}
.map-container.night-mode :deep(.ol-layer:not(.gaode-base-layer)) {
  filter: brightness(1.3) drop-shadow(0 0 6px rgba(100, 220, 140, 0.5));
}

/* 椤堕儴鎮诞鎼滅储鏍?*/
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: max(14px, calc(var(--safe-top) + 10px)) 16px 10px;
  z-index: var(--z-float);
  pointer-events: none;
}

.search-pill {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 16px;
  background: var(--color-surface);
  border-radius: 22px;
  box-shadow: var(--shadow-lg);
  color: var(--color-text-secondary);
  font-size: var(--text-base);
  cursor: pointer;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.theme-light .search-pill { background: rgba(255,255,255,0.92); }
.theme-dark  .search-pill { background: rgba(44,44,46,0.92); }
.search-pill:active { transform: scale(0.97); }

/* 鍙充晶 FAB 鍒?*/
.fab-column {
  position: absolute;
  right: 14px;
  bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 20px);
  z-index: var(--z-float);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fab {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  transition: transform var(--transition-spring);
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
}
.fab:active { transform: scale(0.88); }

.fab-surface {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 0.5px solid var(--color-border);
}
.theme-light .fab-surface { background: rgba(255,255,255,0.95); }
.theme-dark  .fab-surface { background: rgba(44,44,46,0.95); }

/* 搴曢儴娓愬彉閬僵锛堝钩婊戣繃娓″埌搴曢儴瀵艰埅锛?*/
.bottom-gradient {
  position: absolute;
  bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) - 1px);
  left: 0;
  right: 0;
  height: 48px;
  background: linear-gradient(to top, var(--color-surface) 0%, transparent 100%);
  opacity: 0.6;
  pointer-events: none;
  z-index: calc(var(--z-fixed) - 1);
}

/* 绿道信息面板 */
.trail-sheet {
  position: absolute;
  left: 0; right: 0;
  bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px));
  z-index: var(--z-overlay);
  background: var(--color-surface);
  border-radius: 20px 20px 0 0;
  padding: 8px 16px 16px;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.18);
}
.sheet-drag-bar {
  width: 36px; height: 4px;
  background: var(--color-surface-3);
  border-radius: 2px;
  margin: 0 auto 12px;
}
.sheet-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}
.sheet-color-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  flex: 0 0 12px;
  margin-top: 4px;
}
.sheet-text { flex: 1; min-width: 0; }
.sheet-name {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}
.sheet-area {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}
.sheet-close-btn {
  flex: 0 0 32px;
  width: 32px; height: 32px;
  border-radius: 50%; border: none;
  background: var(--color-surface-2);
  color: var(--color-text-tertiary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.sheet-chips {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-bottom: 8px;
}
.s-chip {
  padding: 4px 10px;
  background: var(--color-surface-2);
  border-radius: var(--radius-full);
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}
.sheet-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0 0 12px;
}
.sheet-go-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 46px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}
.sheet-go-btn:active { opacity: 0.82; }
.sheet-go-btn:disabled { background: var(--color-surface-3); color: var(--color-text-tertiary); }

/* 面板出入场动画 */
.trail-sheet-enter-active, .trail-sheet-leave-active {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
.trail-sheet-enter-from, .trail-sheet-leave-to { transform: translateY(100%); }
</style>
