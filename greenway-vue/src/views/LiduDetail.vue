<template>
  <div class="lidu-page">
    <header class="header">
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i> 返回
      </button>
      <h1>北京丽都商圈绿道</h1>
      <p><i class="fas fa-leaf"></i> 都市绿道，品质生活</p>
    </header>

    <div class="content">
      <!-- 左侧信息栏 -->
      <div class="left-sidebar">
        <div class="feature-image placeholder-image">
          <div class="placeholder-text">
            <i class="fas fa-image"></i>
            <p>丽都商圈绿道</p>
          </div>
        </div>
        
        <div class="highlights">
          <h3><i class="fas fa-star"></i>绿道亮点</h3>
          <ul>
            <li>
              <strong>总长度：</strong>
              <span>6.8公里</span>
            </li>
            <li>
              <strong>覆盖区域：</strong>
              <span>朝阳区丽都商圈</span>
            </li>
            <li>
              <strong>建设面积：</strong>
              <span>45公顷</span>
            </li>
            <li>
              <strong>特色：</strong>
              <span>商圈绿化、城市休闲</span>
            </li>
          </ul>
        </div>

        <div class="highlights">
          <h3><i class="fas fa-info-circle"></i>绿道简介</h3>
          <p class="description">
            丽都商圈绿道位于朝阳区核心商圈区域，是连接商业与生态的城市绿色廊道。
            绿道沿线融合现代都市景观与自然生态元素，为商圈提供了高品质的休闲空间，
            是都市白领和居民休憩、运动、社交的理想场所。
          </p>
          <div class="badges">
            <span class="badge badge-green">
              <i class="fas fa-city"></i> 都市景观
            </span>
            <span class="badge badge-blue">
              <i class="fas fa-shopping-bag"></i> 商圈休闲
            </span>
            <span class="badge badge-purple">
              <i class="fas fa-walking"></i> 健步慢行
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
      location-label="丽都商圈绿道"
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
    name: '丽都商圈入口',
    description: '商圈主入口，现代化设施',
    lng: 116.4856,
    lat: 39.9723
  },
  {
    name: '绿道休闲段',
    description: '都市绿地，休憩空间',
    lng: 116.4889,
    lat: 39.9756
  },
  {
    name: '景观广场',
    description: '中心广场，活动场地',
    lng: 116.4823,
    lat: 39.9689
  },
  {
    name: '滨水步道',
    description: '沿水绿道，景色宜人',
    lng: 116.4912,
    lat: 39.9778
  },
  {
    name: '终点观景台',
    description: '绿道终点，观景平台',
    lng: 116.4934,
    lat: 39.9801
  }
])

const mapConfig = reactive({
  center: [116.487, 39.974],
  zoom: 13
})

const weatherLocation = ref(null)

const layers = ref([
  {
    id: 'lidu-greenway',
    type: 'geojson',
    url: '/数据/绿道/丽都商圈绿道.geojson',
    visible: true,
    fitExtent: true,
    style: {
      lineColor: '#2196F3',
      lineWidth: 4
    }
  }
])

const onMapReady = (map) => {
  console.log('[LiduDetail] 地图已就绪')
  setTimeout(() => {
    if (mapViewer.value) {
      const mapMgr = mapViewer.value.getMapManager()
      const center = mapMgr.getCenter()
      weatherLocation.value = { lon: center[0], lat: center[1] }
    }
  }, 1000)
}

const onWeatherLoaded = (weather) => {
  console.log('[LiduDetail] 天气数据已加载:', weather)
}

const goBack = () => {
  router.back()
}

const onPointChange = (index) => {
  console.log('[LiduDetail] 切换到观景点:', panoramaPoints.value[index].name)
}

onMounted(() => {
  console.log('[LiduDetail] 组件已挂载')
})
</script>

<style scoped>
.lidu-page {
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
