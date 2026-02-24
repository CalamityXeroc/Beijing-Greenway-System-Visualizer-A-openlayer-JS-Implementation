<template>
  <div class="toolbar-container">
    <!-- 折叠状态：只显示小按钮 -->
    <button 
      v-if="collapsed" 
      class="toolbar-toggle-btn" 
      @click="toggleCollapse"
      title="打开地图工具"
    >
      <i class="fas fa-tools"></i>
    </button>

    <!-- 展开状态：显示完整工具栏 -->
    <div v-else class="map-toolbar">
      <div class="toolbar-header">
        <h3><i class="fas fa-tools"></i> 地图工具</h3>
        <button 
          class="collapse-btn" 
          @click="toggleCollapse"
          title="收起工具栏"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="toolbar-content">
      <!-- 绘制工具 -->
      <div class="tool-section">
        <h4><i class="fas fa-draw-polygon"></i> 绘制工具</h4>
        <div class="tool-buttons">
          <button 
            class="tool-btn"
            :class="{ active: activeTool === 'point' }"
            @click="activateDrawTool('point')"
            title="绘制点"
          >
            <i class="fas fa-map-pin"></i>
            <span>点</span>
          </button>
          <button 
            class="tool-btn"
            :class="{ active: activeTool === 'line' }"
            @click="activateDrawTool('line')"
            title="绘制线"
          >
            <i class="fas fa-minus"></i>
            <span>线</span>
          </button>
          <button 
            class="tool-btn"
            :class="{ active: activeTool === 'polygon' }"
            @click="activateDrawTool('polygon')"
            title="绘制多边形"
          >
            <i class="fas fa-draw-polygon"></i>
            <span>面</span>
          </button>
        </div>
      </div>

      <!-- 测量工具 -->
      <div class="tool-section">
        <h4><i class="fas fa-ruler"></i> 测量工具</h4>
        <div class="tool-buttons">
          <button 
            class="tool-btn"
            :class="{ active: activeTool === 'measure-length' }"
            @click="activateMeasureTool('length')"
            title="测量距离"
          >
            <i class="fas fa-ruler-horizontal"></i>
            <span>距离</span>
          </button>
          <button 
            class="tool-btn"
            :class="{ active: activeTool === 'measure-area' }"
            @click="activateMeasureTool('area')"
            title="测量面积"
          >
            <i class="fas fa-ruler-combined"></i>
            <span>面积</span>
          </button>
        </div>
      </div>

<!-- 主题切换 -->
      <div class="tool-section">
        <h4><i class="fas fa-adjust"></i> 地图主题</h4>
        <div class="tool-buttons">
          <button 
            class="tool-btn"
            :class="{ active: currentTheme === 'day' }"
            @click="switchTheme('day')"
            title="日间模式"
          >
            <i class="fas fa-sun"></i>
            <span>日间</span>
          </button>
          <button 
            class="tool-btn"
            :class="{ active: currentTheme === 'night' }"
            @click="switchTheme('night')"
            title="夜间模式"
          >
            <i class="fas fa-moon"></i>
            <span>夜间</span>
          </button>
        </div>
      </div>

<!-- 图层管理 -->
      <div class="tool-section">
        <h4><i class="fas fa-layer-group"></i> 图层控制</h4>
        <div class="base-layer-list">
          <div 
            v-for="layer in filteredLayerConfig" 
            :key="layer.id"
            class="base-layer-item"
            @click="toggleBaseLayer(layer.id, !layer.visible)"
          >
            <div class="checkbox-wrapper">
              <input 
                :id="'layer-check-' + layer.id"
                type="checkbox" 
                :checked="layer.visible !== false"
                @click.stop
                @change="toggleBaseLayer(layer.id, $event.target.checked)"
              />
              <label :for="'layer-check-' + layer.id" @click.stop>{{ layer.name }}</label>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义图层 -->
      <div class="tool-section">
        <h4><i class="fas fa-upload"></i> 自定义图层</h4>
        <div class="layer-controls">
          <button class="tool-btn-block" @click="showLayerUpload = !showLayerUpload">
            <i class="fas fa-upload"></i>
            <span>上传 GeoJSON</span>
          </button>
          <div v-if="showLayerUpload" class="upload-panel">
            <input 
              type="file" 
              ref="fileInput"
              accept=".geojson,.json"
              @change="handleFileUpload"
              style="display: none"
            />
            <button @click="$refs.fileInput.click()" class="upload-btn">
              <i class="fas fa-file-upload"></i>
              选择文件
            </button>
          </div>
          <div v-if="customLayers.length > 0" class="custom-layer-list">
            <div 
              v-for="(layer, index) in customLayers" 
              :key="index"
              class="layer-item"
            >
              <label class="layer-checkbox">
                <input 
                  type="checkbox" 
                  :checked="layer.visible"
                  @change="toggleCustomLayer(index)"
                />
                <span>{{ layer.name }}</span>
              </label>
              <button @click="removeCustomLayer(index)" class="delete-btn">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 清除工具 -->
      <div class="tool-section">
        <h4><i class="fas fa-eraser"></i> 清除</h4>
        <div class="tool-buttons">
          <button class="tool-btn-danger" @click="clearDrawings">
            <i class="fas fa-trash-alt"></i>
            <span>清除绘制</span>
          </button>
          <button class="tool-btn-danger" @click="clearMeasurements">
            <i class="fas fa-ruler"></i>
            <span>清除测量</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Draw from 'ol/interaction/Draw'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Stroke, Fill, Circle as CircleStyle, Text } from 'ol/style'
import { getLength, getArea } from 'ol/sphere'
import { LineString, Polygon } from 'ol/geom'
import GeoJSON from 'ol/format/GeoJSON'
import { useGlobalTheme } from '@/utils/useTheme'

const props = defineProps({
  mapManager: {
    type: Object,
    required: true
  },
  layerConfig: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['tool-activated', 'layer-added', 'layer-toggled'])

// 全局主题系统（控制 data-theme 属性和整站深色）
const { theme: globalTheme, setTheme: setGlobalTheme } = useGlobalTheme()

// 状态
const collapsed = ref(true) // 默认折叠状态
const activeTool = ref(null)
const showLayerUpload = ref(false)
const customLayers = ref([])
const currentTheme = ref(globalTheme.value) // 主题状态：从全局主题初始化

// 图层控制列表(排除绿道图层,它们始终可见)
const filteredLayerConfig = computed(() => {
  return props.layerConfig.filter(layer => {
    return layer.id !== 'wenyu-greenway' && 
           layer.id !== 'huanerhuan-greenway' && 
           layer.id !== 'liangmahe-greenway' &&
           layer.id !== 'changying-greenway' &&
           layer.id !== 'changping42-greenway' &&
           layer.id !== 'lidu-greenway' &&
           layer.id !== 'beiyunhe-greenway' &&
           layer.id !== 'nansha-greenway' &&
           layer.id !== 'aosen-greenway' &&
           layer.id !== 'yingcheng-greenway' &&
           layer.id !== 'sanshan-greenway' &&
           layer.id !== 'chaoyang-greenway'
  })
})

// 绘制相关
let drawInteraction = null
let drawLayer = null
let measureLayer = null
const fileInput = ref(null)

// 初始化图层
onMounted(() => {
  initDrawLayer()
  initMeasureLayer()
  
  // 地图初始化后，将地图底图同步到全局主题
  if (props.mapManager && globalTheme.value === 'night') {
    props.mapManager.setBaseTheme('night', false)
    console.log('[MapToolbar] 初始同步地图底图为 night')
  }
})

// 清理
onBeforeUnmount(() => {
  if (drawInteraction) {
    props.mapManager.getMap().removeInteraction(drawInteraction)
  }
})

// 折叠/展开工具栏
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

// 初始化绘制图层
const initDrawLayer = () => {
  const source = new VectorSource()
  drawLayer = new VectorLayer({
    source: source,
    style: new Style({
      fill: new Fill({
        color: 'rgba(76, 175, 80, 0.2)'
      }),
      stroke: new Stroke({
        color: '#4CAF50',
        width: 3
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#4CAF50'
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 2
        })
      })
    }),
    zIndex: 100
  })
  props.mapManager.addLayer('draw-layer', drawLayer)
}

// 初始化测量图层
const initMeasureLayer = () => {
  const source = new VectorSource()
  measureLayer = new VectorLayer({
    source: source,
    style: (feature) => {
      const geometry = feature.getGeometry()
      const type = geometry.getType()
      let measurement = ''

      if (type === 'LineString') {
        measurement = formatLength(geometry)
      } else if (type === 'Polygon') {
        measurement = formatArea(geometry)
      }

      return new Style({
        fill: new Fill({
          color: 'rgba(33, 150, 243, 0.2)'
        }),
        stroke: new Stroke({
          color: '#2196F3',
          width: 3,
          lineDash: [10, 10]
        }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: '#2196F3'
          })
        }),
        text: new Text({
          text: measurement,
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 3 }),
          font: 'bold 14px sans-serif',
          offsetY: -15
        })
      })
    },
    zIndex: 101
  })
  props.mapManager.addLayer('measure-layer', measureLayer)
}

// 激活绘制工具
const activateDrawTool = (type) => {
  // 如果点击的是当前已激活的工具，则关闭它
  if (activeTool.value === type) {
    removeCurrentInteraction()
    return
  }
  
  removeCurrentInteraction()
  
  const geometryType = type === 'point' ? 'Point' : 
                       type === 'line' ? 'LineString' : 'Polygon'
  
  activeTool.value = type
  
  drawInteraction = new Draw({
    source: drawLayer.getSource(),
    type: geometryType
  })
  
  props.mapManager.getMap().addInteraction(drawInteraction)
  
  drawInteraction.on('drawend', () => {
    emit('tool-activated', { type: 'draw', subType: type })
  })
}

// 激活测量工具
const activateMeasureTool = (type) => {
  // 如果点击的是当前已激活的工具，则关闭它
  if (activeTool.value === `measure-${type}`) {
    removeCurrentInteraction()
    return
  }
  
  removeCurrentInteraction()
  
  const geometryType = type === 'length' ? 'LineString' : 'Polygon'
  activeTool.value = `measure-${type}`
  
  drawInteraction = new Draw({
    source: measureLayer.getSource(),
    type: geometryType,
    // 确保只在测量图层上绘制
    style: new Style({
      fill: new Fill({
        color: 'rgba(33, 150, 243, 0.2)'
      }),
      stroke: new Stroke({
        color: '#2196F3',
        width: 2,
        lineDash: [10, 10]
      }),
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: '#2196F3'
        })
      })
    })
  })
  
  props.mapManager.getMap().addInteraction(drawInteraction)
  
  drawInteraction.on('drawend', (event) => {
    const feature = event.feature
    const geometry = feature.getGeometry()
    
    let measurement
    if (type === 'length') {
      measurement = formatLength(geometry)
    } else {
      measurement = formatArea(geometry)
    }
    
    emit('tool-activated', { type: 'measure', subType: type, value: measurement })
  })
}

// 移除当前交互
const removeCurrentInteraction = () => {
  const map = props.mapManager.getMap()
  if (drawInteraction) {
    // 从地图中移除交互
    map.removeInteraction(drawInteraction)
    drawInteraction = null
  }
  // 清除所有绘制交互（确保没有遗留的交互）
  // 使用slice()创建副本来避免遍历时修改数组的问题
  const interactions = map.getInteractions().getArray().slice()
  interactions.forEach(interaction => {
    if (interaction instanceof Draw) {
      map.removeInteraction(interaction)
    }
  })
  activeTool.value = null
}

// 格式化长度
const formatLength = (line) => {
  const length = getLength(line)
  if (length > 1000) {
    return Math.round((length / 1000) * 100) / 100 + ' km'
  }
  return Math.round(length * 100) / 100 + ' m'
}

// 格式化面积
const formatArea = (polygon) => {
  const area = getArea(polygon)
  if (area > 10000) {
    return Math.round((area / 1000000) * 100) / 100 + ' km²'
  }
  return Math.round(area * 100) / 100 + ' m²'
}

// 文件上传处理
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    const text = await file.text()
    const geojson = JSON.parse(text)
    
    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        featureProjection: 'EPSG:3857'
      })
    })
    
    const layer = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 152, 0, 0.2)'
        }),
        stroke: new Stroke({
          color: '#FF9800',
          width: 2
        }),
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: '#FF9800'
          })
        })
      }),
      zIndex: 50
    })
    
    const layerId = `custom-layer-${Date.now()}`
    props.mapManager.addLayer(layerId, layer)
    
    customLayers.value.push({
      id: layerId,
      name: file.name.replace('.geojson', '').replace('.json', ''),
      visible: true,
      layer: layer
    })
    
    // 缩放到图层范围
    const extent = source.getExtent()
    props.mapManager.fitExtent(extent, { padding: [50, 50, 50, 50] })
    
    emit('layer-added', { name: file.name, layerId })
    showLayerUpload.value = false
    event.target.value = ''
  } catch (error) {
    alert('文件解析失败: ' + error.message)
  }
}

const toggleCustomLayer = (index) => {
  const layer = customLayers.value[index]
  layer.visible = !layer.visible
  layer.layer.setVisible(layer.visible)
}

const removeCustomLayer = (index) => {
  const layer = customLayers.value[index]
  props.mapManager.removeLayer(layer.id)
  customLayers.value.splice(index, 1)
}

// 切换基础图层
const toggleBaseLayer = (layerId, visible) => {
  emit('layer-toggled', { layerId, visible })
}

// 切换地图主题（同时同步全局主题）
const switchTheme = (theme) => {
  if (!props.mapManager) {
    console.warn('[MapToolbar] MapManager 未初始化')
    return
  }
  currentTheme.value = theme
  // 同时更新全局主题（设置 data-theme 属性，返回整个站深色）
  setGlobalTheme(theme, true)
  // 更新地图底图滤镜
  props.mapManager.setBaseTheme(theme, true)
  console.log(`[MapToolbar] 用户切换主题: ${theme}`)
}

// 监听全局主题内部自动切换（时间自动），同步地图底图
watch(globalTheme, (newTheme) => {
  if (props.mapManager && newTheme !== currentTheme.value) {
    currentTheme.value = newTheme
    props.mapManager.setBaseTheme(newTheme, false)
  }
})

// 清除功能
const clearDrawings = () => {
  if (confirm('确定要清除所有绘制内容吗？')) {
    drawLayer.getSource().clear()
    removeCurrentInteraction()
  }
}

const clearMeasurements = () => {
  if (confirm('确定要清除所有测量结果吗？')) {
    measureLayer.getSource().clear()
    removeCurrentInteraction()
  }
}

// 暴露给父组件通过 ref 调用
defineExpose({
  activateDrawTool,
  activateMeasureTool,
  switchTheme,
  toggleBaseLayer,
  clearDrawings,
  clearMeasurements,
  toggleCustomLayer,
  removeCustomLayer,
  handleFileUpload,
  filteredLayerConfig,
  customLayers,
  activeTool,
  currentTheme,
  showLayerUpload,
})
</script>

<style scoped>
/* 容器 */
.toolbar-container {
  position: absolute;
  top: calc(1rem + 100px);
  right: 1rem;
  z-index: 2000;
  /* 移除 pointer-events: none，让容器正常响应点击 */
}

/* 移除这个规则，因为容器已经可以响应点击了 */
/* .toolbar-container > * {
  pointer-events: auto;
} */

/* 折叠按钮样式 */
.toolbar-toggle-btn {
  position: relative;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  color: white;
  font-size: 1.3rem;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  /* 移除 !important */
  pointer-events: auto;
  z-index: 2001;
}

.toolbar-toggle-btn:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.5);
  background: linear-gradient(135deg, #43A047, #5CB860);
}

.toolbar-toggle-btn:active {
  transform: scale(0.95);
}

.toolbar-toggle-btn i {
  animation: pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 展开的工具栏样式 */
.map-toolbar {
  position: relative;
  width: 240px;
  background: rgba(255, 255, 255, 0.95);
  
  /* --- 修复点 1：加强 backdrop-filter 兼容性 --- */
  -webkit-backdrop-filter: blur(10px); /* 兼容 iOS */
  backdrop-filter: blur(10px);
  
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(76, 175, 80, 0.2);
  
  /* --- 修复点 2：优化移动端高度计算 --- */
  max-height: calc(100vh - 2rem); /* 桌面端默认 */
  max-height: 80vh; /* 覆盖为更安全的移动端高度，避免被导航栏遮挡 */
  
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* 增加移动端滚动回弹 */

  animation: slideIn 0.3s ease;
  /* 移除 !important */
  pointer-events: auto;
  z-index: 2001;
}

/* 额外适配：小屏手机强制限制较低高度 */
@media screen and (max-height: 600px) {
  .map-toolbar {
    max-height: 60vh;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toolbar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 2px solid rgba(76, 175, 80, 0.15);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(33, 150, 243, 0.08));
}

.toolbar-header h3 {
  margin: 0;
  color: #2E7D32;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-header h3 i {
  font-size: 1rem;
  color: #4CAF50;
  pointer-events: none;
}

.collapse-btn {
  position: relative;
  background: rgba(76, 175, 80, 0.1);
  border: none;
  cursor: pointer;
  color: #4CAF50;
  font-size: 1.1rem;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  /* 移除 !important */
  pointer-events: auto;
  z-index: 2002;
}

.collapse-btn:hover {
  background: rgba(76, 175, 80, 0.2);
  transform: rotate(90deg);
}

.collapse-btn i {
  pointer-events: none;
}

.toolbar-content {
  padding: 0.75rem;
}

.tool-section {
  margin-bottom: 1rem;
}

.tool-section:last-child {
  margin-bottom: 0;
}

.tool-section h4 {
  color: #558B2F;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
}

.tool-section h4 i {
  font-size: 0.8rem;
}

.tool-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.5rem 0.3rem;
  background: rgba(76, 175, 80, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #558B2F;
  font-size: 0.75rem;
}

.tool-btn:hover {
  background: rgba(76, 175, 80, 0.1);
  border-color: #4CAF50;
  transform: translateY(-1px);
}

.tool-btn.active {
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: white;
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.tool-btn i {
  font-size: 1rem;
}

.tool-btn-block {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.tool-btn-block:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.tool-btn-block i {
  font-size: 0.85rem;
}

.tool-btn-danger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem;
  background: rgba(244, 67, 54, 0.1);
  color: #D32F2F;
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  margin-bottom: 0.4rem;
}

.tool-btn-danger:hover {
  background: rgba(244, 67, 54, 0.2);
  border-color: #F44336;
}

.tool-btn-danger i {
  font-size: 0.85rem;
}

.custom-layer-list {
  max-height: 150px;
  overflow-y: auto;
  margin-top: 0.4rem;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.4rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  gap: 0.5rem;
}

.checkbox-wrapper input[type="checkbox"] {
  accent-color: #4CAF50;
  width: 16px;
  height: 16px;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

.checkbox-wrapper label {
  cursor: pointer;
  font-size: 0.85rem;
  color: #333;
  flex: 1;
  user-select: none;
  position: relative;
  z-index: 2;
}

/* 移除旧的 .layer-checkbox 样式（如果不再使用或冲突） */
.layer-checkbox {
  display: none; 
}

.base-layer-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.base-layer-item {
  background: rgba(76, 175, 80, 0.03);
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative; /* Ensure stacking context */
  z-index: 1;
  cursor: pointer; /* Add pointer cursor to the whole item */
}

.base-layer-item:hover {
  background: rgba(76, 175, 80, 0.08);
}

.delete-btn {
  padding: 0.4rem;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.2);
  border-radius: 6px;
  cursor: pointer;
  color: #D32F2F;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.2);
}

.delete-btn i {
  font-size: 0.7rem;
}

.upload-panel {
  margin-top: 0.4rem;
}

.upload-btn {
  width: 100%;
  padding: 0.6rem;
  background: rgba(255, 152, 0, 0.1);
  border: 2px dashed rgba(255, 152, 0, 0.5);
  border-radius: 8px;
  cursor: pointer;
  color: #F57C00;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background: rgba(255, 152, 0, 0.2);
  border-color: #FF9800;
}

.upload-btn i {
  font-size: 0.85rem;
}

/* 滚动条样式 */
.map-toolbar::-webkit-scrollbar,
.custom-layer-list::-webkit-scrollbar {
  width: 6px;
}

.map-toolbar::-webkit-scrollbar-track,
.custom-layer-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.map-toolbar::-webkit-scrollbar-thumb,
.custom-layer-list::-webkit-scrollbar-thumb {
  background: rgba(76, 175, 80, 0.3);
  border-radius: 3px;
}

.map-toolbar::-webkit-scrollbar-thumb:hover,
.custom-layer-list::-webkit-scrollbar-thumb:hover {
  background: rgba(76, 175, 80, 0.5);
}
</style>
