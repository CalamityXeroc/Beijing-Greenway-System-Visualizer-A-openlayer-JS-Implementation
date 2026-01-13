# Beijing Greenway System Visualization Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.4.0-brightgreen.svg)
![Node.js](https://img.shields.io/badge/Node.js-16+-brightgreen.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)
![Status](https://img.shields.io/badge/status-Development-yellow.svg)

[中文文档](./README_zh-CN.md)

A modern WebGIS platform for exploring Beijing's greenway network.
**Frontend** (Vue 3 + OpenLayers) | **Backend** (Node.js + Express + PostgreSQL)

## 📢 Project Overview

- ✅ **10 Greenways**: Wenyu River (108km), Ring No.2 (87km), and more
- ✅ **Full Stack**: Vue 3 frontend + Node.js backend + PostgreSQL database
- ✅ **Rich Features**: Drawing, measurement, layer control, 360° panorama
- ✅ **Real-time Data**: Weather, greenway statistics, facilities
- ✅ **Production Ready**: Good performance, secure APIs, full documentation

## ✨ Features

### 🗺️ Interactive Map
- High-performance OpenLayers rendering
- Multi-layer visualization with layer controls
- 10 complete greenway detail pages
- Responsive design for desktop and mobile

### 🛠️ GIS Tools
- Draw points, lines, polygons
- Measure distances and areas
- Upload custom GeoJSON data
- Click to view detailed information

### 🌄 Immersive Experience
- 360° Baidu street panorama view
- Real-time weather widget (draggable, collapsible)
- Smooth animations and interactions
- Clean left-right layout design

## 🚀 Quick Start

### Requirements
- **Node.js**: 16+ version
- **PostgreSQL**: 13+ version (with PostGIS extension)
- **npm** or **yarn**

### Frontend Setup

```bash
cd greenway-vue
npm install
npm run dev
# Visit http://localhost:5173
```

### Backend Setup

```bash
cd greenway-backend
npm install
npm run db:init        # Initialize database
npm run db:import      # Import GeoJSON data
npm run dev            # Start backend service
# Visit http://localhost:3000
```

### One-click Startup (Windows)
Double-click `启动完整系统.bat` in the project root to start both frontend and backend.

## 🛠️ Tech Stack

### Frontend
- **Vue 3.4** + **Composition API**
- **OpenLayers 8.2** - Web GIS library
- **Vite 5.0** - Modern build tool
- **Axios** - HTTP client
- **Baidu Maps API** - Street panorama
- **Weather API** - Real-time weather

### Backend
- **Node.js** + **Express** - Web framework
- **PostgreSQL 13+** - Relational database
- **PostGIS** - Geospatial extension
- **GeoJSON** - Geospatial data format

## 📁 Project Structure

```
greenway-vue/
├── public/
│   └── 数据/              # GeoJSON spatial data
│       ├── 北京边界.geojson
│       ├── 北京面.geojson
│       └── 绿道/
│           └── 温榆河绿道/
├── src/
│   ├── components/        # Reusable Vue components
│   │   ├── MapViewer.vue         # Core map component with performance optimizations
│   │   ├── MapToolbar.vue        # Collapsible GIS toolset with layer controls
│   │   ├── WeatherCard.vue       # Draggable, collapsible weather widget
│   │   ├── BaiduPanoramaViewer.vue  # 360° panorama viewer
│   │   ├── PanoramaViewer.vue    # Alternative panorama component
│   │   └── FPSMonitor.vue        # Performance monitoring component
│   ├── views/             # Page components (11 total)
│   │   ├── GreenwayOverview.vue  # Main interactive overview page
│   │   ├── WenyuDetail.vue       # Wenyu River detail page
│   │   ├── HuanerhuanDetail.vue  # Ring No.2 detail page
│   │   ├── LiangmaheDetail.vue   # Liangma River detail page
│   │   ├── ChangyingDetail.vue   # Changying Half-Marathon detail page
│   │   ├── Changping42Detail.vue # Changping 42 detail page
│   │   ├── LiduDetail.vue        # Lidu Commercial detail page
│   │   ├── BeiyunheDetail.vue    # Beiyunhe Canal detail page
│   │   ├── NanshaDetail.vue      # Nansha detail page
│   │   ├── AosenDetail.vue       # Olympic Forest Park detail page
│   │   └── YingchengDetail.vue   # Yingcheng Historic detail page
│   ├── core/              # Core functionality
│   │   ├── MapManager.js         # Map management with interaction controls
│   │   └── LayerManager.js       # Optimized layer rendering logic
│   ├── utils/             # Utility functions
│   │   └── performance.js        # Performance optimization utilities
│   ├── router/            # Vue Router configuration
│   ├── App.vue            # Root component
│   └── main.js            # Application entry
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Feature Highlights

### Map Tools
- **Point Drawing**: Mark locations of interest
- **Line Drawing**: Trace routes and paths
- **Polygon Drawing**: Define areas and boundaries
- **Distance Measurement**: Calculate path lengths (meters/kilometers)
- **Area Measurement**: Calculate polygon areas (square meters/kilometers)
- **Layer Toggle**: Show/hide base layers and overlays

### Interactive Elements
- **Hover Tooltips**: Display greenway information on mouse hover
- **Click Popups**: Detailed information panels with animations
- **Draggable Windows**: Move information panels freely around the map
- **Collapsible Weather**: Minimize weather widget to save screen space

### Panoramic Experience
- **Virtual Tour**: Navigate through multiple viewpoints
- **Street-Level Views**: Real Baidu street imagery
- **Interactive Markers**: Click to jump between locations
- **Fullscreen Mode**: Immersive panoramic viewing

## � Project Structure

```
greenway-vue/              # Frontend project
├── src/
│   ├── views/            # 10 greenway detail pages
│   ├── components/       # Map, tools, weather components
│   ├── core/             # MapManager, LayerManager
│   ├── router/           # Route configuration
│   └── assets/           # Static assets

greenway-backend/          # Backend project
├── src/
│   ├── index.js          # Express app
│   └── db.js             # Database config
├── scripts/              # Data import scripts
└── sql/                  # Database init scripts

public/                    # GeoJSON geospatial data
└── 数据/
    ├── 北京边界.geojson
    └── 绿道/
        └── *.geojson
```

## 🎯 Greenways Overview

| Name | Length | Description |
|------|--------|-------------|
| Wenyu River (温榆河) | 108 km | Waterfront ecological corridor |
| Ring No.2 (环二环) | 87 km | Urban greenway around ring road |
| Liangma River (亮马河) | 8 km | Commercial district greenway |
| Others | - | Changying, Changping, Lidu, Beiyunhe, Nansha, Aosen, Yingcheng |

## 🌐 Browser Support

- Chrome/Edge 90+ (recommended)
- Firefox 88+
- Safari 14+

## 🤝 Contributing

Welcome to submit issues and pull requests!

- 💡 **Feature Suggestions**: Share your ideas and improvements
- 🐛 **Bug Reports**: Report issues with reproduction steps
- 🔧 **Code Contributions**: Fix bugs or add new features

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 📧 Contact

GitHub: [Beijing-Greenway-System-Visualizer](https://github.com/CalamityXeroc/Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation)

---

**Built with ❤️ for urban greenways**

Project Link: [https://github.com/CalamityXeroc/Beijing-Greenway-Visualizer-A-openlayer-JS-Implementation](https://github.com/CalamityXeroc/Beijing-Greenway-Visualizer-A-openlayer-JS-Implementation)

**For Academic Collaboration**:
- 📬 Full code access for research purposes
- 🤝 Collaboration on greenway visualization projects
- 📊 Data sharing and joint research opportunities

Please open an issue or contact the maintainer for academic inquiries.

---

**Built with ❤️ to explore Beijing's green spaces**
