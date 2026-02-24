<template>
  <div ref="mapContainer" class="map-viewer" :style="{ height: height }"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { rafThrottle, scheduleIdleTask } from '@/utils/performance'
import { useGlobalTheme } from '@/utils/useTheme'

const POINTER_MOVE_THRESHOLD = 0.75

const hasPointerShifted = (prevPixel, nextPixel) => {
  if (!prevPixel) return true
  return (
    Math.abs(prevPixel[0] - nextPixel[0]) > POINTER_MOVE_THRESHOLD ||
    Math.abs(prevPixel[1] - nextPixel[1]) > POINTER_MOVE_THRESHOLD
  )
}

const STYLE_SIGNATURE_EMPTY = '__default__'

const props = defineProps({
  // 地图配置
  center: {
    type: Array,
    default: () => [116.3, 39.95]
  },
  zoom: {
    type: Number,
    default: 10
  },
  height: {
    type: String,
    default: '100%'
  },
  // 底图配置
  baseLayerStyle: {
    type: Number,
    default: 8 // 高德地图样式
  },
  // 图层数据
  layers: {
    type: Array,
    default: () => []
  },
  // 是否允许交互（缩放、平移）
  interactive: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'map-ready',
  'map-click',
  'feature-click',
  'feature-hover',
  'center-changed',
  'zoom-changed'
])

const mapContainer = ref(null)

let map = null
let mapManager = null
let layerManager = null
const loadedLayers = new Map()
const layerIdLookup = new WeakMap()
let clickHandler = null
let pointerMoveHandler = null
let lastPointerPixel = null
const deferredLayerConfigs = new Map()
const deferredCreationTasks = new Map()

// 获取全局主题管理
const { theme: globalTheme } = useGlobalTheme()

// 初始化地图
onMounted(async () => {
  await nextTick()
  
  // 直接创建实例，不用单例
  const MapManagerClass = (await import('@/core/MapManager')).default
  const LayerManagerClass = (await import('@/core/LayerManager')).default
  
  mapManager = new MapManagerClass()
  layerManager = new LayerManagerClass()
  
  // 初始化地图实例
  map = mapManager.init(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    interactive: props.interactive
  })

  // 添加底图
  const baseLayer = layerManager.createGaodeLayer(props.baseLayerStyle)
  mapManager.addLayer('base', baseLayer)
  
  // 设置地图容器用于主题切换
  mapManager.setMapContainer(mapContainer.value)
  
  // 立即应用当前全局主题
  const isNight = globalTheme.value === 'night'
  if (isNight) {
    mapContainer.value.classList.add('night-mode')
  } else {
    mapContainer.value.classList.remove('night-mode')
  }
  
  loadedLayers.set('base', { layer: baseLayer, type: 'base', styleSignature: STYLE_SIGNATURE_EMPTY })
  layerIdLookup.set(baseLayer, 'base')

  // 加载初始图层
  if (props.layers && props.layers.length > 0) {
    await syncLayers(props.layers)
  }

  // 注册事件监听
  setupEventListeners()

  // 通知父组件地图已就绪
  emit('map-ready', map)
  
  console.log('[MapViewer] 地图组件初始化完成')
})

// 监听图层数据变化，按需增删改
watch(
  () => props.layers,
  (newLayers = []) => {
    if (!mapManager || !layerManager) return
    syncLayers(newLayers)
  },
  { deep: true }
)

// 监听全局主题变化
watch(
  () => globalTheme.value,
  (newTheme) => {
    if (!mapContainer.value) return
    if (newTheme === 'night') {
      mapContainer.value.classList.add('night-mode')
    } else {
      mapContainer.value.classList.remove('night-mode')
    }
  }
)

const getStyleSignature = (styleConfig) => {
  if (!styleConfig) return STYLE_SIGNATURE_EMPTY
  try {
    return JSON.stringify(styleConfig)
  } catch (error) {
    console.warn('[MapViewer] 样式配置无法序列化，将强制刷新图层样式', error)
    return `${STYLE_SIGNATURE_EMPTY}-${Date.now()}`
  }
}

const createLayerFromConfig = (config) => {
  if (!config) return null

  const baseOptions = {
    zIndex: config.zIndex ?? 10,
    visible: config.visible !== false
  }

  const styleFunction = config.style ? layerManager.createStyleFunction(config.style) : undefined

  if (config.type === 'vector') {
    return {
      layer: layerManager.createVectorLayerFromFeatures([], {
        ...baseOptions,
        style: styleFunction
      }),
      styleSignature: getStyleSignature(config.style)
    }
  }

  return {
    layer: layerManager.createVectorLayerFromGeoJSON({
      url: config.url,
      data: config.data,
      style: styleFunction,
      zIndex: baseOptions.zIndex,
      visible: baseOptions.visible,
      renderAsImage: config.renderAsImage !== false
    }),
    styleSignature: getStyleSignature(config.style)
  }
}

const applyLayerRuntimeProps = (record, config) => {
  if (!record?.layer || !config) return

  const desiredVisible = config.visible !== false
  if (record.layer.getVisible() !== desiredVisible) {
    record.layer.setVisible(desiredVisible)
  }

  const desiredZ = config.zIndex ?? 10
  if (record.layer.getZIndex?.() !== desiredZ) {
    record.layer.setZIndex?.(desiredZ)
  }

  const nextStyleSignature = getStyleSignature(config.style)
  if (nextStyleSignature !== record.styleSignature) {
    const nextStyle = config.style ? layerManager.createStyleFunction(config.style) : undefined
    record.layer.setStyle(nextStyle)
    record.styleSignature = nextStyleSignature
  }
}

const shouldRebuildLayer = (record, config) => {
  if (!record) return true
  return (
    record.type !== (config.type || 'geojson') ||
    record.url !== (config.url || null) ||
    record.dataRef !== (config.data || null)
  )
}

const teardownLayer = (layerId) => {
  if (layerId === 'base') return
  cancelDeferredLayer(layerId)
  const record = loadedLayers.get(layerId)
  if (!record) return
  mapManager.removeLayer(layerId)
  layerIdLookup.delete(record.layer)
  loadedLayers.delete(layerId)
}

const cancelDeferredLayer = (layerId) => {
  if (deferredCreationTasks.has(layerId)) {
    deferredCreationTasks.get(layerId)?.cancel?.()
    deferredCreationTasks.delete(layerId)
  }
  deferredLayerConfigs.delete(layerId)
}

const queueDeferredLayer = (layerId, config) => {
  deferredLayerConfigs.set(layerId, { ...config })
  if (deferredCreationTasks.has(layerId)) return

  const handle = scheduleIdleTask(() => {
    deferredCreationTasks.delete(layerId)
    const latestConfig = deferredLayerConfigs.get(layerId)
    if (!latestConfig || loadedLayers.has(layerId)) {
      deferredLayerConfigs.delete(layerId)
      return
    }

    const created = createLayerFromConfig(latestConfig)
    if (!created?.layer) {
      deferredLayerConfigs.delete(layerId)
      return
    }

    mapManager.addLayer(layerId, created.layer)
    loadedLayers.set(layerId, {
      layer: created.layer,
      type: latestConfig.type || 'geojson',
      url: latestConfig.url || null,
      dataRef: latestConfig.data || null,
      styleSignature: created.styleSignature
    })
    layerIdLookup.set(created.layer, layerId)
    deferredLayerConfigs.delete(layerId)

    if (latestConfig.fitExtent) {
      const source = created.layer.getSource?.()
      if (source) {
        source.once('change', () => {
          if (source.getState() === 'ready') {
            mapManager.fitExtent(source.getExtent())
          }
        })
      }
    }
  }, { timeout: config.deferTimeout || 1500 })

  deferredCreationTasks.set(layerId, handle)
}

async function syncLayers(layersConfig = []) {
  const targetIds = new Set()

  for (let index = 0; index < layersConfig.length; index += 1) {
    const config = layersConfig[index]
    if (!config) continue

    const layerId = config.id || `layer-${index}`
    targetIds.add(layerId)

    const existingRecord = loadedLayers.get(layerId)
    if (!existingRecord && config.defer) {
      queueDeferredLayer(layerId, config)
      continue
    } else if (!config.defer) {
      cancelDeferredLayer(layerId)
    }

    if (shouldRebuildLayer(existingRecord, config)) {
      teardownLayer(layerId)

      if (config.defer) {
        queueDeferredLayer(layerId, config)
        continue
      }

      const created = createLayerFromConfig(config)
      if (!created?.layer) {
        console.warn('[MapViewer] 图层创建失败，已跳过', config)
        continue
      }

      mapManager.addLayer(layerId, created.layer)
      loadedLayers.set(layerId, {
        layer: created.layer,
        type: config.type || 'geojson',
        url: config.url || null,
        dataRef: config.data || null,
        styleSignature: created.styleSignature
      })
      layerIdLookup.set(created.layer, layerId)

      if (config.fitExtent) {
        const source = created.layer.getSource?.()
        if (source) {
          const fit = () => {
            if (source.getState() === 'ready') {
              const extent = source.getExtent()
              if (extent && extent.every(v => Number.isFinite(v))) {
                 try {
                    mapManager.fitExtent(extent)
                 } catch (e) {
                    console.warn('[MapViewer] Zoom to extent failed', e)
                 }
              }
            }
          }
          
          if (source.getState() === 'ready') {
            fit()
          } else {
            source.once('change', fit)
          }
        }
      }
    } else {
      // 即使不需要重建，也需要更新运行时属性（如可见性、zIndex、样式）
      applyLayerRuntimeProps(existingRecord, config)
    }
  }

  // 移除不再需要的图层
  loadedLayers.forEach((record, id) => {
    if (id === 'base') return
    if (!targetIds.has(id)) {
      teardownLayer(id)
    }
  })

  // 清理已经不需要的延迟任务
  deferredLayerConfigs.forEach((_, id) => {
    if (!targetIds.has(id)) {
      cancelDeferredLayer(id)
    }
  })
}

// 设置事件监听器
function setupEventListeners() {
  if (!mapManager) return
  
  // 点击事件
  clickHandler = (evt) => {
    emit('map-click', {
      coordinate: evt.coordinate,
      pixel: evt.pixel
    })

    // 检测是否点击到要素，并获取图层信息
    const featuresWithLayers = []
    map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
      // 找到对应的图层ID
      const layerId = layerIdLookup.get(layer) || null
      
      featuresWithLayers.push({
        feature: feature,
        layer: layer,
        layerId: layerId
      })
    })
    
    if (featuresWithLayers.length > 0) {
      emit('feature-click', {
        features: featuresWithLayers.map(f => f.feature),
        featuresWithLayers: featuresWithLayers,
        coordinate: evt.coordinate,
        pixel: evt.pixel
      })
    }
  }
  mapManager.on('click', clickHandler)

  // 鼠标移动事件 - 使用 requestAnimationFrame 节流
  let lastHoverKey = null
  pointerMoveHandler = rafThrottle((evt) => {
    // 如果正在拖拽或缩放，跳过 hit detection
    if (evt.dragging) return

    const featuresWithLayers = []
    let hasFeature = false

    map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
      hasFeature = true
      const layerId = layerIdLookup.get(layer) || null
      featuresWithLayers.push({
        feature,
        layer,
        layerId
      })
      return true // 只获取最上层的要素
    }, {
      hitTolerance: 5, // 稍微减小点击容差
      layerFilter: (layer) => {
        // 过滤掉不需要交互的图层（如底图或不可见图层）
        return layer.getVisible() && layer.get('interactive') !== false
      }
    })

    const targetElement = map.getTargetElement()
    const newCursor = hasFeature ? 'pointer' : ''
    if (targetElement && targetElement.style.cursor !== newCursor) {
      targetElement.style.cursor = newCursor
    }

    const pointerMoved = hasPointerShifted(lastPointerPixel, evt.pixel)

    if (featuresWithLayers.length > 0) {
      const topFeature = featuresWithLayers[0]
      const featureId = typeof topFeature.feature.getId === 'function'
        ? topFeature.feature.getId()
        : topFeature.feature.ol_uid
      const hoverKey = `${topFeature.layerId || 'unknown'}-${featureId}`

      if (hoverKey !== lastHoverKey || pointerMoved) {
        lastHoverKey = hoverKey
        lastPointerPixel = [evt.pixel[0], evt.pixel[1]]

        emit('feature-hover', {
          features: featuresWithLayers.map(f => f.feature),
          featuresWithLayers,
          coordinate: evt.coordinate,
          pixel: evt.pixel
        })
      }
    } else if (lastHoverKey !== null) {
      lastHoverKey = null
      lastPointerPixel = [evt.pixel[0], evt.pixel[1]]
      emit('feature-hover', {
        features: [],
        featuresWithLayers: [],
        coordinate: evt.coordinate,
        pixel: evt.pixel
      })
    } else if (pointerMoved) {
      lastPointerPixel = [evt.pixel[0], evt.pixel[1]]
    }
  })

  mapManager.on('pointermove', pointerMoveHandler)

  // 视图变化事件
  const view = mapManager.getView()
  view.on('change:center', () => {
    emit('center-changed', mapManager.getCenter())
  })

  view.on('change:resolution', () => {
    emit('zoom-changed', view.getZoom())
  })
}

// 暴露方法供父组件调用
defineExpose({
  getMap: () => map,
  getMapManager: () => mapManager,
  getLayerManager: () => layerManager,
  setCenter: (lonLat, zoom) => mapManager?.setCenter(lonLat, zoom),
  fitExtent: (extent, options) => mapManager?.fitExtent(extent, options),
  addLayer: (id, layer, meta = {}) => {
    if (!mapManager || !layer) return
    mapManager.addLayer(id, layer)
    loadedLayers.set(id, {
      layer,
      type: meta.type || 'custom',
      url: meta.url || null,
      dataRef: meta.dataRef || null,
      styleSignature: STYLE_SIGNATURE_EMPTY
    })
    layerIdLookup.set(layer, id)
  },
  removeLayer: (id) => {
    if (!mapManager) return
    teardownLayer(id)
  },
  setLayerVisibility: (id, visible) => {
    const record = loadedLayers.get(id)
    if (record?.layer) {
      record.layer.setVisible(visible)
    } else {
      mapManager?.setLayerVisibility(id, visible)
    }
  }
})

// 清理
onBeforeUnmount(() => {
  if (mapManager) {
    if (clickHandler) {
      mapManager.un('click', clickHandler)
    }
    if (pointerMoveHandler) {
      mapManager.un('pointermove', pointerMoveHandler)
    }
    mapManager.destroy()
  }
  loadedLayers.clear()
  deferredLayerConfigs.clear()
  deferredCreationTasks.forEach(task => task?.cancel?.())
  deferredCreationTasks.clear()
  console.log('[MapViewer] 组件卸载')
})
</script>

<style scoped>
.map-viewer {
  width: 100%;
  position: relative;
  border-radius: 0;
  overflow: hidden;
  /* 硬件加速优化 */
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  /* 强制GPU渲染 */
  -webkit-transform: translateZ(0);
  -moz-transform: translateZ(0);
  -ms-transform: translateZ(0);
  -o-transform: translateZ(0);
}

/* OpenLayers 控件样式优化 */
:deep(.ol-control) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.ol-control button) {
  background: transparent;
  transition: all 0.2s ease;
}

:deep(.ol-control button:hover) {
  background: rgba(33, 150, 243, 0.1);
}

:deep(.ol-zoom) {
  top: 1rem;
  left: auto;
  right: 1rem;
}

:deep(.ol-attribution) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

/* 夜间模式滤镜 - 模拟高德极夜蓝主题 (amap://styles/blue) */
.map-viewer.night-mode {
  transition: filter 0.5s ease-in-out;
  background-color: #020918;
}

.map-viewer.night-mode :deep(.gaode-base-layer) {
  /* 
   * 滤镜原理 - 单色蓝调风格 (Monochromatic Blue):
   * 仅应用于底图图层，不影响绿道等矢量图层
   * 1. grayscale(100%): 去除所有原始颜色
   * 2. invert(100%): 反转亮度，白底变黑底
   * 3. sepia(100%): 叠加上深褐色/黄色调
   * 4. hue-rotate(190deg): 将褐色调旋转为深蓝色 (科技蓝)
   * 5. saturate(400%): 增强蓝色的饱和度
   * 6. brightness(90%) + contrast(85%): 调整整体明暗对比
   */
  filter: grayscale(100%) invert(100%) sepia(100%) hue-rotate(190deg) saturate(400%) brightness(90%) contrast(85%) !important;
}

/* 增强绿道图层在夜间模式下的显示效果 */
.map-viewer.night-mode :deep(.ol-layer:not(.gaode-base-layer)) {
  filter: brightness(1.2) drop-shadow(0 0 5px rgba(132, 237, 132, 0.6));
}

.map-viewer.night-mode :deep(.ol-control) {
  /* 控件保持反白清晰，微调蓝调以融合背景 */
  background: rgba(16, 35, 60, 0.9);
  color: #c7d2e6;
  border: 1px solid rgba(50, 100, 180, 0.3);
}

.map-viewer.night-mode :deep(.ol-control button) {
  color: #c7d2e6;
  background: rgba(20, 40, 70, 0.8);
}

.map-viewer.night-mode :deep(.ol-control button:hover) {
  background: rgba(40, 80, 140, 0.9);
}
</style>
