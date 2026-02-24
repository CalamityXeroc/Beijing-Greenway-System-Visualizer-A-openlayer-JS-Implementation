<template>
  <div class="mobile-map-toolbar">
    <!-- 工具箱触发按钮 -->
    <button class="fab fab-secondary" title="工具箱" @click="toggleToolbox">
      <i class="fas fa-tools"></i>
    </button>

    <!-- 工具箱底部面板 -->
    <Teleport to="body">
      <div v-if="isOpen" class="toolbox-overlay" @click="closeToolbox">
        <div class="toolbox-panel" @click.stop>
          <div class="toolbox-header">
            <h3>地图工具</h3>
            <button class="close-btn" @click="closeToolbox">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="toolbox-content">
            <!-- 主题切换 -->
            <div class="tool-section">
              <h4><i class="fas fa-palette"></i> 地图主题</h4>
              <div class="tool-grid">
                <button 
                  class="tool-btn" 
                  :class="{ active: !isNightMode }" 
                  @click="toggleTheme(false)"
                >
                  <i class="fas fa-sun"></i>
                  <span>日间模式</span>
                </button>
                <button 
                  class="tool-btn" 
                  :class="{ active: isNightMode }" 
                  @click="toggleTheme(true)"
                >
                  <i class="fas fa-moon"></i>
                  <span>夜间模式</span>
                </button>
              </div>
            </div>

            <!-- 绘制工具 -->
            <div class="tool-section">
              <h4><i class="fas fa-paint-brush"></i> 绘制工具</h4>
              <div class="tool-grid">
                <button 
                  class="tool-btn" 
                  :class="{ active: activeTool === 'Point' }" 
                  @click="activateDrawTool('Point')"
                >
                  <i class="fas fa-map-marker-alt"></i>
                  <span>画点</span>
                </button>
                <button 
                  class="tool-btn" 
                  :class="{ active: activeTool === 'LineString' }" 
                  @click="activateDrawTool('LineString')"
                >
                  <i class="fas fa-route"></i>
                  <span>画线</span>
                </button>
                <button 
                  class="tool-btn" 
                  :class="{ active: activeTool === 'Polygon' }" 
                  @click="activateDrawTool('Polygon')"
                >
                  <i class="fas fa-draw-polygon"></i>
                  <span>画面</span>
                </button>
              </div>
            </div>

            <!-- 测量工具 -->
            <div class="tool-section">
              <h4><i class="fas fa-ruler"></i> 测量工具</h4>
              <div class="tool-grid">
                <button 
                  class="tool-btn" 
                  :class="{ active: activeTool === 'MeasureLength' }" 
                  @click="activateMeasureTool('length')"
                >
                  <i class="fas fa-ruler-horizontal"></i>
                  <span>测距</span>
                </button>
                <button 
                  class="tool-btn" 
                  :class="{ active: activeTool === 'MeasureArea' }" 
                  @click="activateMeasureTool('area')"
                >
                  <i class="fas fa-ruler-combined"></i>
                  <span>测面</span>
                </button>
              </div>
            </div>

            <!-- 清除工具 -->
            <div class="tool-section">
              <button class="clear-btn" @click="clearAll">
                <i class="fas fa-trash-alt"></i>
                <span>清除所有绘制与测量</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import Draw from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'
import { getArea, getLength } from 'ol/sphere'
import { LineString, Polygon } from 'ol/geom'
import Overlay from 'ol/Overlay'

const props = defineProps({
  map: {
    type: Object,
    default: null
  },
  isNightMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:isNightMode', 'update:isDrawing'])

const isOpen = ref(false)
const activeTool = ref(null)

watch(activeTool, (newVal) => {
  emit('update:isDrawing', newVal !== null)
})

let drawInteraction = null
let vectorLayer = null
let vectorSource = null
let measureTooltips = []

const toggleToolbox = () => {
  isOpen.value = !isOpen.value
}

const closeToolbox = () => {
  isOpen.value = false
}

const toggleTheme = (isNight) => {
  emit('update:isNightMode', isNight)
}

// 初始化绘制图层
const initVectorLayer = () => {
  if (!props.map || vectorLayer) return

  vectorSource = new VectorSource()
  vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33'
        })
      })
    }),
    zIndex: 100
  })
  props.map.addLayer(vectorLayer)
}

// 移除当前交互
const removeInteraction = () => {
  if (drawInteraction && props.map) {
    props.map.removeInteraction(drawInteraction)
    drawInteraction = null
  }
  activeTool.value = null
}

// 激活绘制工具
const activateDrawTool = (type) => {
  if (!props.map) return
  
  if (activeTool.value === type) {
    removeInteraction()
    return
  }

  removeInteraction()
  initVectorLayer()
  activeTool.value = type

  drawInteraction = new Draw({
    source: vectorSource,
    type: type
  })

  props.map.addInteraction(drawInteraction)
  closeToolbox() // 激活工具后关闭面板，方便用户操作
}

// 格式化长度
const formatLength = (line) => {
  const length = getLength(line)
  let output
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km'
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm'
  }
  return output
}

// 格式化面积
const formatArea = (polygon) => {
  const area = getArea(polygon)
  let output
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>'
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>'
  }
  return output
}

// 创建测量提示框
const createMeasureTooltip = () => {
  if (!props.map) return null
  
  const tooltipElement = document.createElement('div')
  tooltipElement.className = 'ol-tooltip ol-tooltip-measure'
  const tooltip = new Overlay({
    element: tooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false
  })
  props.map.addOverlay(tooltip)
  measureTooltips.push(tooltip)
  return { element: tooltipElement, overlay: tooltip }
}

// 激活测量工具
const activateMeasureTool = (type) => {
  if (!props.map) return
  
  const toolType = type === 'area' ? 'Polygon' : 'LineString'
  const activeName = type === 'area' ? 'MeasureArea' : 'MeasureLength'
  
  if (activeTool.value === activeName) {
    removeInteraction()
    return
  }

  removeInteraction()
  initVectorLayer()
  activeTool.value = activeName

  drawInteraction = new Draw({
    source: vectorSource,
    type: toolType,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2
      }),
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.7)'
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        })
      })
    })
  })

  let listener
  let sketch
  let tooltipObj

  drawInteraction.on('drawstart', (evt) => {
    sketch = evt.feature
    tooltipObj = createMeasureTooltip()
    let tooltipCoord = evt.coordinate

    listener = sketch.getGeometry().on('change', (evt) => {
      const geom = evt.target
      let output
      if (geom instanceof Polygon) {
        output = formatArea(geom)
        tooltipCoord = geom.getInteriorPoint().getCoordinates()
      } else if (geom instanceof LineString) {
        output = formatLength(geom)
        tooltipCoord = geom.getLastCoordinate()
      }
      if (tooltipObj && tooltipObj.element) {
        tooltipObj.element.innerHTML = output
        tooltipObj.overlay.setPosition(tooltipCoord)
      }
    })
  })

  drawInteraction.on('drawend', () => {
    if (tooltipObj && tooltipObj.element) {
      tooltipObj.element.className = 'ol-tooltip ol-tooltip-static'
      tooltipObj.overlay.setOffset([0, -7])
    }
    sketch = null
    tooltipObj = null
    import('ol/Observable').then(({ unByKey }) => {
      unByKey(listener)
    })
  })

  props.map.addInteraction(drawInteraction)
  closeToolbox()
}

// 清除所有
const clearAll = () => {
  if (vectorSource) {
    vectorSource.clear()
  }
  if (props.map) {
    measureTooltips.forEach(tooltip => {
      props.map.removeOverlay(tooltip)
    })
  }
  measureTooltips = []
  removeInteraction()
  closeToolbox()
}

onUnmounted(() => {
  removeInteraction()
  if (props.map && vectorLayer) {
    props.map.removeLayer(vectorLayer)
  }
  if (props.map) {
    measureTooltips.forEach(tooltip => {
      props.map.removeOverlay(tooltip)
    })
  }
})
</script>

<style scoped>
.mobile-map-toolbar {
  position: relative;
}

.fab {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;
}

.fab-secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.fab-secondary:active {
  background: var(--color-gray-50);
}

.toolbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease-out;
}

.toolbox-panel {
  width: 100%;
  background: var(--color-surface);
  border-radius: 20px 20px 0 0;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  animation: slideUp 0.3s ease-out;
  max-height: 80vh;
  overflow-y: auto;
}

.toolbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.toolbox-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--color-text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.tool-section {
  margin-bottom: 24px;
}

.tool-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  color: var(--color-text-primary);
  font-size: 12px;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-btn i {
  font-size: 24px;
}

.tool-btn.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.clear-btn {
  width: 100%;
  padding: 14px;
  background: #fff0f0;
  color: #e53935;
  border: 1px solid #ffcdd2;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.clear-btn:active {
  background: #ffebee;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>

<style>
/* 全局样式用于测量提示框 */
.ol-tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.9;
  white-space: nowrap;
  font-size: 12px;
  pointer-events: none;
}
.ol-tooltip-measure {
  opacity: 1;
  font-weight: bold;
}
.ol-tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
}
.ol-tooltip-measure:before,
.ol-tooltip-static:before {
  border-top: 6px solid rgba(0, 0, 0, 0.7);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}
.ol-tooltip-static:before {
  border-top-color: #ffcc33;
}
</style>
