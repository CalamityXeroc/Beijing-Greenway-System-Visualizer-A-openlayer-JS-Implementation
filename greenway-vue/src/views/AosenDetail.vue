<template>
  <div class="aosen-page">
    <header class="header">
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i> 返回
      </button>
      <h1>北京奥林匹克森林公园绿道</h1>
      <p><i class="fas fa-leaf"></i> 奥运遗产，森林氧吧</p>
    </header>

    <div class="content">
      <!-- 左侧信息栏 -->
      <div class="left-sidebar">
        <img 
          src="https://via.placeholder.com/800x300?text=奥林匹克森林公园绿道" 
          alt="奥森绿道景观" 
          class="feature-image"
          @error="handleImageError"
        />
        
        <div class="highlights">
          <h3><i class="fas fa-star"></i>绿道亮点</h3>
          <ul>
            <li>
              <strong>总长度：</strong>
              <span>23公里</span>
            </li>
            <li>
              <strong>覆盖区域：</strong>
              <span>朝阳区奥森公园</span>
            </li>
            <li>
              <strong>建设面积：</strong>
              <span>160公顷</span>
            </li>
            <li>
              <strong>特色：</strong>
              <span>奥运文化、森林休闲</span>
            </li>
          </ul>
        </div>

        <div class="highlights">
          <h3><i class="fas fa-info-circle"></i>绿道简介</h3>
          <p class="description">
            奥林匹克森林公园绿道是北京奥运遗产的重要组成部分，位于朝阳区北部。
            公园内林木茂密，湖泊清澈，是北京市民运动健身、亲近自然的首选之地。
            绿道系统完善，连接南北两园，沿途设有多个观景台和休息区，
            充分展现了奥运精神与生态文明的完美结合。
          </p>
          <div class="badges">
            <span class="badge badge-green">
              <i class="fas fa-tree"></i> 生态景观
            </span>
            <span class="badge badge-blue">
              <i class="fas fa-medal"></i> 奥运文化
            </span>
            <span class="badge badge-purple">
              <i class="fas fa-running"></i> 运动健身
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
      location-label="奥林匹克森林公园绿道"
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

// 地图组件引用
const mapViewer = ref(null)

// 全景查看器状态
const showPanorama = ref(false)

// 百度地图API密钥
const baiduMapKey = 'als8C7E7ORhccEaRUiToTKbuxDIYlIiw'

// 奥森绿道全景点位配置（真实坐标）
const panoramaPoints = ref([
  {
    name: '奥森南园主入口',
    description: '奥林匹克森林公园南门，标志性景观',
    lng: 116.3970,
    lat: 40.0050
  },
  {
    name: '奥海湖景区',
    description: '公园内最大湖泊，波光粼粼',
    lng: 116.3980,
    lat: 40.0120
  },
  {
    name: '北园湿地',
    description: '生态湿地，鸟类栖息天堂',
    lng: 116.3965,
    lat: 40.0250
  },
  {
    name: '观景山顶',
    description: '制高点，俯瞰公园全景',
    lng: 116.3955,
    lat: 40.0180
  },
  {
    name: '森林步道',
    description: '林荫小道，空气清新',
    lng: 116.4000,
    lat: 40.0150
  }
])

// 地图配置
const mapConfig = reactive({
  center: [116.397, 40.018],
  zoom: 13
})

// 天气位置
const weatherLocation = ref(null)

// 图层配置
const layers = ref([
  {
    id: 'aosen-greenway',
    type: 'geojson',
    url: '/数据/绿道/奥林匹克森林公园绿道.geojson',
    visible: true,
    fitExtent: true,
    style: {
      lineColor: '#4CAF50',
      lineWidth: 4
    }
  }
])

// 地图就绪
const onMapReady = (map) => {
  console.log('[AosenDetail] 地图已就绪')
  
  // 获取地图中心作为天气查询位置
  setTimeout(() => {
    if (mapViewer.value) {
      const mapMgr = mapViewer.value.getMapManager()
      const center = mapMgr.getCenter()
      weatherLocation.value = {
        lon: center[0],
        lat: center[1]
      }
      console.log('[AosenDetail] 天气查询位置:', weatherLocation.value)
    }
  }, 1000)
}

// 天气加载完成
const onWeatherLoaded = (weather) => {
  console.log('[AosenDetail] 天气数据已加载:', weather)
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 图片加载失败处理
const handleImageError = (event) => {
  console.warn('[AosenDetail] 图片加载失败')
  event.target.src = 'https://via.placeholder.com/800x300?text=奥林匹克森林公园绿道'
}

// 全景观景点切换
const onPointChange = (index) => {
  console.log('[AosenDetail] 切换到观景点:', panoramaPoints.value[index].name)
}

onMounted(() => {
  console.log('[AosenDetail] 组件已挂载')
})
</script>

<style scoped>
.aosen-page {
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
  font-size: 1.5rem;
  margin: 0 0 0.15rem 0;
  background: linear-gradient(120deg, #2E7D32, #4CAF50, #66BB6A);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
}

.header p {
  color: #558B2F;
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0;
}

.header i {
  color: #4CAF50;
  margin-right: 0.4rem;
}

.content {
  display: flex;
  height: calc(100vh - 80px);
  gap: 0;
}

/* 左侧信息栏 */
.left-sidebar {
  width: 400px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  overflow-y: auto;
  padding: 1.5rem;
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
  }
}

@media (max-width: 768px) {
  .header {
    padding: 1rem 1.5rem;
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
</style>
