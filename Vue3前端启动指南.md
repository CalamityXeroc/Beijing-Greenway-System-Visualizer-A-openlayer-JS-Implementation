# Vue 3 前端快速启动指南

## 🎯 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **地图库**: OpenLayers 8.2.0
- **HTTP客户端**: Axios
- **UI框架**: Element Plus (可选)
- **CSS方案**: 原生 CSS + CSS Variables

---

## 📦 第一步：创建项目

### 1.1 使用 Vite 创建 Vue 3 项目

```powershell
# 在当前目录创建前端项目
cd c:\Users\cheng\Desktop\tryyyyyy
npm create vite@latest greenway-frontend -- --template vue

# 进入项目目录
cd greenway-frontend

# 安装依赖
npm install
```

### 1.2 安装核心依赖

```powershell
# 地图库
npm install ol

# HTTP 客户端
npm install axios

# 路由
npm install vue-router@4

# 状态管理
npm install pinia

# UI 库（可选）
npm install element-plus

# 图标库
npm install @element-plus/icons-vue

# 工具库
npm install lodash-es
```

### 1.3 安装开发依赖

```powershell
# Sass（如果需要）
npm install -D sass

# ESLint + Prettier（可选）
npm install -D eslint prettier eslint-plugin-vue
```

---

## 📁 第二步：项目结构

```
greenway-frontend/
├─ public/
│  └─ images/              # 图片资源
├─ src/
│  ├─ assets/              # 静态资源
│  │  └─ styles/
│  │     ├─ variables.css  # CSS 变量
│  │     └─ global.css     # 全局样式
│  ├─ components/          # 通用组件
│  │  ├─ MapViewer.vue     # 地图组件
│  │  ├─ WeatherCard.vue   # 天气卡片
│  │  └─ Loading.vue       # 加载动画
│  ├─ views/               # 页面组件
│  │  ├─ Home.vue          # 首页（绿道总览）
│  │  ├─ GreenwayList.vue  # 绿道列表
│  │  └─ GreenwayDetail.vue # 绿道详情
│  ├─ services/            # API 服务
│  │  ├─ api.js            # API 封装
│  │  └─ config.js         # 配置文件
│  ├─ stores/              # Pinia 状态管理
│  │  ├─ greenway.js       # 绿道状态
│  │  └─ map.js            # 地图状态
│  ├─ router/              # 路由配置
│  │  └─ index.js
│  ├─ utils/               # 工具函数
│  │  ├─ map-utils.js      # 地图工具
│  │  └─ format.js         # 格式化函数
│  ├─ App.vue              # 根组件
│  └─ main.js              # 入口文件
├─ .env.development        # 开发环境变量
├─ .env.production         # 生产环境变量
├─ vite.config.js          # Vite 配置
└─ package.json
```

---

## 🔧 第三步：核心配置

### 3.1 环境变量配置

**.env.development**:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AMAP_KEY=d9dd334682ca1fc6537ffaaccf795fbd
```

**.env.production**:
```env
VITE_API_BASE_URL=https://api.example.com/api
VITE_AMAP_KEY=d9dd334682ca1fc6537ffaaccf795fbd
```

### 3.2 Vite 配置

**vite.config.js**:
```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      // 如果需要代理后端 API
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

### 3.3 路由配置

**src/router/index.js**:
```javascript
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '北京绿道系统' }
  },
  {
    path: '/greenways',
    name: 'GreenwayList',
    component: () => import('@/views/GreenwayList.vue'),
    meta: { title: '绿道列表' }
  },
  {
    path: '/greenways/:id',
    name: 'GreenwayDetail',
    component: () => import('@/views/GreenwayDetail.vue'),
    meta: { title: '绿道详情' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫（更新页面标题）
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '北京绿道系统';
  next();
});

export default router;
```

### 3.4 状态管理

**src/stores/greenway.js**:
```javascript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { greenwayAPI } from '@/services/api';

export const useGreenwayStore = defineStore('greenway', () => {
  // 状态
  const greenways = ref([]);
  const currentGreenway = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // 计算属性
  const greenwayCount = computed(() => greenways.value.length);

  // 方法
  const fetchGreenways = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await greenwayAPI.getList(params);
      greenways.value = data.items;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchGreenwayDetail = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await greenwayAPI.getDetail(id);
      currentGreenway.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    greenways,
    currentGreenway,
    loading,
    error,
    greenwayCount,
    fetchGreenways,
    fetchGreenwayDetail
  };
});
```

### 3.5 API 服务

**src/services/api.js** (已在接口文档中提供)

---

## 🎨 第四步：创建核心组件

### 4.1 地图组件

**src/components/MapViewer.vue**:
```vue
<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';

const props = defineProps({
  center: {
    type: Array,
    default: () => [116.5, 40]
  },
  zoom: {
    type: Number,
    default: 10
  },
  geojsonData: {
    type: Object,
    default: null
  },
  lineColor: {
    type: String,
    default: '#2196F3'
  },
  lineWidth: {
    type: Number,
    default: 4
  }
});

const emit = defineEmits(['mapReady', 'featureClick']);

const mapContainer = ref(null);
const map = ref(null);
const vectorLayer = ref(null);

onMounted(() => {
  initMap();
});

watch(() => props.geojsonData, (newData) => {
  if (newData && vectorLayer.value) {
    loadGeoJSON(newData);
  }
});

const initMap = () => {
  // 创建底图
  const baseLayer = new TileLayer({
    source: new XYZ({
      url: 'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      crossOrigin: 'anonymous'
    })
  });

  // 创建矢量图层
  vectorLayer.value = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      stroke: new Stroke({
        color: props.lineColor,
        width: props.lineWidth
      })
    })
  });

  // 创建地图
  map.value = new Map({
    target: mapContainer.value,
    layers: [baseLayer, vectorLayer.value],
    view: new View({
      center: fromLonLat(props.center),
      zoom: props.zoom
    })
  });

  // 点击事件
  map.value.on('click', (evt) => {
    const features = map.value.getFeaturesAtPixel(evt.pixel);
    if (features.length > 0) {
      emit('featureClick', features[0]);
    }
  });

  emit('mapReady', map.value);
};

const loadGeoJSON = (geojsonData) => {
  const features = new GeoJSON().readFeatures(geojsonData, {
    featureProjection: 'EPSG:3857'
  });
  
  const source = vectorLayer.value.getSource();
  source.clear();
  source.addFeatures(features);

  // 自动缩放到要素范围
  const extent = source.getExtent();
  map.value.getView().fit(extent, { padding: [50, 50, 50, 50] });
};

// 暴露方法供父组件调用
defineExpose({
  getMap: () => map.value,
  loadGeoJSON
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
}
</style>
```

### 4.2 天气卡片组件

**src/components/WeatherCard.vue**:
```vue
<template>
  <div class="weather-card">
    <div class="weather-header">
      <i class="fas fa-cloud-sun weather-icon"></i>
      <h3 class="weather-title">实时天气信息</h3>
      <button @click="refresh" class="refresh-btn" :disabled="loading">
        <i class="fas fa-sync-alt" :class="{ spinning: loading }"></i>
      </button>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> 加载中...
    </div>

    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="refresh">重试</button>
    </div>

    <div v-else-if="weather" class="weather-content">
      <div class="weather-item">
        <i :class="`fas ${getWeatherIcon(weather.weather)}`"></i>
        <div class="value">{{ weather.weather }}</div>
        <div class="label">天气状况</div>
      </div>

      <div class="weather-item">
        <i class="fas fa-temperature-high"></i>
        <div class="value">{{ weather.temperature }}°C</div>
        <div class="label">实时气温</div>
      </div>

      <div class="weather-item">
        <i class="fas fa-wind"></i>
        <div class="value">{{ weather.windDirection }}风</div>
        <div class="label">{{ weather.windPower }}级</div>
      </div>

      <div class="weather-item">
        <i class="fas fa-tint"></i>
        <div class="value">{{ weather.humidity }}%</div>
        <div class="label">空气湿度</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { weatherAPI } from '@/services/api';

const props = defineProps({
  longitude: {
    type: Number,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  autoRefresh: {
    type: Boolean,
    default: true
  }
});

const weather = ref(null);
const loading = ref(false);
const error = ref(null);

const getWeatherIcon = (weatherText) => {
  const icons = {
    '晴': 'fa-sun',
    '多云': 'fa-cloud-sun',
    '阴': 'fa-cloud',
    '雨': 'fa-cloud-rain',
    '雪': 'fa-snowflake',
    '雷阵雨': 'fa-cloud-bolt'
  };
  return icons[weatherText] || 'fa-cloud';
};

const fetchWeather = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await weatherAPI.getWeather(props.longitude, props.latitude);
    weather.value = data;
  } catch (err) {
    error.value = '天气数据加载失败';
    console.error('Weather fetch error:', err);
  } finally {
    loading.value = false;
  }
};

const refresh = () => {
  fetchWeather();
};

onMounted(() => {
  fetchWeather();

  // 自动刷新（30分钟）
  if (props.autoRefresh) {
    setInterval(fetchWeather, 30 * 60 * 1000);
  }
});
</script>

<style scoped>
.weather-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.weather-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(33, 150, 243, 0.1);
}

.refresh-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #2196F3;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.weather-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.weather-item {
  text-align: center;
  padding: 1rem;
  background: rgba(33, 150, 243, 0.05);
  border-radius: 12px;
  transition: transform 0.2s;
}

.weather-item:hover {
  transform: translateY(-3px);
  background: rgba(33, 150, 243, 0.1);
}

.weather-item i {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #2196F3;
}

.weather-item .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2196F3;
}

.weather-item .label {
  font-size: 0.85rem;
  color: #666;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.error {
  color: #f44336;
}

.error button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
```

---

## 🚀 第五步：迁移现有页面

### 5.1 温榆河详情页

**src/views/GreenwayDetail.vue**:
```vue
<template>
  <div class="greenway-detail">
    <header class="header">
      <h1>{{ greenway?.name || '加载中...' }}</h1>
      <p><i class="fas fa-leaf"></i> 沿河而行,探索城市绿色长廊</p>
    </header>

    <div class="content">
      <div class="info-section">
        <img :src="greenway?.imageUrl" :alt="greenway?.name" class="feature-image">
        <div class="highlights">
          <h3><i class="fas fa-star"></i>绿道亮点</h3>
          <ul>
            <li><strong>总长度:</strong> {{ greenway?.lengthKm }}公里</li>
            <li><strong>覆盖区域:</strong> {{ greenway?.districts?.join('、') }}</li>
            <li><strong>建设面积:</strong> {{ greenway?.areaHectare }}公顷</li>
          </ul>
        </div>
      </div>

      <div class="map-section">
        <MapViewer
          :geojson-data="greenway?.geojson"
          :center="[116.5, 40]"
          :zoom="10"
          @map-ready="onMapReady"
        />
        
        <WeatherCard
          v-if="mapCenter"
          :longitude="mapCenter[0]"
          :latitude="mapCenter[1]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useGreenwayStore } from '@/stores/greenway';
import MapViewer from '@/components/MapViewer.vue';
import WeatherCard from '@/components/WeatherCard.vue';
import { fromLonLat, toLonLat } from 'ol/proj';

const route = useRoute();
const greenwayStore = useGreenwayStore();

const greenway = ref(null);
const mapCenter = ref(null);

const onMapReady = (map) => {
  const center = map.getView().getCenter();
  mapCenter.value = toLonLat(center);
};

onMounted(async () => {
  const id = route.params.id;
  greenway.value = await greenwayStore.fetchGreenwayDetail(id);
});
</script>

<style scoped>
/* 复用现有样式 */
</style>
```

---

## ✅ 第六步：启动项目

```powershell
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

浏览器访问: `http://localhost:5173`

---

## 🔄 与后端联调流程

1. **Mock 数据阶段**（后端还没好）:
   - 在 `src/services/api.js` 中返回假数据
   - 先完成前端 UI 和交互

2. **接口对接阶段**（后端接口完成）:
   - 替换假数据为真实 API 调用
   - 处理加载状态和错误

3. **联调测试阶段**:
   - 使用 Postman 验证接口
   - 前端调用并显示真实数据
   - 修复数据格式问题

---

## 📋 前端开发检查清单

- [ ] Vue 3 项目创建完成
- [ ] 核心依赖安装完成
- [ ] 路由配置完成
- [ ] 状态管理配置完成
- [ ] API 服务封装完成
- [ ] 地图组件开发完成
- [ ] 天气组件开发完成
- [ ] 首页迁移完成
- [ ] 详情页迁移完成
- [ ] 响应式适配完成
- [ ] 与后端接口对接完成

---

## 🆘 常见问题

### Q1: Vite 项目无法启动?
```powershell
# 清除缓存
rm -r node_modules
rm package-lock.json
npm install
```

### Q2: OpenLayers 样式丢失?
```javascript
// main.js 中导入 CSS
import 'ol/ol.css';
```

### Q3: API 跨域错误?
```javascript
// vite.config.js 配置代理
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

---

**下一步**: 运行 `npm create vite@latest` 开始创建项目！
