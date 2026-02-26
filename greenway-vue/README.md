# Frontend - Vue 3 + OpenLayers

![Vue](https://img.shields.io/badge/Vue-3.4.0-brightgreen.svg)
![OpenLayers](https://img.shields.io/badge/OpenLayers-8.2.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-blueviolet.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

English | [中文](./README_zh-CN.md)

A modern, interactive WebGIS platform for exploring Beijing's extensive greenway network. Built with **Vue 3 + OpenLayers + Vite**, offering an intuitive interface to discover urban green corridors, ecological spaces, and recreational paths.

## ✨ Key Features

### 🗺️ Interactive Mapping
- **Full-Screen Map Experience**: High-performance OpenLayers rendering with smooth interactions
- **Multi-Layer Visualization**: Toggle between administrative boundaries and greenway routes
- **Smart Layer Management**: Dynamic control over map layers with intuitive UI
- **Responsive Design**: Optimized for both desktop and mobile devices

### 🛠️ Advanced GIS Tools
- **Drawing Tools**: Create points, lines, and polygons directly on the map
- **Measurement Tools**: Accurately measure distances (m/km) and areas (m²/km²)
- **Custom Layer Upload**: Import your own GeoJSON data for analysis
- **Interactive Popups**: Click features to view detailed information

### 🌈 Enhanced User Experience
- **Collapsible Weather Widget**: Real-time weather information
- **Smooth Animations**: Polished transitions and hover effects
- **Information Cards**: Greenway statistics and highlights

### 🌄 360° Panoramic Views
- **Baidu Street View Integration**: Immersive panoramic imagery
- **Multiple Viewpoints**: Scenic spots along the route

### 🎯 10 Complete Greenway Routes
- **Wenyu River (温榆河)**: 108km waterfront ecological corridor
- **Ring No.2 (环二环)**: 87km urban greenway
- **Liangma River (亮马河)**: 8km commercial district greenway
- **Changying Half-Marathon (常营半马)**: Sports and fitness route
- **Changping 42 (昌平42)**: Suburban ecological greenway
- **Lidu Commercial (丽都商圈)**: Urban commercial district
- **Beiyunhe Canal (北运河)**: Historic canal greenway
- **Nansha (南沙)**: Waterfront ecological greenway
- **Olympic Forest Park (奥森)**: Olympic legacy park route
- **Yingcheng Historic (营城建都)**: Historical cultural heritage route

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher

### Frontend Setup (5 minutes)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser: http://localhost:5173
```

### Build for Production

```bash
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```env
VITE_AMAP_KEY=your_amap_api_key
VITE_API_BASE_URL=http://localhost:3001
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
greenway-vue/
├── src/
│   ├── views/
│   │   ├── GreenwayOverview.vue    # Main map page
│   │   └── *Detail.vue             # 10 greenway detail pages
│   ├── components/
│   │   ├── MapComponent.vue        # OpenLayers map
│   │   ├── WeatherWidget.vue       # Weather display
│   │   └── ...
│   ├── utils/
│   │   └── mapUtils.js            # Helper functions
│   ├── assets/                    # Images, styles
│   ├── App.vue                    # Root component
│   └── main.js                    # Entry point
├── public/                        # Static assets
├── index.html
├── vite.config.js
└── package.json
```

## Connecting to Backend

When running the complete system with the backend:

1. Ensure backend is running on port 3001
2. Set `VITE_API_BASE_URL=http://localhost:3001` in `.env.local`
3. Frontend will fetch data from backend API

## Troubleshooting

### Port 5173 already in use?
```bash
npm run dev -- --port 5174
```

### Build fails?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API calls failing?
- Check if backend is running on port 3001
- Verify CORS settings on backend
- Check browser console for errors

## License

MIT
npm run db:import  # Import data
npm run dev        # Start backend (port 3001)
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
