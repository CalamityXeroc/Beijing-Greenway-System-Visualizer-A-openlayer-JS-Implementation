/**
 * MapManager - 地图核心管理器
 * 参考 OLTB 架构设计，提供地图实例管理和基础操作
 */

import OLMap from 'ol/Map'
import View from 'ol/View'
import { fromLonLat, toLonLat } from 'ol/proj'
import { defaults as defaultControls } from 'ol/control'
import { defaults as defaultInteractions } from 'ol/interaction'

class MapManager {
  constructor() {
    // 使用下划线前缀避免属性名冲突
    this._mapInstance = null
    this._viewInstance = null
    this._layersMap = new Map()
    this._controlsMap = new Map()
    this._interactionsMap = new Map()
  }

  init(target, options = {}) {
    const defaultOptions = {
      center: [116.5, 40],
      zoom: 10,
      minZoom: 3,
      maxZoom: 19,
      projection: 'EPSG:3857'
    }

    const config = { ...defaultOptions, ...options }

    this._viewInstance = new View({
      center: fromLonLat(config.center),
      zoom: config.zoom,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      projection: config.projection
    })

    this._mapInstance = new OLMap({
      target: target,
      view: this._viewInstance,
      controls: config.controls !== false ? defaultControls({
        zoom: config.interactive !== false,
        rotate: false,
        attribution: true
      }) : [],
      interactions: config.interactive !== false ? defaultInteractions({
        altShiftDragRotate: false,
        pinchRotate: false
      }) : [],
      // 性能优化选项
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true
    })

    // 延迟调用updateSize以确保容器已渲染
    setTimeout(() => {
      if (this._mapInstance) {
        this._mapInstance.updateSize()
      }
    }, 100)

    console.log('[MapManager] 地图初始化完成')
    return this._mapInstance
  }

  getMap() {
    return this._mapInstance
  }

  getView() {
    return this._viewInstance
  }

  addLayer(id, layer) {
    if (this._layersMap.has(id)) {
      console.warn(`[MapManager] 图层 ${id} 已存在`)
      return
    }
    this._layersMap.set(id, layer)
    this._mapInstance.addLayer(layer)
    console.log(`[MapManager] 添加图层: ${id}`)
  }

  removeLayer(id) {
    const layer = this._layersMap.get(id)
    if (layer) {
      this._mapInstance.removeLayer(layer)
      this._layersMap.delete(id)
      console.log(`[MapManager] 移除图层: ${id}`)
    }
  }

  setLayerVisibility(id, visible) {
    const layer = this._layersMap.get(id)
    if (layer) {
      layer.setVisible(visible)
    }
  }

  getLayer(id) {
    return this._layersMap.get(id)
  }

  getCenter() {
    const center = this._viewInstance.getCenter()
    return toLonLat(center)
  }

  setCenter(lonLat, zoom) {
    this._viewInstance.setCenter(fromLonLat(lonLat))
    if (zoom !== undefined) {
      this._viewInstance.setZoom(zoom)
    }
  }

  fitExtent(extent, options = {}) {
    const defaultOptions = {
      padding: [50, 50, 50, 50],
      duration: 500,
      maxZoom: 16
    }
    const config = { ...defaultOptions, ...options }
    this._viewInstance.fit(extent, config)
  }

  on(type, handler) {
    return this._mapInstance.on(type, handler)
  }

  un(type, handler) {
    this._mapInstance.un(type, handler)
  }

  destroy() {
    if (this._mapInstance) {
      this._mapInstance.setTarget(null)
      this._layersMap.clear()
      this._controlsMap.clear()
      this._interactionsMap.clear()
      this._mapInstance = null
      this._viewInstance = null
      console.log('[MapManager] 地图已销毁')
    }
  }
}

let instance = null

export function getMapManager() {
  if (!instance) {
    instance = new MapManager()
    console.log('[MapManager] 创建新的单例实例')
  }
  return instance
}

export default MapManager
