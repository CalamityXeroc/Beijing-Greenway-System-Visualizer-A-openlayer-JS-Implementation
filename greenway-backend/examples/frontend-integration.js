// 前端 API 集成示例
// 将此代码复制到你的 Vue 组件中

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * 获取所有绿道列表
 */
export async function getAllGreenways() {
  try {
    const response = await fetch(`${API_BASE_URL}/greenways`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('获取绿道列表失败:', error);
    throw error;
  }
}

/**
 * 获取单个绿道详情（含兴趣点）
 */
export async function getGreenwayDetail(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/greenways/${id}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(`获取绿道 ${id} 详情失败:`, error);
    throw error;
  }
}

/**
 * 获取 GeoJSON FeatureCollection（用于地图显示）
 */
export async function getGreenwaysGeoJSON() {
  try {
    const response = await fetch(`${API_BASE_URL}/greenways/geojson/collection`);
    const featureCollection = await response.json();
    return featureCollection;
  } catch (error) {
    console.error('获取 GeoJSON 失败:', error);
    throw error;
  }
}

/**
 * 创建或更新绿道
 */
export async function createGreenway(greenway) {
  try {
    const response = await fetch(`${API_BASE_URL}/greenways`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(greenway)
    });
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('创建绿道失败:', error);
    throw error;
  }
}

/**
 * 为绿道添加兴趣点
 */
export async function addPOI(greenwayId, poi) {
  try {
    const response = await fetch(`${API_BASE_URL}/greenways/${greenwayId}/poi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(poi)
    });
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('添加兴趣点失败:', error);
    throw error;
  }
}

/**
 * 检查后端服务是否在线
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.warn('后端服务暂时不可用');
    return false;
  }
}

// ===== Vue 3 组件集成示例 =====

/*
<template>
  <div class="greenway-container">
    <!-- 绿道列表 -->
    <div v-if="greenways.length > 0" class="greenway-list">
      <div
        v-for="greenway in greenways"
        :key="greenway.id"
        class="greenway-card"
        @click="selectGreenway(greenway)"
      >
        <h3>{{ greenway.name }}</h3>
        <p>{{ greenway.description }}</p>
        <p class="location">📍 {{ greenway.location }}</p>
      </div>
    </div>

    <!-- 绿道详情 -->
    <div v-if="selectedGreenway" class="greenway-detail">
      <h2>{{ selectedGreenway.name }}</h2>
      <p>{{ selectedGreenway.introduction }}</p>
      <p>长度: {{ selectedGreenway.length }} km</p>
      
      <!-- 兴趣点列表 -->
      <h3>周边设施</h3>
      <ul v-if="selectedGreenway.points_of_interest">
        <li v-for="poi in selectedGreenway.points_of_interest" :key="poi.id">
          {{ poi.name }} ({{ poi.poi_type }})
        </li>
      </ul>
    </div>

    <!-- 地图显示所有绿道 -->
    <div id="map" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllGreenways, getGreenwayDetail, getGreenwaysGeoJSON } from '@/api/greenway'

const greenways = ref([])
const selectedGreenway = ref(null)

onMounted(async () => {
  try {
    // 获取所有绿道
    greenways.value = await getAllGreenways()
    
    // 获取 GeoJSON 用于地图显示
    const geoJSON = await getGreenwaysGeoJSON()
    
    // 在地图上显示 GeoJSON
    // map.addSource('greenways', { type: 'geojson', data: geoJSON })
    // ...地图代码...
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})

async function selectGreenway(greenway) {
  try {
    // 获取该绿道的详细信息（含兴趣点）
    selectedGreenway.value = await getGreenwayDetail(greenway.id)
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}
</script>

<style scoped>
.greenway-container {
  padding: 20px;
}

.greenway-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.greenway-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.greenway-card:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.greenway-detail {
  border: 2px solid #4CAF50;
  border-radius: 8px;
  padding: 20px;
  background: #f9f9f9;
  margin-bottom: 40px;
}

.map-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.location {
  color: #666;
  font-size: 14px;
}
</style>
*/
