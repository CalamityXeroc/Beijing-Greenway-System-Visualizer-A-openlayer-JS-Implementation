<template>
  <div class="wenyu-page">
    <header class="header">
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i> 返回
      </button>
      <div class="title-container">
        <h1>北京温榆河滨水绿道</h1>
        <p><i class="fas fa-leaf"></i> 沿河而行，探索城市绿色长廊</p>
      </div>
    </header>

    <div class="content">
      <div ref="leftSidebar" class="left-sidebar">
        <img
          src="/49f1f0c245a64fb1970046d610d3f0a5.jpeg"
          alt="温榆河绿道景观"
          class="feature-image"
          @error="handleImageError"
        />

        <div class="highlights">
          <h3><i class="fas fa-star"></i> 绿道亮点</h3>
          <ul>
            <li>
              <strong>总长度：</strong>
              <span>{{ greenwayInfo.total_length }}</span>
            </li>
            <li>
              <strong>覆盖区域：</strong>
              <span>{{ greenwayInfo.coverage_area }}</span>
            </li>
            <li>
              <strong>建设面积：</strong>
              <span>{{ greenwayInfo.construction_area }}</span>
            </li>
            <li>
              <strong>特色：</strong>
              <span>{{ greenwayInfo.features }}</span>
            </li>
          </ul>
        </div>

        <div class="highlights">
          <h3><i class="fas fa-info-circle"></i> 绿道简介</h3>
          <p class="description">{{ greenwayInfo.description }}</p>
          <div class="badges">
            <span class="badge badge-green"><i class="fas fa-tree"></i> 生态景观</span>
            <span class="badge badge-blue"><i class="fas fa-water"></i> 滨水休闲</span>
            <span class="badge badge-purple"><i class="fas fa-bicycle"></i> 骑行健身</span>
          </div>
        </div>

        <button class="panorama-btn" @click="showPanorama = true">
          <i class="fas fa-street-view"></i>
          <span>360全景浏览</span>
        </button>
      </div>

      <div class="right-map">
        <MapViewer
          ref="mapViewer"
          :center="mapConfig.center"
          :zoom="mapConfig.zoom"
          :layers="layers"
          :interactive="false"
          height="100%"
          @map-ready="onMapReady"
          :restrict-navigation="true"
        />
      </div>
    </div>

    <section class="detail-comments-section">
      <DesktopCommentsPanel greenway-name="北京温榆河滨水绿道" />
    </section>

    <WeatherCard
      v-if="weatherLocation"
      :longitude="weatherLocation.lon"
      :latitude="weatherLocation.lat"
      location-label="温榆河滨水绿道"
      @weather-loaded="onWeatherLoaded"
    />

    <BaiduPanoramaViewer
      :visible="showPanorama"
      :panorama-points="panoramaPoints"
      :initial-point="0"
      :baidu-map-key="baiduMapKey"
      @close="showPanorama = false"
      @point-change="onPointChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import MapViewer from '@/components/MapViewer.vue'
import WeatherCard from '@/components/WeatherCard.vue'
import BaiduPanoramaViewer from '@/components/BaiduPanoramaViewer.vue'
import DesktopCommentsPanel from '@/components/DesktopCommentsPanel.vue'
import { loadGreenwayDataByName, buildGreenwayInfo } from '@/utils/greenwayHelper'

const router = useRouter()
const mapViewer = ref(null)
const leftSidebar = ref(null)
const showPanorama = ref(false)
const baiduMapKey = 'als8C7E7ORhccEaRUiToTKbuxDIYlIiw'

let cleanupSidebarWheel = null
let prevBodyOverflowY = ''
let prevHtmlOverflowY = ''
const WHEEL_EDGE_EPSILON = 2

const panoramaPoints = ref([
  {
    name: '温榆河东入口',
    description: '温榆河公园东侧入口，景观开阔',
    lng: 116.5303,
    lat: 40.0544
  },
  {
    name: '滨水生态段',
    description: '近水步道，观景与骑行体验兼具',
    lng: 116.5198,
    lat: 40.0612
  },
  {
    name: '湿地观景点',
    description: '湿地生态区，适合慢行休闲',
    lng: 116.5102,
    lat: 40.0695
  },
  {
    name: '森林栈道段',
    description: '林荫覆盖，夏季骑行舒适',
    lng: 116.5006,
    lat: 40.0641
  }
])

const mapConfig = reactive({
  center: [116.5198, 40.0612],
  zoom: 12
})

const weatherLocation = ref({
  lon: 116.5198,
  lat: 40.0612
})

const greenwayInfo = ref({
  total_length: '加载中...',
  coverage_area: '加载中...',
  construction_area: '加载中...',
  features: '加载中...',
  description: '正在获取绿道简介信息...'
})

const layers = ref([
  {
    id: 'wenyu-greenway',
    type: 'geojson',
    data: null,
    visible: true,
    fitExtent: true,
    style: {
      lineColor: '#1976D2',
      lineWidth: 4
    }
  }
])

const onMapReady = () => {
  setTimeout(() => {
    if (mapViewer.value) {
      const mapMgr = mapViewer.value.getMapManager()
      const center = mapMgr.getCenter()
      weatherLocation.value = {
        lon: center[0],
        lat: center[1]
      }
    }
  }, 500)
}

const onWeatherLoaded = () => {}

const goBack = () => {
  router.back()
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/900x320?text=温榆河绿道'
}

const onPointChange = () => {}

const setupSidebarWheelGuard = () => {
  const el = leftSidebar.value
  if (!el) return

  const onSidebarWheel = (e) => {
    if (showPanorama.value) return

    const target = e.target
    if (target instanceof Element && target.closest('.chatbot-panel, .panorama-modal, .weather-card')) {
      return
    }

    const maxScrollTop = el.scrollHeight - el.clientHeight
    if (maxScrollTop <= 0) {
      window.scrollBy({ top: e.deltaY, behavior: 'auto' })
      e.preventDefault()
      return
    }

    const isAtTop = el.scrollTop <= WHEEL_EDGE_EPSILON
    const isAtBottom = (maxScrollTop - el.scrollTop) <= WHEEL_EDGE_EPSILON

    // 左栏到边界后继续滚动时，把滚轮转发给页面，确保能滚到评论区。
    if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
      window.scrollBy({ top: e.deltaY, behavior: 'auto' })
      e.preventDefault()
      e.stopPropagation()
      return
    }

    const nextScrollTop = el.scrollTop + e.deltaY
    const clamped = Math.max(0, Math.min(maxScrollTop, nextScrollTop))
    const willScroll = clamped !== el.scrollTop

    if (!willScroll) return

    el.scrollTop = clamped
    e.preventDefault()
    e.stopPropagation()
  }

  // 监听挂在 window（捕获阶段），保证鼠标悬停在页面任意位置都能连续滚动。
  window.addEventListener('wheel', onSidebarWheel, { passive: false, capture: true })
  cleanupSidebarWheel = () => {
    window.removeEventListener('wheel', onSidebarWheel, true)
    cleanupSidebarWheel = null
  }
}

const loadGreenwayData = async () => {
  try {
    const greenwayData = await loadGreenwayDataByName('温榆河', (data) => {
      const info = buildGreenwayInfo(data)
      Object.assign(greenwayInfo.value, info)
    })

    if (greenwayData) {
      layers.value[0].data = greenwayData.geojson
    }
  } catch (err) {
    console.error('[WenyuDetail] 加载绿道数据失败:', err)
  }
}

onMounted(async () => {
  // 兜底：清理可能由其他页面遗留的滚动锁
  prevBodyOverflowY = document.body.style.overflowY
  prevHtmlOverflowY = document.documentElement.style.overflowY
  document.body.style.overflowY = 'auto'
  document.documentElement.style.overflowY = 'auto'

  await loadGreenwayData()
  await nextTick()
  setupSidebarWheelGuard()
})

onBeforeUnmount(() => {
  cleanupSidebarWheel?.()
  document.body.style.overflowY = prevBodyOverflowY
  document.documentElement.style.overflowY = prevHtmlOverflowY
})
</script>

<style scoped>
.wenyu-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 50%, #f1f8e9 100%);
  margin: 0;
}

.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 1.5rem;
  padding-left: 480px;
  box-sizing: border-box;
}

.header h1,
.header p,
.back-btn {
  pointer-events: auto;
}

.back-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 1.5rem;
  background: rgba(33, 150, 243, 0.1);
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #2196f3;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.back-btn:hover {
  background: rgba(33, 150, 243, 0.2);
}

.header h1 {
  margin: 0 0 0.2rem 0;
  color: #1b5e20;
  font-size: 2.2rem;
  font-weight: 700;
}

.header p {
  margin: 0;
  color: #1b5e20;
  font-size: 0.9rem;
  font-weight: 500;
}

.content {
  display: flex;
  min-height: 100vh;
}

.left-sidebar {
  width: 480px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  height: 100vh;
  max-height: 100vh;
  overscroll-behavior: contain;
  position: relative;
  z-index: 2;
  padding: 110px 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
  border-right: 1px solid rgba(76, 175, 80, 0.1);
}

.right-map {
  flex: 1;
  min-width: 0;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.feature-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
}

.highlights {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  padding: 1.1rem;
}

.highlights h3 {
  color: #2e7d32;
  margin-bottom: 0.8rem;
  font-size: 1.08rem;
}

.highlights ul {
  list-style: none;
  padding: 0;
}

.highlights li {
  margin: 0.65rem 0;
}

.highlights li strong {
  color: #1976d2;
}

.description {
  color: #374151;
  line-height: 1.8;
  margin-bottom: 0.8rem;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.badge-green {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-blue {
  background: #e3f2fd;
  color: #1976d2;
}

.badge-purple {
  background: #f3e5f5;
  color: #7b1fa2;
}

.panorama-btn {
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #43a047, #2e7d32);
  color: #fff;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@media (max-width: 1100px) {
  .header {
    position: static;
    padding: 1rem;
    justify-content: flex-start;
    pointer-events: auto;
  }

  .back-btn {
    position: static;
    transform: none;
  }

  .content {
    flex-direction: column;
    min-height: auto;
  }

  .left-sidebar {
    width: 100%;
    max-height: none;
    overflow-y: auto;
    padding: 1rem;
  }

  .right-map {
    height: 55vh;
    min-height: 420px;
  }
}
</style>

<style>
[data-theme="night"] .wenyu-page {
  background: var(--bg-primary, #1a1a1a) !important;
}

[data-theme="night"] .wenyu-page .header h1,
[data-theme="night"] .wenyu-page .header p,
[data-theme="night"] .wenyu-page .header i {
  color: var(--text-primary, #e8e8e8) !important;
}

[data-theme="night"] .wenyu-page .back-btn {
  background: rgba(255, 255, 255, 0.12) !important;
  color: var(--text-secondary, #b0b0b0) !important;
}

[data-theme="night"] .wenyu-page .left-sidebar {
  background: var(--bg-secondary, #252525) !important;
  border-right-color: rgba(255, 255, 255, 0.08) !important;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.45) !important;
}

[data-theme="night"] .wenyu-page .highlights {
  background: var(--card-bg, rgba(30, 30, 30, 0.85)) !important;
  border-color: var(--card-border, rgba(255, 255, 255, 0.1)) !important;
}

[data-theme="night"] .wenyu-page .highlights h3 {
  color: var(--text-primary, #e8e8e8) !important;
}

[data-theme="night"] .wenyu-page .highlights li strong {
  color: var(--theme-blue, #42a5f5) !important;
}

[data-theme="night"] .wenyu-page .highlights li span,
[data-theme="night"] .wenyu-page .description {
  color: var(--text-secondary, #b0b0b0) !important;
}

[data-theme="night"] .wenyu-page .badge-green {
  background: var(--bg-tertiary, #2a2a2a) !important;
  color: #66bb6a !important;
}

[data-theme="night"] .wenyu-page .badge-blue {
  background: var(--bg-tertiary, #2a2a2a) !important;
  color: #42a5f5 !important;
}

[data-theme="night"] .wenyu-page .badge-purple {
  background: var(--bg-tertiary, #2a2a2a) !important;
  color: #a78bfa !important;
}

[data-theme="night"] .wenyu-page .right-map {
  background: #0f1115 !important;
}
</style>






