/**
 * LayerManager - 图层管理器
 * 参考 OLTB 的图层管理模式，统一管理矢量图层和瓦片图层
 */

import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorImageLayer from 'ol/layer/VectorImage'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Stroke, Fill, Circle } from 'ol/style'
import { markRaw } from 'vue'

class LayerManager {
  constructor() {
    // 使用 Object.defineProperty 防止这些属性被响应式包装
    Object.defineProperty(this, 'baseLayers', { value: new Map(), writable: false, enumerable: false })
    Object.defineProperty(this, 'overlayLayers', { value: new Map(), writable: false, enumerable: false })
  }

  /**
   * 创建高德底图图层
   * @param {string} style - 地图样式 (7=街道图, 8=文字标注)
   */
  createGaodeLayer(style = 8) {
    return new TileLayer({
      source: new XYZ({
        url: `https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=${style}&x={x}&y={y}&z={z}`,
        crossOrigin: 'anonymous'
      }),
      zIndex: 0
    })
  }

  /**
   * 创建矢量图层（从 GeoJSON）- 性能优化版本
   * @param {Object} options - 配置选项
   */
  createVectorLayerFromGeoJSON(options = {}) {
    const {
      url,
      data,
      style = this.getDefaultStyle(),
      zIndex = 10,
      visible = true,
      renderAsImage = true,
      interactive = true // 默认为可交互
    } = options

    const source = new VectorSource({
      url: url,
      format: new GeoJSON({
        featureProjection: 'EPSG:3857'
      }),
      features: data ? new GeoJSON().readFeatures(data, {
        featureProjection: 'EPSG:3857'
      }) : undefined,
      // 性能优化：使用RTree空间索引加速要素查询
      useSpatialIndex: true
    })

    const LayerClass = renderAsImage ? VectorImageLayer : VectorLayer

    const commonOptions = {
      source: source,
      style: style,
      zIndex: zIndex,
      visible: visible,
      declutter: false,
      // 将 interactive 属性传递给图层对象，供 MapViewer 过滤使用
      properties: {
        interactive: options.interactive !== false
      }
    }

    const layer = new LayerClass(
      renderAsImage
        ? {
            ...commonOptions,
            imageRatio: 1, // 降低 imageRatio 减少内存占用
          }
        : {
            ...commonOptions,
            renderMode: 'vector',
            updateWhileAnimating: false, // 禁用动画时更新，提高性能
            updateWhileInteracting: false, // 禁用交互时更新，提高性能
            renderBuffer: 50 // 减少渲染缓冲区
          }
    )

    return layer
  }

  /**
   * 创建矢量图层（从要素数组）
   * @param {Array} features - 要素数组
   * @param {Object} options - 配置选项
   */
  createVectorLayerFromFeatures(features, options = {}) {
    const {
      style = this.getDefaultStyle(),
      zIndex = 10,
      visible = true
    } = options

    const source = new VectorSource({
      features: features
    })

    return new VectorLayer({
      source: source,
      style: style,
      zIndex: zIndex,
      visible: visible
    })
  }

  /**
   * 获取默认样式
   * @param {Object} config - 样式配置
   */
  getDefaultStyle(config = {}) {
    const {
      strokeColor = '#2196F3',
      strokeWidth = 3,
      fillColor = 'rgba(33, 150, 243, 0.1)',
      pointRadius = 6,
      pointFillColor = '#2196F3'
    } = config

    return new Style({
      stroke: new Stroke({
        color: strokeColor,
        width: strokeWidth
      }),
      fill: new Fill({
        color: fillColor
      }),
      image: new Circle({
        radius: pointRadius,
        fill: new Fill({
          color: pointFillColor
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 2
        })
      })
    })
  }

  /**
   * 创建动态样式函数（带缓存优化）
   * @param {Object} config - 样式配置
   */
  createStyleFunction(config = {}) {
    // 为静态配置创建缓存样式
    const staticStyle = this.getDefaultStyle({
      strokeColor: config.lineColor || '#2196F3',
      strokeWidth: config.lineWidth || 3,
      fillColor: config.fillColor || 'rgba(33, 150, 243, 0.1)',
      pointRadius: config.pointRadius || 6,
      pointFillColor: config.pointColor || '#2196F3'
    })
    
    return (feature) => {
      const properties = feature.getProperties()
      
      // 检查 feature 是否有颜色属性（来自后端绿道数据）
      if (properties.color) {
        const geometry = feature.getGeometry()
        const geometryType = geometry.getType()
        
        let style = {}
        
        if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
          style = {
            strokeColor: properties.color,
            strokeWidth: config.lineWidth || 3
          }
        } else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
          style = {
            strokeColor: properties.color,
            strokeWidth: config.strokeWidth || 2,
            fillColor: `${properties.color}33`  // 使用 color 配置填充色
          }
        } else if (geometryType === 'Point' || geometryType === 'MultiPoint') {
          style = {
            pointRadius: config.pointRadius || 6,
            pointFillColor: properties.color
          }
        }
        
        return this.getDefaultStyle(style)
      }
      
      // 如果feature没有自定义样式属性，直接返回缓存的静态样式
      if (!properties.width) {
        return staticStyle
      }
      
      // 只有feature有自定义属性时才动态创建样式
      const geometry = feature.getGeometry()
      const geometryType = geometry.getType()

      let style = {}

      if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
        style = {
          strokeColor: config.lineColor || properties.color || '#2196F3',
          strokeWidth: config.lineWidth || properties.width || 3
        }
      } else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
        style = {
          strokeColor: config.strokeColor || '#2196F3',
          strokeWidth: config.strokeWidth || 2,
          fillColor: config.fillColor || 'rgba(33, 150, 243, 0.1)'
        }
      } else if (geometryType === 'Point' || geometryType === 'MultiPoint') {
        style = {
          pointRadius: config.pointRadius || 6,
          pointFillColor: config.pointColor || '#2196F3'
        }
      }

      return this.getDefaultStyle(style)
    }
  }

  /**
   * 创建高亮样式
   * @param {string} color - 高亮颜色
   */
  getHighlightStyle(color = '#FF9800') {
    return new Style({
      stroke: new Stroke({
        color: color,
        width: 5
      }),
      fill: new Fill({
        color: `${color}33` // 添加透明度
      }),
      image: new Circle({
        radius: 8,
        fill: new Fill({
          color: color
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 3
        })
      })
    })
  }

  /**
   * 从 URL 加载 GeoJSON 数据
   * @param {string} url - GeoJSON 文件 URL
   * @param {Function} callback - 加载完成回调
   */
  async loadGeoJSON(url) {
    try {
      const response = await fetch(url)
      const geojson = await response.json()
      return new GeoJSON().readFeatures(geojson, {
        featureProjection: 'EPSG:3857'
      })
    } catch (error) {
      console.error('[LayerManager] 加载 GeoJSON 失败:', error)
      throw error
    }
  }
}

// 单例模式
let instance = null

export function getLayerManager() {
  if (!instance) {
    // 使用 markRaw 防止整个 LayerManager 实例被 Vue 响应式包装
    instance = markRaw(new LayerManager())
  }
  return instance
}

export default LayerManager
