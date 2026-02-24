<template>
  <div class="chaoyang-page">
    <header class="header">
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i> 返回
      </button>
      <div class="title-container">
        <h1>北京朝阳绿道</h1>
        <p><i class="fas fa-leaf"></i> 繁华都市中的绿色休闲长廊</p>
      </div>
    </header>

    <div class="content">
      <!-- 左侧信息栏 -->
      <div class="left-sidebar">
        <div class="highlights">
          <h3><i class="fas fa-star"></i>绿道亮点</h3>
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
          <h3><i class="fas fa-info-circle"></i>绿道简介</h3>
          <p class="description">
            {{ greenwayInfo.description }}
          </p>
          <div class="badges">
            <span class="badge badge-green">
              <i class="fas fa-building"></i> 都市景观
            </span>
            <span class="badge badge-blue">
              <i class="fas fa-tree"></i> 生态休闲
            </span>
            <span class="badge badge-purple">
              <i class="fas fa-bicycle"></i> 运动健身
            </span>
          </div>
        </div>
        
        <!-- 全景浏览按钮 -->
        <button class="panorama-btn" @click="showPanorama = true">
          <i class="fas fa-street-view"></i>
          <span>360°全景浏览</span>
        </button>
      </div>

      <!-- 右侧地图区域 -->
      <div class="right-map">
        <MapViewer
          ref="mapViewer"
          :center="mapConfig.center"
          :zoom="mapConfig.zoom"
          :layers="layers"
          :interactive="true"
          height="100%"
          @map-ready="onMapReady"
        :restrict-navigation="true" />
      </div>
    </div>

    <!-- 天气卡片（固定定位，可拖动） -->
    <WeatherCard
      v-if="weatherLocation"
      :longitude="weatherLocation.lon"
      :latitude="weatherLocation.lat"
      location-label="朝阳绿道"
      @weather-loaded="onWeatherLoaded"
    />

    <!-- 百度全景查看器 -->
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MapViewer from '@/components/MapViewer.vue'
import WeatherCard from '@/components/WeatherCard.vue'
import BaiduPanoramaViewer from '@/components/BaiduPanoramaViewer.vue'
import { loadGreenwayDataByName, buildGreenwayInfo } from '@/utils/greenwayHelper'

const router = useRouter()

// 地图组件引用
const mapViewer = ref(null)

// 全景查看器状态
const showPanorama = ref(false)

// 百度地图API密钥
const baiduMapKey = 'als8C7E7ORhccEaRUiToTKbuxDIYlIiw'

// 朝阳绿道全景点位配置
const panoramaPoints = ref([
  {
    name: '朝阳公园南园入口',
    description: '现代化城市公园，休闲娱乐胜地',
    lng: 116.5265,
    lat: 39.9487
  },
  {
    name: 'CBD绿道中心',
    description: '商务区绿色廊道，城市窗口',
    lng: 116.5345,
    lat: 39.9245
  },
  {
    name: '朝阳滨河路',
    description: '河畔休闲步道，风景秀丽',
    lng: 116.5412,
    lat: 39.9156
  },
  {
    name: '798艺术区周边',
    description: '创意文化园区，艺术氛围浓厚',
    lng: 116.4782,
    lat: 39.9876
  },
  {
    name: '红砖美术馆',
    description: '文化艺术地标，展览空间',
    lng: 116.4685,
    lat: 40.0134
  }
])

// 地图配置
const mapConfig = reactive({
  center: [116.5, 39.95],
  zoom: 11
})

// 天气位置
const weatherLocation = ref(null)

// 图层配置
// 绿道详细信息
const greenwayInfo = ref({
  total_length: '加载中...',
  coverage_area: '加载中...',
  construction_area: '加载中...',
  features: '加载中...',
  description: '正在获取绿道简介信息...'
})

const layers = ref([
  {
    id: 'chaoyang-greenway',
    type: 'geojson',
    data: null,  // 将通过fetch动态设置
    visible: true,
    fitExtent: true,
    style: {
      lineColor: '#2196F3',
      lineWidth: 4
    }
  }
])

// 地图就绪
const onMapReady = (map) => {
  console.log('[ChaoyangDetail] 地图已就绪')
  
  // 获取地图中心作为天气查询位置
  setTimeout(() => {
    if (mapViewer.value) {
      const mapMgr = mapViewer.value.getMapManager()
      const center = mapMgr.getCenter()
      weatherLocation.value = {
        lon: center[0],
        lat: center[1]
      }
      console.log('[ChaoyangDetail] 天气查询位置:', weatherLocation.value)
    }
  }, 1000)
}

// 天气加载完成
const onWeatherLoaded = (weather) => {
  console.log('[ChaoyangDetail] 天气数据已加载:', weather)
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 图片加载失败处理
const handleImageError = (event) => {
  console.warn('[ChaoyangDetail] 图片加载失败')
  event.target.src = 'https://via.placeholder.com/800x300?text=朝阳绿道'
}

// 全景观景点切换
const onPointChange = (index) => {
  console.log('[ChaoyangDetail] 切换到观景点:', panoramaPoints.value[index].name)
}

// 加载绿道数据
const loadGreenwayData = async () => {
  try {
    const greenwayData = await loadGreenwayDataByName('朝阳绿道', (data) => {
      // 更新界面显示的属性
      const info = buildGreenwayInfo(data)
      Object.assign(greenwayInfo.value, info)
    })
    
    if (greenwayData) {
      // 更新图层数据
      layers.value[0].data = greenwayData.geojson
    }
  } catch (err) {
    console.error('[ChaoyangDetail] 加载绿道数据失败:', err)
  }
}

onMounted(async () => {
  console.log('[ChaoyangDetail] 组件已挂载')
  await loadGreenwayData()
})
</script>

<style scoped>
.chaoyang-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #E8F5E9 0%, #E3F2FD 50%, #F1F8E9 100%);
  padding-top: 0;
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
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #2196F3;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(33, 150, 243, 0.2);
  transform: translateY(-50%) translateX(-2px);
}

.header h1 {
  font-size: 2.2rem;
  margin: 0 0 0.2rem 0;
  color: #1B5E20;
  font-weight: 700;
}

.header p {
  color: #1B5E20;
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0;
}

.header i {
  color: #1B5E20;
  margin-right: 0.4rem;
}

.content {
  display: flex;
  height: 100vh;
  gap: 0;
}

.left-sidebar {
  width: 480px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  overflow-y: auto;
  padding: 110px 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
  border-right: 1px solid rgba(76, 175, 80, 0.1);
}

.right-map {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

.feature-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease;
}

.feature-image:hover {
  transform: scale(1.03);
}

.highlights {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.highlights h3 {
  color: #2E7D32;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.highlights h3::before {
  content: '';
  display: block;
  width: 4px;
  height: 1em;
  background: linear-gradient(180deg, #4CAF50, #2196F3);
  border-radius: 2px;
}

.highlights ul {
  list-style-type: none;
  padding: 0;
}

.highlights li {
  margin: 0.75rem 0;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  position: relative;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.highlights li:hover {
  transform: translateX(5px);
  background: rgba(255, 255, 255, 0.8);
}

.highlights li::before {
  content: "\f058";
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
  color: #4CAF50;
  position: absolute;
  left: 0.8rem;
  opacity: 0.8;
}

.highlights li strong {
  color: #2196F3;
}

.highlights li span {
  color: #666;
}

.description {
  line-height: 1.8;
  color: #666;
  margin-bottom: 1rem;
}

.badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.panorama-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.panorama-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
  background: linear-gradient(135deg, #45a049, #388e3c);
}

.panorama-btn:active {
  transform: translateY(-1px);
}

.panorama-btn i {
  font-size: 1.3rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.badge-green {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.badge-blue {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.badge-purple {
  background: rgba(103, 58, 183, 0.1);
  color: #673AB7;
}

.title-container {
  background: transparent;
  padding: 0.8rem 2rem;
  text-align: center;
  pointer-events: auto;
  text-shadow: 0 1px 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.8);
}

@media (max-width: 1200px) {
  .header { padding-left: 0; }
  .content {
    flex-direction: column;
    height: auto;
  }
  .left-sidebar {
    width: 100%;
    height: auto;
  }
  .right-map {
    height: 60vh;
  }
}

@media (max-width: 768px) {
  .back-btn {
    left: 1rem;
    font-size: 0.85rem;
  }
  .left-sidebar {
    padding: 1rem;
  }
  .right-map {
    height: 50vh;
  }
}

/* 夜间模式样式覆盖 - scoped */
[data-theme="night"] .chaoyang-page {
  background: var(--bg-primary);
}

[data-theme="night"] .header h1,
[data-theme="night"] .header p,
[data-theme="night"] .header i {
  color: var(--text-primary);
}

[data-theme="night"] .back-btn {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

[data-theme="night"] .back-btn:hover {
  background: var(--bg-secondary);
}

[data-theme="night"] .left-sidebar {
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
}

[data-theme="night"] .highlights {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

[data-theme="night"] .highlights h3 {
  color: var(--text-primary);
}

[data-theme="night"] .highlights li {
  background: var(--bg-tertiary);
}

[data-theme="night"] .highlights li:hover {
  background: var(--bg-secondary);
}

[data-theme="night"] .highlights li strong {
  color: var(--theme-blue);
}

[data-theme="night"] .highlights li span {
  color: var(--text-secondary);
}

[data-theme="night"] .description {
  color: var(--text-secondary);
}

[data-theme="night"] .badge-green {
  background: var(--bg-tertiary);
  color: var(--theme-green);
}

[data-theme="night"] .badge-blue {
  background: var(--bg-tertiary);
  color: var(--theme-blue);
}

[data-theme="night"] .badge-purple {
  background: var(--bg-tertiary);
  color: #a78bfa;
}

</style>

<!-- 全局主题样式 - 处理scoped样式中无法应用的全局选择器 -->
<style>
[data-theme="night"] .chaoyang-page {
  background: var(--bg-primary) !important;
}

[data-theme="night"] .chaoyang-page .header h1,
[data-theme="night"] .chaoyang-page .header p,
[data-theme="night"] .chaoyang-page .header i {
  color: var(--text-primary) !important;
}

[data-theme="night"] .chaoyang-page .back-btn {
  background: var(--bg-tertiary) !important;
  color: var(--text-secondary) !important;
}

[data-theme="night"] .chaoyang-page .back-btn:hover {
  background: var(--bg-secondary) !important;
}

[data-theme="night"] .chaoyang-page .left-sidebar {
  background: var(--bg-secondary) !important;
  border-right: 1px solid var(--border-color) !important;
}

[data-theme="night"] .chaoyang-page .highlights {
  background: var(--card-bg) !important;
  border: 1px solid var(--card-border) !important;
}

[data-theme="night"] .chaoyang-page .highlights h3 {
  color: var(--text-primary) !important;
}

[data-theme="night"] .chaoyang-page .highlights li {
  background: var(--bg-tertiary) !important;
}

[data-theme="night"] .chaoyang-page .highlights li:hover {
  background: var(--bg-secondary) !important;
}

[data-theme="night"] .chaoyang-page .highlights li strong {
  color: var(--theme-blue) !important;
}

[data-theme="night"] .chaoyang-page .highlights li span {
  color: var(--text-secondary) !important;
}

[data-theme="night"] .chaoyang-page .description {
  color: var(--text-secondary) !important;
}

[data-theme="night"] .chaoyang-page .badge-green {
  background: var(--bg-tertiary) !important;
  color: var(--theme-green) !important;
}

[data-theme="night"] .chaoyang-page .badge-blue {
  background: var(--bg-tertiary) !important;
  color: var(--theme-blue) !important;
}

[data-theme="night"] .chaoyang-page .badge-purple {
  background: var(--bg-tertiary) !important;
  color: #a78bfa !important;
}
</style>

