# Beijing Greenway System Visualization Platform

![Vue](https://img.shields.io/badge/Vue-3.4.0-brightgreen.svg)
![OpenLayers](https://img.shields.io/badge/OpenLayers-8.2.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-blueviolet.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Early%20Development-yellow.svg)

A modern, interactive WebGIS platform for exploring Beijing's extensive greenway network. Built with **Vue 3 + OpenLayers + Vite**, offering an intuitive interface to discover urban green corridors, ecological spaces, and recreational paths.

[中文文档](./README_zh-CN.md)

## 📢 Project Status

> ⚠️ **This project is currently in early development stage.**

### Current Implementation
- ✅ **10 Complete Greenway Routes**: All major Beijing greenways with detailed pages
  - Wenyu River (108km), Ring No.2 (87km), Liangma River (8km)
  - Changying Half-Marathon, Changping 42, Lidu Commercial District
  - Beiyunhe Canal, Nansha, Olympic Forest Park, Yingcheng Historic Route
- ✅ **Advanced Interactive Features**: Layer controls, drawing tools, measurements
- ✅ **Performance Optimizations**: Smooth interactions, efficient rendering
- ✅ **Enhanced UI/UX**: Collapsible toolbar, responsive design, improved accessibility
- ✅ **Full GIS Toolkit**: Drawing, measuring, custom layer upload
- ✅ **360° Panoramic Views**: Integrated Baidu street view for immersive exploration
- ✅ **Real-time Weather**: Draggable, collapsible weather widget

### Planned Expansions
- 🚧 **Enhanced Analytics**: Advanced spatial analysis and statistics dashboard
- 🚧 **User Features**: Personalized routes, favorites, and social sharing
- 🚧 **Mobile Optimization**: Native mobile app experience

### 🔒 About Open Source

This is a **partial open-source project**. The following content is currently not publicly available:

- **Additional Greenway Data**: Other Beijing greenway datasets (to be released after academic publication)
- **Core Algorithms**: Advanced spatial analysis and optimization algorithms (for competition and research purposes)
- **Complete Backend**: Full backend implementation and API services

**Reason for Partial Release**: This project is being developed for academic competitions and research publications. To maintain research integrity and competitive advantage, certain core components will be released after:
- Competition results are announced
- Research papers are published
- Academic requirements are fulfilled

**Expected Full Release**: We plan to fully open-source all components by mid-2026, including complete datasets, algorithms, and backend services.

**We welcome community feedback and suggestions!** Feel free to open issues or discussions to help shape the future of this project. For academic collaboration or access to complete code, please contact via email.

## ✨ Key Features

### 🗺️ Interactive Mapping
- **Full-Screen Map Experience**: High-performance OpenLayers rendering with smooth interactions
- **Multi-Layer Visualization**: Toggle between administrative boundaries, greenways, and ecological elements
- **Smart Layer Management**: Dynamic control over map layers with intuitive UI
- **Responsive Design**: Optimized for both desktop and mobile devices

### 🛠️ Advanced GIS Tools
- **Drawing Tools**: Create points, lines, and polygons directly on the map
- **Measurement Tools**: Accurately measure distances (m/km) and areas (m²/km²)
- **Custom Layer Upload**: Import your own GeoJSON data for analysis
- **Interactive Popups**: Click features to view detailed information with hover effects
- **Smart Layer Filtering**: Toggle base layers independently (Beijing boundary, area)
- **Collapsible Toolbar**: Space-saving, organized tool interface
- **Performance Optimized**: Smooth interaction during zooming and panning

### 🌈 Enhanced User Experience
- **Transparent Header**: Modern floating title overlay on the map
- **Collapsible Weather Widget**: Draggable, foldable real-time weather information
- **Smooth Animations**: Polished transitions and hover effects throughout
- **Information Cards**: Discover greenway statistics, features, and usage guides

### 🌄 360° Panoramic Views
- **Baidu Street View Integration**: Explore greenways through immersive panoramic imagery
- **Multiple Viewpoints**: Switch between different scenic spots along the route
- **Interactive Navigation**: Click to explore and navigate through panoramic scenes

### 🎯 Greenway Detail Pages
- **10 Complete Routes**: Full detail pages for all major Beijing greenways
  - **Wenyu River (温榆河)**: 108km waterfront ecological corridor
  - **Ring No.2 (环二环)**: 87km urban greenway circling the second ring road
  - **Liangma River (亮马河)**: 8km international commercial district greenway
  - **Changying Half-Marathon (常营半马)**: Urban sports and fitness greenway
  - **Changping 42 (昌平42)**: Suburban ecological greenway
  - **Lidu Commercial (丽都商圈)**: Urban commercial district greenway
  - **Beiyunhe Canal (北运河)**: Historic canal greenway
  - **Nansha (南沙)**: Waterfront ecological greenway
  - **Olympic Forest Park (奥森)**: Olympic legacy park greenway
  - **Yingcheng Historic (营城建都)**: Historical cultural heritage route
- **Fixed View Maps**: Static maps in detail pages (no zoom/pan) for focused presentation
- **Rich Imagery**: Visual guides to greenway attractions and facilities
- **Comprehensive Info**: Coverage area, length, amenities, and highlights
- **Left-Right Layout**: Clean information sidebar with full-size map display

## 🚀 Quick Start

### Prerequisites
- **Node.js**: 16.x or higher
- **npm**: 7.x or higher

### Environment Setup

Create `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Add your AMap API key to `.env.local`:

```env
VITE_AMAP_KEY=your_amap_api_key_here
```

Get your AMap API Key: https://lbs.amap.com/api/web/guide/create-project/api-key

> **Note**: `.env.local` is git-ignored for security. Each user must configure their own API keys.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: 16.x or higher
- **npm**: 7.x or higher

### Frontend Only (5 minutes)

```bash
# Clone the repository
git clone https://github.com/CalamityXeroc/Beijing-Greenway-Visualizer-A-openlayer-JS-Implementation.git
cd greenway-vue

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser: http://localhost:5173
```

### Complete System (With Backend)

#### Step 1: Set up backend database
```bash
cd ../greenway-backend
cp .env.example .env.local
# Edit .env.local with your PostgreSQL info
npm install
npm run db:init    # Initialize database
npm run db:import  # Import data
npm run dev        # Start backend (port 3000)
```

#### Step 2: Start frontend (new terminal)
```bash
cd ../greenway-vue
npm install
npm run dev        # Start frontend (port 5173)
```

See [Backend Quick Start](../greenway-backend/QUICKSTART.md)

### Production Build

```bash
npm run build  # Output to dist/ directory
```

## 🛠️ Tech Stack

### Core Framework
- **Vue 3.4.0**: Progressive JavaScript framework with Composition API
- **Vue Router 4.2.5**: Official router for Vue.js
- **Vite 5.0.0**: Next-generation frontend build tool

### Mapping & GIS
- **OpenLayers 8.2.0**: High-performance web mapping library
  - Vector and raster layer support
  - Drawing and measurement interactions
  - GeoJSON format support
  - Custom styling and animations

### Additional Features
- **Axios 1.6.0**: HTTP request library
- **Baidu Maps API**: Integrated for panoramic street view experiences
- **Amap Weather API**: Real-time weather data integration

## 📁 Project Structure

```
greenway-vue/
├── public/
│   └── 数据/                    # GeoJSON spatial data
│       ├── 北京边界.geojson
│       └── 绿道/
├── src/
│   ├── components/              # Reusable components
│   │   ├── MapViewer.vue        # Core map component
│   │   ├── MapToolbar.vue       # GIS toolbar
│   │   ├── WeatherCard.vue      # Draggable weather widget
│   │   └── BaiduPanoramaViewer.vue  # 360° panorama viewer
│   ├── views/                   # Page components (11 total)
│   │   ├── GreenwayOverview.vue # Main interactive overview
│   │   ├── WenyuDetail.vue      # Wenyu River detail page
│   │   ├── HuanerhuanDetail.vue # Ring No.2 detail page
│   │   ├── LiangmaheDetail.vue  # Liangma River detail page
│   │   └── ...                  # 7 more greenway pages
│   ├── core/                    # Core functionality
│   │   ├── MapManager.js        # Map management
│   │   └── LayerManager.js      # Layer management
│   ├── utils/                   # Utility functions
│   ├── router/                  # Vue Router configuration
│   ├── App.vue                  # Root component
│   └── main.js                  # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Feature Highlights

### Map & Interaction Tools
- **Drawing Tools**: Create points, lines, and polygons on the map
- **Measurement Tools**: Calculate distances (m/km) and areas (m²/km²)
- **Layer Controls**: Dynamically show/hide map layers
- **360° Panoramic Views**: Integrated Baidu street view experience

### Greenway Detail Pages
- **Fixed Views**: Disabled zoom/pan for focused presentation
- **Two-Column Layout**: Left sidebar info, right fullscreen map
- **Real-time Weather**: Draggable, collapsible weather widget
- **Immersive Panoramas**: Multiple scenic viewpoints with street view

### Modern UI/UX
- **High Performance**: Smooth map rendering and animations
- **Mobile Responsive**: Optimized for desktop and mobile devices
- **Clean Design**: Transparent floating headers, clear information hierarchy

## 🌈 Development Configuration

### Environment Variables

Create `.env.local` file (git-ignored):
## 🌈 Weather Service

Weather data is powered by **Amap (高德地图) API**. Configure your API key in `.env.local`:

```env
VITE_AMAP_KEY=your_api_key_here
```

Real-time weather information is displayed in a draggable, collapsible widget on each greenway page.

## 🗺️ Data Sources

Geospatial data visualized on the platform includes:
- Beijing administrative boundaries
- Wenyu River Greenway route (108km)
- Ecological zones and parks
- Weather station locations

**Data Format**: GeoJSON (WGS84 / EPSG:4326)

## 🌐 Browser Support

- **Chrome/Edge** (Recommended): Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+

## 🤝 Contributing

We welcome contributions and feedback! As this project is in early development, your input is especially valuable.

### How to Contribute
- 💡 **Suggestions**: Open an issue to share ideas for new features or improvements
- 🐛 **Bug Reports**: Found a bug? Please report it with detailed steps to reproduce
- 📝 **Documentation**: Help improve our documentation and guides
- 🎨 **UI/UX Feedback**: Share your thoughts on design and user experience
- 🔧 **Code Contributions**: Submit pull requests for bug fixes or new features

### Pull Request Process
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request with a clear description of changes

**Note**: As we're in early development, please open an issue for discussion before working on major features.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Beijing Municipal Planning and Natural Resources Commission for greenway data
- OpenLayers community for excellent mapping library
- Vue.js team for the outstanding framework
- Baidu Maps for panoramic imagery services

## 📧 Contact

Project Link: [https://github.com/CalamityXeroc/Beijing-Greenway-Visualizer-A-openlayer-JS-Implementation](https://github.com/CalamityXeroc/Beijing-Greenway-Visualizer-A-openlayer-JS-Implementation)

**For Academic Collaboration**:
- 📬 Full code access for research purposes
- 🤝 Collaboration on greenway visualization projects
- 📊 Data sharing and joint research opportunities

Please open an issue or contact the maintainer for academic inquiries.

---

**Built with ❤️ to explore Beijing's green spaces**
