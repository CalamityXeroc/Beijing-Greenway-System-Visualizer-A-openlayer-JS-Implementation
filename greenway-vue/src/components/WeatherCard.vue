<template>
  <div 
    class="weather-card" 
    :class="{ collapsed: isCollapsed, dragging: isDragging }"
    :style="{ 
      transform: `translate(${position.x}px, ${position.y}px)`,
      width: isCollapsed ? 'auto' : '280px'
    }"
  >
    <!-- 折叠状态的小标签 -->
    <div 
      v-if="isCollapsed" 
      class="collapsed-tab"
      @click="toggleCollapse"
      @mousedown.stop
    >
      <i class="fas fa-cloud-sun"></i>
      <span>天气</span>
    </div>

    <!-- 展开状态 -->
    <div v-else class="weather-card-expanded">
      <!-- 可拖动的头部 -->
      <div 
        class="weather-header"
        @mousedown="startDrag"
      >
        <i class="fas fa-cloud-sun weather-icon"></i>
        <h3 class="weather-title">实时天气</h3>
        <div class="header-controls">
          <button 
            @click.stop="refresh"
            @mousedown.stop
            class="icon-btn refresh-btn" 
            :disabled="loading" 
            :class="{ spinning: loading }"
            title="刷新"
          >
            <i class="fas fa-sync-alt"></i>
          </button>
          <button 
            @click.stop="toggleCollapse"
            @mousedown.stop
            class="icon-btn collapse-btn"
            title="折叠"
          >
            <i class="fas fa-minus"></i>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i> 
        <span>加载中...</span>
      </div>

      <div v-else-if="error" class="error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="refresh" class="retry-btn">重试</button>
      </div>

      <div v-else-if="weather" class="weather-content">
        <div class="weather-main">
          <div class="temp-large">{{ weather.temperature }}°C</div>
          <div class="weather-desc">
            <i :class="`fas ${getWeatherIcon(weather.weather)}`"></i>
            {{ weather.weather }}
          </div>
        </div>

        <div class="weather-details">
          <div class="detail-item">
            <i class="fas fa-wind"></i>
            <span>{{ weather.winddirection }}风 {{ weather.windpower }}级</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-tint"></i>
            <span>湿度 {{ weather.humidity }}%</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ displayLocation }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const props = defineProps({
  longitude: {
    type: Number,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  apiKey: {
    type: String,
    default: 'd9dd334682ca1fc6537ffaaccf795fbd'
  },
  autoRefresh: {
    type: Boolean,
    default: true
  },
  refreshInterval: {
    type: Number,
    default: 30 * 60 * 1000 // 30分钟
  },
  locationLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['weather-loaded', 'weather-error'])

// 状态变量
const weather = ref(null)
const loading = ref(false)
const error = ref(null)
let refreshTimer = null

const displayLocation = computed(() => {
  if (props.locationLabel && props.locationLabel.trim().length > 0) {
    return props.locationLabel
  }
  return weather.value?.city || '北京'
})

// 折叠和拖动状态
const isCollapsed = ref(true) // 初始为折叠状态
const isDragging = ref(false)
const position = ref({ x: 0, y: 0 })
const dragStart = ref({ x: 0, y: 0 })

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  // 折叠时重置位置，让它回到右上角
  if (isCollapsed.value) {
    position.value = { x: 0, y: 0 }
  }
}

// 开始拖动
const startDrag = (e) => {
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  
  document.addEventListener('mousemove', onDrag, { passive: true })
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

// 拖动中 - 使用 requestAnimationFrame 优化性能
let rafId = null
const onDrag = (e) => {
  if (!isDragging.value) return
  
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
  
  rafId = requestAnimationFrame(() => {
    position.value = {
      x: e.clientX - dragStart.value.x,
      y: e.clientY - dragStart.value.y
    }
  })
}

// 停止拖动
const stopDrag = () => {
  isDragging.value = false
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 天气图标映射
const weatherIcons = {
  '晴': 'fa-sun',
  '多云': 'fa-cloud-sun',
  '阴': 'fa-cloud',
  '雨': 'fa-cloud-rain',
  '雪': 'fa-snowflake',
  '雷阵雨': 'fa-cloud-bolt',
  '雾': 'fa-smog',
  '霾': 'fa-smog'
}

const getWeatherIcon = (weatherText) => {
  return weatherIcons[weatherText] || 'fa-cloud'
}

const formatTime = (timeStr) => {
  if (!timeStr) return '--'
  const parts = timeStr.split(' ')
  return parts.length > 1 ? parts[1] : timeStr
}

// 获取天气数据
const fetchWeather = async () => {
  loading.value = true
  error.value = null

  try {
    console.log('[WeatherCard] 开始获取天气数据，坐标:', props.longitude, props.latitude)
    
    // 从环境变量读取 API Key（不硬编码在代码中）
    const apiKey = import.meta.env.VITE_AMAP_KEY || props.apiKey
    
    const geoUrl = `https://restapi.amap.com/v3/geocode/regeo?key=${apiKey}&location=${props.longitude},${props.latitude}`
    console.log('[WeatherCard] 逆地理编码...')
    
    const geoResponse = await fetch(geoUrl)
    const geoData = await geoResponse.json()

    if (geoData.status !== '1' || !geoData.regeocode) {
      throw new Error(`逆地理编码失败: ${geoData.info}`)
    }

    const adcode = geoData.regeocode.addressComponent.adcode
    let cityName = geoData.regeocode.addressComponent.city || geoData.regeocode.addressComponent.province
    
    if (Array.isArray(cityName)) {
      cityName = cityName[0] || '北京市'
    }
    if (!cityName) {
      cityName = '北京市'
    }

    // 获取天气
    const weatherUrl = `https://restapi.amap.com/v3/weather/weatherInfo?key=${apiKey}&city=${adcode}&extensions=base`
    console.log('[WeatherCard] 天气查询...')
    
    const weatherResponse = await fetch(weatherUrl)
    const weatherData = await weatherResponse.json()

    if (weatherData.status !== '1' || !weatherData.lives || weatherData.lives.length === 0) {
      throw new Error(`天气查询失败: ${weatherData.info}`)
    }

    weather.value = {
      ...weatherData.lives[0],
      city: cityName
    }
    emit('weather-loaded', weather.value)
    console.log('[WeatherCard] 天气数据加载成功')
  } catch (err) {
    error.value = err.message || '天气数据加载失败'
    emit('weather-error', err)
    console.error('[WeatherCard] 天气数据加载失败:', err)
  } finally {
    loading.value = false
  }
}

// 刷新天气
const refresh = () => {
  fetchWeather()
}

// 启动自动刷新
const startAutoRefresh = () => {
  if (props.autoRefresh && !refreshTimer) {
    refreshTimer = setInterval(() => {
      console.log('[WeatherCard] 自动刷新天气数据...')
      fetchWeather()
    }, props.refreshInterval)
  }
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

onMounted(() => {
  fetchWeather()
  startAutoRefresh()
})

onBeforeUnmount(() => {
  stopAutoRefresh()
})

// 暴露方法
defineExpose({
  refresh,
  getWeather: () => weather.value
})
</script>

<style scoped>
.weather-card {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  transition: all 0.3s ease;
}

.weather-card.dragging {
  cursor: move;
  transition: none;
  top: 0;
  right: 0;
}

/* 折叠状态的小标签 */
.collapsed-tab {
  background: rgba(33, 150, 243, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 600;
}

.collapsed-tab:hover {
  background: rgba(33, 150, 243, 1);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
}

.collapsed-tab i {
  font-size: 1.1rem;
}

/* 展开状态 */
.weather-card-expanded {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid rgba(33, 150, 243, 0.2);
}

/* 可拖动的头部 */
.weather-header {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: move;
  user-select: none;
}

.weather-header:active {
  cursor: grabbing;
}

.weather-icon {
  font-size: 1.3rem;
}

.weather-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.header-controls {
  display: flex;
  gap: 0.25rem;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.icon-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn.spinning i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 内容区域 */
.weather-content {
  padding: 1rem;
}

.weather-main {
  text-align: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 0.75rem;
}

.temp-large {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2196F3;
  margin-bottom: 0.25rem;
}

.weather-desc {
  font-size: 1rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.weather-desc i {
  font-size: 1.2rem;
  color: #FF9800;
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #555;
  padding: 0.4rem 0.5rem;
  background: rgba(33, 150, 243, 0.03);
  border-radius: 6px;
}

.detail-item i {
  width: 18px;
  color: #2196F3;
  font-size: 0.9rem;
}

.loading,
.error {
  text-align: center;
  padding: 1.5rem;
  color: #999;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.loading i {
  font-size: 1.5rem;
  color: #2196F3;
}

.error {
  color: #f44336;
}

.error i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.error p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.retry-btn {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #1976D2;
  transform: translateY(-1px);
}
</style>
