<template>
  <div class="changying-page">
    <header class="header">
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i> 返回
      </button>
      <div class="title-container">
        <h1>北京常营半马绿道</h1>
        <p><i class="fas fa-leaf"></i> 半马赛道，畅享运动绿意</p>
      </div>
    </header>

    <div class="content">
      <!-- 左侧信息栏 -->
      <div class="left-sidebar">
        <div class="feature-image placeholder-image">
          <div class="placeholder-text">
            <i class="fas fa-image"></i>
            <p>常营半马绿道</p>
          </div>
        </div>
        
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
              <i class="fas fa-running"></i> 运动健身
            </span>
            <span class="badge badge-blue">
              <i class="fas fa-medal"></i> 半马赛道
            </span>
            <span class="badge badge-purple">
              <i class="fas fa-heartbeat"></i> 健康生活
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
      location-label="常营半马绿道"
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

// 常营半马全景点位配置（真实坐标）
const panoramaPoints = ref([
  {
    name: '常营半马起点',
    description: '半马绿道起点，设施完善',
    lng: 116.5845,
    lat: 39.9234
  },
  {
    name: '常营公园段',
    description: '公园景观带，绿树成荫',
    lng: 116.5912,
    lat: 39.9189
  },
  {
    name: '常营体育公园',
    description: '专业运动设施区域',
    lng: 116.5978,
    lat: 39.9145
  },
  {
    name: '常营湿地段',
    description: '生态湿地，环境优美',
    lng: 116.6034,
    lat: 39.9112
  },
  {
    name: '常营半马终点',
    description: '半马终点，完善的服务设施',
    lng: 116.6089,
    lat: 39.9078
  }
])

// 地图配置
const mapConfig = reactive({
  center: [116.595, 39.915],
  zoom: 13
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
    id: 'changying-greenway',
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
  console.log('[ChangyingDetail] 地图已就绪')
  
  // 获取地图中心作为天气查询位置
  setTimeout(() => {
    if (mapViewer.value) {
      const mapMgr = mapViewer.value.getMapManager()
      const center = mapMgr.getCenter()
      weatherLocation.value = {
        lon: center[0],
        lat: center[1]
      }
      console.log('[ChangyingDetail] 天气查询位置:', weatherLocation.value)
    }
  }, 1000)
}

// 天气加载完成
const onWeatherLoaded = (weather) => {
  console.log('[ChangyingDetail] 天气数据已加载:', weather)
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 图片加载失败处理
const handleImageError = (event) => {
  console.warn('[ChangyingDetail] 图片加载失败')
  event.target.src = 'https://via.placeholder.com/800x300?text=常营半马绿道'
}

// 全景观景点切换
const onPointChange = (index) => {
  console.log('[ChangyingDetail] 切换到观景点:', panoramaPoints.value[index].name)
}

// 加载绿道数据
const loadGreenwayData = async () => {
  try {
    const greenwayData = await loadGreenwayDataByName('常营半马绿道', (data) => {
      // 更新界面显示的属性
      const info = buildGreenwayInfo(data)
      Object.assign(greenwayInfo.value, info)
    })
    
    if (greenwayData) {
      // 更新图层数据
      layers.value[0].data = greenwayData.geojson
    }
  } catch (err) {
    console.error('[ChangyingDetail] 加载绿道数据失败:', err)
  }
}

onMounted(async () => {
  console.log('[ChangyingDetail] 组件已挂载')
  await loadGreenwayData()
})
</script>

<style scoped>
.changying-page {
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
  padding-left: 480px; /* 地图区域居中 */
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
  font-size: 2.2rem; margin: 0 0 0.2rem 0;
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

/* 左侧信息栏 */
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

/* 右侧地图区域 */
.right-map {
  flex: 1;
  position: relative;
  overflow: hidden;
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

.placeholder-image {
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  text-align: center;
  color: #4CAF50;
}

.placeholder-text i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.7;
}

.placeholder-text p {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
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

/* 全景浏览按钮 */
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

/* 响应式 */
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

  .header h1 {
    font-size: 1.3rem;
  margin: 0 0 0.2rem 0;}
}

@media (max-width: 768px) {
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
  padding-left: 480px; /* 地图区域居中 */
  box-sizing: border-box;
}

  .back-btn {
    left: 1rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .left-sidebar {
    padding: 1rem;
  }

  .feature-image {
    height: 180px;
  }

  .right-map {
    height: 50vh;
  }
}

.title-container {
  background: transparent;
  padding: 0.8rem 2rem;
  text-align: center;
  pointer-events: auto;
  text-shadow: 0 1px 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.8);
}

.title-container:hover {
  transform: translateY(-2px);
}

/* Night mode styles */
[data-theme="night"] .changying-page {
  background: var(--bg-primary, #1a1a1a);
}

[data-theme="night"] .header h1,
[data-theme="night"] .header p,
[data-theme="night"] .header i {
  color: var(--text-primary, #e0e0e0);
}

[data-theme="night"] .back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary, #b0b0b0);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

[data-theme="night"] .back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

[data-theme="night"] .left-sidebar {
  background: var(--card-bg, rgba(30, 30, 30, 0.9));
  border-right-color: rgba(255, 255, 255, 0.1);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.5);
}

[data-theme="night"] .placeholder-image {
  background: var(--bg-secondary, #2a2a2a);
}

[data-theme="night"] .placeholder-text {
  color: var(--text-secondary, #b0b0b0);
}

[data-theme="night"] .placeholder-text i {
  opacity: 0.5;
}

[data-theme="night"] .highlights {
  background: var(--card-bg, rgba(30, 30, 30, 0.7));
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

[data-theme="night"] .highlights h3 {
  color: var(--text-primary, #e0e0e0);
}

[data-theme="night"] .highlights h3::before {
  background: linear-gradient(180deg, #66bb6a, #42a5f5);
}

[data-theme="night"] .highlights li {
  background: rgba(255, 255, 255, 0.08);
}

[data-theme="night"] .highlights li:hover {
  background: rgba(255, 255, 255, 0.12);
}

[data-theme="night"] .highlights li::before {
  color: #66bb6a;
}

[data-theme="night"] .highlights li strong {
  color: #42a5f5;
}

[data-theme="night"] .highlights li span {
  color: var(--text-secondary, #b0b0b0);
}

[data-theme="night"] .description {
  color: var(--text-secondary, #b0b0b0);
}

[data-theme="night"] .badge-green {
  background: rgba(102, 187, 106, 0.15);
  color: #66bb6a;
}

[data-theme="night"] .badge-blue {
  background: rgba(66, 165, 245, 0.15);
  color: #42a5f5;
}

[data-theme="night"] .badge-purple {
  background: rgba(171, 71, 188, 0.15);
  color: #ab47bc;
}

[data-theme="night"] .panorama-btn {
  background: linear-gradient(135deg, #66bb6a, #2e7d32);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

[data-theme="night"] .panorama-btn:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
  background: linear-gradient(135deg, #2e7d32, #1b5e20);
}

[data-theme="night"] .title-container {
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.8);
}

[data-theme="night"] .right-map {
  background: var(--bg-primary-dark, #0a0a0a);
}

[data-theme="night"] .feature-image {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

</style>

<!-- 全局主题样式 - 处理scoped样式中无法应用的全局选择器 -->
<style>
[data-theme="night"] .changying-page {
  background: var(--bg-primary, #1a1a1a);
}

[data-theme="night"] .changying-page .header h1,
[data-theme="night"] .changying-page .header p,
[data-theme="night"] .changying-page .header i {
  color: var(--text-primary, #e0e0e0);
}

[data-theme="night"] .changying-page .back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary, #b0b0b0);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

[data-theme="night"] .changying-page .back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

[data-theme="night"] .changying-page .left-sidebar {
  background: var(--card-bg, rgba(30, 30, 30, 0.9));
  border-right-color: rgba(255, 255, 255, 0.1);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.5);
}

[data-theme="night"] .changying-page .placeholder-image {
  background: var(--bg-secondary, #2a2a2a);
}

[data-theme="night"] .changying-page .placeholder-text {
  color: var(--text-secondary, #b0b0b0);
}

[data-theme="night"] .changying-page .placeholder-text i {
  opacity: 0.5;
}

[data-theme="night"] .changying-page .highlights {
  background: var(--card-bg, rgba(30, 30, 30, 0.7));
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

[data-theme="night"] .changying-page .highlights h3 {
  color: var(--text-primary, #e0e0e0);
}

[data-theme="night"] .changying-page .highlights h3::before {
  background: linear-gradient(180deg, #66bb6a, #42a5f5);
}

[data-theme="night"] .changying-page .highlights li {
  background: rgba(255, 255, 255, 0.08);
}

[data-theme="night"] .changying-page .highlights li:hover {
  background: rgba(255, 255, 255, 0.12);
}

[data-theme="night"] .changying-page .highlights li::before {
  color: #66bb6a;
}

[data-theme="night"] .changying-page .highlights li strong {
  color: #42a5f5;
}

[data-theme="night"] .changying-page .highlights li span {
  color: var(--text-secondary, #b0b0b0);
}

[data-theme="night"] .changying-page .description {
  color: var(--text-secondary, #b0b0b0);
}

[data-theme="night"] .changying-page .badge-green {
  background: rgba(102, 187, 106, 0.15);
  color: #66bb6a;
}

[data-theme="night"] .changying-page .badge-blue {
  background: rgba(66, 165, 245, 0.15);
  color: #42a5f5;
}

[data-theme="night"] .changying-page .badge-purple {
  background: rgba(171, 71, 188, 0.15);
  color: #ab47bc;
}

[data-theme="night"] .changying-page .panorama-btn {
  background: linear-gradient(135deg, #66bb6a, #2e7d32);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

[data-theme="night"] .changying-page .panorama-btn:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
  background: linear-gradient(135deg, #2e7d32, #1b5e20);
}

[data-theme="night"] .changying-page .title-container {
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.8);
}

[data-theme="night"] .changying-page .right-map {
  background: var(--bg-primary-dark, #0a0a0a);
}

[data-theme="night"] .changying-page .feature-image {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
</style>
