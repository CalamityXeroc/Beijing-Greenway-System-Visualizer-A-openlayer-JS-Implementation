/**
 * 绿道详情页面通用工具函数
 */

// 绿道名称与 ID 的映射
export const greenwayNameMap = {
  1: '环二环城市绿道',
  2: '昌平42绿道',
  3: '温榆河',
  4: '亮马河绿道',
  5: '北运河绿道',
  6: '南沙绿道',
  7: '奥林匹克森林公园绿道',
  8: '常营半马绿道',
  9: '丽都商圈绿道',
  10: '营城建都绿道'
};

// 绿道颜色配置
export const greenwayColorMap = {
  '环二环城市绿道': '#2E7D32',
  '昌平42绿道': '#388E3C',
  '温榆河': '#1976D2',
  '亮马河绿道': '#0097A7',
  '北运河绿道': '#00897B',
  '南沙绿道': '#558B2F',
  '奥林匹克森林公园绿道': '#689F38',
  '常营半马绿道': '#7CB342',
  '丽都商圈绿道': '#AFB42B',
  '营城建都绿道': '#FBC02D'
};

/**
 * 从 API 加载绿道数据并更新界面
 * @param {string} greenwayName - 绿道名称
 * @param {object} updateCallback - 更新回调函数，接收绿道数据
 */
export async function loadGreenwayDataByName(greenwayName, updateCallback) {
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
    const response = await fetch(
      `${apiBase}/api/greenways?name=${encodeURIComponent(greenwayName)}`
    );
    
    if (!response.ok) {
      console.error(`[绿道数据加载] API 请求失败: ${response.status}`);
      return null;
    }
    
    const geojson = await response.json();
    console.log(`[绿道数据加载] ${greenwayName} 数据加载成功:`, geojson);
    
    // 从第一个要素中提取属性信息
    if (geojson.features && geojson.features.length > 0) {
      const feature = geojson.features[0];
      const props = feature.properties;
      
      // 构建标准化的绿道数据对象
      const greenwayData = {
        id: props.id,
        name: props.name,
        length: props.length,
        location: props.location,
        introduction: props.introduction,
        description: props.description,
        coverage_area: props.coverage_area,
        construction_area: props.construction_area,
        features: props.features,
        color: props.color || greenwayColorMap[props.name] || '#2196F3',
        geometry: feature.geometry,
        geojson: geojson  // 保留完整的 GeoJSON 以供地图使用
      };
      
      // 调用更新回调
      if (updateCallback) {
        updateCallback(greenwayData);
      }
      
      return greenwayData;
    } else {
      console.warn(`[绿道数据加载] 未找到名为"${greenwayName}"的绿道数据`);
      return null;
    }
  } catch (err) {
    console.error(`[绿道数据加载] 加载失败:`, err);
    return null;
  }
}

/**
 * 构建绿道界面显示的属性对象
 * @param {object} greenwayData - 绿道数据对象
 */
export function buildGreenwayInfo(greenwayData) {
  return {
    total_length: greenwayData.length ? `${greenwayData.length} km` : '暂无数据',
    coverage_area: greenwayData.coverage_area || '暂无数据',
    construction_area: greenwayData.construction_area || '暂无数据',
    features: greenwayData.features || '暂无数据',
    description: greenwayData.introduction || greenwayData.description || '暂无简介',
    color: greenwayData.color
  };
}

/**
 * 为详情页面构建地图图层配置
 * @param {object} geojson - GeoJSON 对象
 * @param {string} layerId - 图层 ID
 */
export function buildMapLayerConfig(geojson, layerId = 'greenway-layer') {
  return {
    id: layerId,
    type: 'geojson',
    data: geojson,
    visible: true,
    fitExtent: true,
    style: {
      lineColor: '#2196F3',
      lineWidth: 4
    }
  };
}
