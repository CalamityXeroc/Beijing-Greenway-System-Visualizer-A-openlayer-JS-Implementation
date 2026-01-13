# 北京绿道系统可视化平台

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.4.0-brightgreen.svg)
![Node.js](https://img.shields.io/badge/Node.js-16+-brightgreen.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)
![Status](https://img.shields.io/badge/状态-开发中-yellow.svg)

[English Documentation](./README.md)

一个现代化的 Web GIS 地图可视化平台，用于探索北京的绿道网络。
**前端** (Vue 3 + OpenLayers + Vite) | **后端** (Node.js + Express + PostgreSQL)

一个现代化的 Web GIS 地图平台，用于探索、分析和交互北京的绿道网络系统。

## 📢 项目特点

- ✅ **10条完整绿道**：温榆河（108km）、环二环（87km）、亮马河等
- ✅ **完整的前后端**：Vue 3 前端 + Node.js 后端 + PostgreSQL 数据库
- ✅ **丰富的交互功能**：绘制、测量、图层控制、360° 全景
- ✅ **实时数据**：天气信息、绿道统计、设施位置
- ✅ **生产级别**：良好的性能、安全的 API、完整的文档

## ✨ 核心特性

### 🗺️ 交互式地图
- **全屏地图体验**：基于 OpenLayers 高性能地图
- **多图层管理**：灵活控制行政边界、绿道路线、生态要素
- **10 条绿道详情页**：每条绿道都有详细信息和 360° 全景
- **响应式设计**：完美适配桌面端和移动设备

### 🛠️ GIS 工具集
- **绘制工具**：点、线、多边形绘制
- **测量工具**：精确计算距离和面积
- **图层管理**：上传自定义 GeoJSON 数据
- **信息弹窗**：点击查看详细信息

### 🌄 沉浸式体验
- **360° 全景街景**：百度街景集成
- **实时天气**：可拖动、可折叠的天气组件
- **流畅动画**：精致的过渡和交互效果
- **清晰布局**：信息侧边栏 + 全尺寸地图

## 🚀 快速开始

### 环境要求
- **Node.js**：16+ 版本
- **PostgreSQL**：13+ 版本（需要 PostGIS 扩展）
- **npm** 或 **yarn**

### 前端启动

```bash
cd greenway-vue
npm install
npm run dev
# 访问 http://localhost:5173
```

### 后端启动

```bash
cd greenway-backend
npm install
npm run db:init        # 初始化数据库
npm run db:import      # 导入 GeoJSON 数据
npm run dev            # 启动后端服务
# 访问 http://localhost:3000
```

### 一键启动（Windows）
项目根目录下有 `启动完整系统.bat`，双击即可启动前后端。

## 🛠️ 技术栈

### 前端
- **Vue 3.4** + **Composition API**
- **OpenLayers 8.2** - Web GIS 地图库
- **Vite 5.0** - 现代化构建工具
- **Axios** - HTTP 请求库
- **百度地图 API** - 街景服务
- **高德天气 API** - 实时天气

### 后端
- **Node.js** + **Express** - Web 框架
- **PostgreSQL 13+** - 关系数据库
- **PostGIS** - 地理空间扩展
- **GeoJSON** - 地理数据格式

## 📁 项目结构

```
greenway-vue/              # 前端项目
├── src/
│   ├── views/            # 10条绿道详情页面
│   ├── components/       # 地图、工具、天气等组件
│   ├── core/             # MapManager、LayerManager
│   ├── router/           # 路由配置
│   └── assets/           # 静态资源

greenway-backend/          # 后端项目
├── src/
│   ├── index.js          # Express 应用
│   └── db.js             # 数据库配置
├── scripts/              # 数据导入脚本
└── sql/                  # 数据库初始化脚本

public/                    # GeoJSON 地理数据
└── 数据/
    ├── 北京边界.geojson
    └── 绿道/
        └── *.geojson
```

## 🎨 功能亮点

### 地图工具
- **点绘制**：标记感兴趣的位置
- **线绘制**：追踪路线和路径
- **多边形绘制**：定义区域和边界
- **距离测量**：计算路径长度（米/公里）
- **面积测量**：计算多边形面积（平方米/平方公里）
- **图层切换**：显示/隐藏基础图层和叠加图层

### 交互元素
- **悬停提示**：鼠标悬停显示绿道信息
- **点击弹窗**：带动画的详细信息面板
- **可拖动窗口**：在地图上自由移动信息面板
- **可折叠天气**：最小化天气组件，节省屏幕空间

### 全景体验
- **虚拟漫游**：在多个观景点之间导航
- **街景视图**：真实的百度街景影像
- **交互标记**：点击在不同位置之间跳转
- **全屏模式**：沉浸式全景观看体验

## 🗺️ 数据来源

平台可视化的地理空间数据包括：
- 北京市行政边界
- 温榆河绿道路线（108 公里）
- 生态区域和公园
- 气象站位置

**数据格式**：GeoJSON (WGS84 / EPSG:4326)

## 🎯 绿道概览

| 名称 | 长度 | 描述 |
|------|------|------|
| 温榆河 | 108 km | 滨水生态廊道，跨越四区 |
| 环二环 | 87 km | 环绕二环路的城市绿道 |
| 亮马河 | 8 km | 国际商务区绿道 |
| 常营半马 | - | 城市运动健身绿道 |
| 昌平42 | - | 郊区生态绿道 |
| 丽都商圈 | - | 城市商业区绿道 |
| 北运河 | - | 历史运河绿道 |
| 南沙 | - | 滨水生态绿道 |
| 奥森 | - | 奥运遗产公园绿道 |
| 营城建都 | - | 历史文化遗产路线 |

## 🌐 浏览器支持

- Chrome/Edge 90+（推荐）
- Firefox 88+
- Safari 14+

## 🤝 贡献与反馈

欢迎提交 Issue 和 Pull Request！

- 💡 **功能建议**：分享您的创意和改进想法
- 🐛 **问题反馈**：报告 Bug 并描述重现步骤
- 🔧 **代码贡献**：修复问题或添加新功能

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 📧 联系方式

GitHub: [Beijing-Greenway-System-Visualizer](https://github.com/CalamityXeroc/Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation)

---

**用 ❤️ 为城市绿道而开发**
