/**
 * 绿道颜色配置
 * 每条绿道都有独特的颜色标识
 */
export const greenwayColors = {
  '环二环城市绿道': {
    color: '#2E7D32',        // 深绿
    name: '环二环',
    description: '城市绿色脉络'
  },
  '昌平42绿道': {
    color: '#388E3C',        // 标准绿
    name: '昌平42',
    description: '北部生态带'
  },
  '温榆河': {
    color: '#1976D2',        // 蓝色（水系）
    name: '温榆河',
    description: '河流生态廊道'
  },
  '亮马河绿道': {
    color: '#0097A7',        // 青色
    name: '亮马河',
    description: '河滨运动带'
  },
  '北运河绿道': {
    color: '#00897B',        // 青绿
    name: '北运河',
    description: '运河文化带'
  },
  '南沙绿道': {
    color: '#558B2F',        // 橄榄绿
    name: '南沙',
    description: '南部示范带'
  },
  '奥林匹克森林公园绿道': {
    color: '#689F38',        // 黄绿
    name: '奥森',
    description: '公园环形带'
  },
  '常营半马绿道': {
    color: '#7CB342',        // 春绿
    name: '常营',
    description: '社区运动带'
  },
  '丽都商圈绿道': {
    color: '#AFB42B',        // 黄绿
    name: '丽都',
    description: '商业休闲带'
  },
  '营城建都绿道': {
    color: '#FBC02D',        // 琥珀
    name: '营城',
    description: '中轴文化带'
  }
}

/**
 * 根据绿道名称获取颜色
 */
export const getGreenwayColor = (name) => {
  const config = greenwayColors[name]
  return config?.color || '#2196F3'  // 默认颜色
}

/**
 * 获取所有绿道的颜色配置
 */
export const getAllGreenwayColors = () => {
  return Object.entries(greenwayColors).map(([name, config]) => ({
    name,
    ...config
  }))
}
