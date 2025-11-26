<template>
  <div class="nansha-page">
    <header class="header">
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i> 返回
      </button>
      <h1>北京南沙绿道</h1>
      <p><i class="fas fa-leaf"></i> 沙河湾畔，生态绿廊</p>
    </header>

    <div class="content">
      <!-- 左侧信息栏 -->
      <div class="left-sidebar">
        <div class="feature-image placeholder-image">
          <div class="placeholder-text">
            <i class="fas fa-image"></i>
            <p>南沙绿道</p>
          </div>
        </div>
        
        <div class="highlights">
          <h3><i class="fas fa-star"></i>绿道亮点</h3>
          <ul>
            <li>
              <strong>总长度：</strong>
              <span>15公里</span>
            </li>
            <li>
              <strong>覆盖区域：</strong>
              <span>昌平区南沙河沿岸</span>
            </li>
            <li>
              <strong>建设面积：</strong>
              <span>95公顷</span>
            </li>
            <li>
              <strong>特色：</strong>
              <span>滨水生态、自然景观</span>
            </li>
          </ul>
        </div>

        <div class="highlights">
          <h3><i class="fas fa-info-circle"></i>绿道简介</h3>
          <p class="description">
            南沙绿道沿南沙河而建，是昌平区重要的滨水生态廊道。
            绿道充分利用河道自然景观资源，打造了集生态保护、休闲游憩、
            运动健身为一体的综合性绿道系统，为周边居民提供了亲近自然、
            享受绿色生活的理想空间。
          </p>
          <div class="badges">
            <span class="badge badge-green">
              <i class="fas fa-seedling"></i> 生态保护
            </span>
            <span class="badge badge-blue">
              <i class="fas fa-water"></i> 滨河休闲
            </span>
            <span class="badge badge-purple">
              <i class="fas fa-running"></i> 健身步道
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
          :interactive="false"
          height="100%"
          @map-ready="onMapReady"
        />
      </div>
    </div>

    <!-- 天气卡片（固定定位，可拖动） -->
    <WeatherCard
      v-if="weatherLocation"
      :longitude="weatherLocation.lon"
      :latitude="weatherLocation.lat"
      location-label="南沙绿道"
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

const router = useRouter()
const mapViewer = ref(null)
const showPanorama = ref(false)
const baiduMapKey = 'als8C7E7ORhccEaRUiToTKbuxDIYlIiw'

const panoramaPoints = ref([
  {
    name: '南沙河公园',
    description: '绿道起点，生态公园',
    lng: 116.2456,
    lat: 40.1534
  },
  {
    name: '湿地景观区',
    description: '河道湿地，自然生态',
    lng: 116.2523,
    lat: 40.1589
  },
  {
    name: '休闲广场',
    description: '活动场地，休闲设施',
    lng: 116.2589,
    lat: 40.1645
  },
  {
    name: '健身步道',
    description: '运动区域，健身设施',
    lng: 116.2656,
    lat: 40.1701
  },
  {
    name: '观景台',
    description: '河景观赏，休憩平台',
    lng: 116.2723,
    lat: 40.1756
  }
])

const mapConfig = reactive({
  center: [116.259, 40.164],
  zoom: 12
})

const weatherLocation = ref(null)

const layers = ref([
  {
    id: 'nansha-greenway',
    type: 'geojson',
    url: '/数据/绿道/南沙绿道.geojson',
    visible: true,
    fitExtent: true,
    style: {
      lineColor: '#2196F3',
      lineWidth: 4
    }
  }
])

const onMapReady = (map) => {
  console.log('[NanshaDetail] 地图已就绪')
  setTimeout(() => {
    if (mapViewer.value) {
      const mapMgr = mapViewer.value.getMapManager()
      const center = mapMgr.getCenter()
      weatherLocation.value = { lon: center[0], lat: center[1] }
    }
  }, 1000)
}

const onWeatherLoaded = (weather) => {
  console.log('[NanshaDetail] 天气数据已加载:', weather)
}

const goBack = () => {
  router.back()
}

const onPointChange = (index) => {
  console.log('[NanshaDetail] 切换到观景点:', panoramaPoints.value[index].name)
}

onMounted(() => {
  console.log('[NanshaDetail] 组件已挂载')
})
</script>

<style scoped>
.nansha-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #E8F5E9 0%, #E3F2FD 50%, #F1F8E9 100%);
  padding-top: 0;
  margin: 0;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  color: #2c3e50;
  padding: 1rem 1.5rem;
  text-align: center;
  margin: 0;
  box-shadow: 0 2px 12px rgba(76, 175, 80, 0.15);
  position: relative;
  overflow: hidden;
  border-bottom: 2px solid rgba(76, 175, 80, 0.1);
}

.back-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 1.5rem;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  font-weight: 500;
}

.back-btn:hover {
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2E7D32, #4CAF50, #66BB6A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header p {
  margin: 0.5rem 0 0 0;
  color: #4CAF50;
  font-size: 1rem;
  font-weight: 500;
}

.content {
  display: flex;
  height: calc(100vh - 90px);
  gap: 0;
}

.left-sidebar {
  width: 400px;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  overflow-y: auto;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
  margin: 0 0 1rem 0;
  color: #2E7D32;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.highlights ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.highlights li {
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(76, 175, 80, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.highlights li:last-child {
  border-bottom: none;
}

.highlights strong {
  color: #1B5E20;
  font-weight: 600;
}

.highlights span {
  color: #4CAF50;
  font-weight: 500;
}

.description {
  margin: 0;
  color: #424242;
  line-height: 1.8;
  text-align: justify;
  font-size: 0.95rem;
}

.badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.badge-green {
  background: linear-gradient(135deg, #C8E6C9, #A5D6A7);
  color: #1B5E20;
}

.badge-blue {
  background: linear-gradient(135deg, #BBDEFB, #90CAF9);
  color: #0D47A1;
}

.badge-purple {
  background: linear-gradient(135deg, #E1BEE7, #CE93D8);
  color: #4A148C;
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

.panorama-btn i {
  font-size: 1.3rem;
}

.right-map {
  flex: 1;
  position: relative;
  background: #f5f5f5;
}

@media (max-width: 768px) {
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
</style>
