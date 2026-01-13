# Beijing Greenway System Visualization Platform

A modern WebGIS platform for exploring Beijing's greenway network using Vue 3 + OpenLayers + PostgreSQL/PostGIS.

**[中文文档](./README_zh-CN.md)**

## 🎯 Project Overview

- ✅ **10 Greenways**: Interactive visualization of Beijing's main greenway routes
- ✅ **Full Stack**: Vue 3 frontend + Node.js/Express backend + PostgreSQL database
- ✅ **Rich Features**: Map visualization, weather integration, panorama view
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Production Ready**: Optimized performance, secure APIs, complete documentation

## ✨ Key Features

### 🗺️ Interactive Map System
- **High-performance OpenLayers** rendering with multiple layers
- **10 Complete Detail Pages** for each greenway with route visualization
- **Layer Control** for toggling visibility of different greenway routes
- **Zoom & Pan** with smooth animations
- **Responsive Layout** adapting to screen size

### 📍 Greenway Information
- Route geometry with MultiLineString format (preserving separate segments)
- Total length, coverage area, and construction area data
- Greenway features and descriptions
- Scenic viewpoints with coordinates

### 🌡️ Integrated Services
- **Real-time Weather Widget** showing current conditions
- **Baidu Panorama Integration** for 360° street view
- **Weather API** using public data sources
- **Draggable/Collapsible** widgets for better UX

## 🚀 Quick Start Guide

### Prerequisites
```
Node.js >= 18.0
PostgreSQL 18 + PostGIS 3.6
npm or yarn
```

### One-Command Startup

**Windows:**
```bash
.\启动完整系统.bat
```

**Linux/macOS:**
```bash
bash 启动完整系统.bat
```

This starts both backend (port 3000) and frontend (port 5174).

### Manual Startup

**Backend:**
```bash
cd greenway-backend
npm install
npm start
```

**Frontend:**
```bash
cd greenway-vue
npm install
npm run dev
```

**Access:** http://localhost:5174

## 📁 Project Structure

```
tryyyyyy/
├── greenway-backend/              # Express backend service
│   ├── src/
│   │   ├── index.js              # Main server
│   │   └── db.js                 # PostgreSQL connection
│   ├── scripts/
│   │   ├── init-db.js            # Initialize database schema
│   │   ├── import-geometry.js    # Import GeoJSON geometries
│   │   ├── sync-frontend-data.js # Sync frontend data
│   │   └── check-env.js          # Check environment setup
│   └── package.json
│
├── greenway-vue/                  # Vue 3 frontend application
│   ├── src/
│   │   ├── views/                # Page components
│   │   │   ├── GreenwayOverview.vue  # Main map page
│   │   │   └── *Detail.vue           # 10 greenway detail pages
│   │   ├── components/           # Reusable components
│   │   ├── utils/               # Helper functions
│   │   └── config/              # Configuration files
│   ├── public/
│   │   └── 数据/绿道/           # GeoJSON geometry data
│   └── package.json
│
├── GETTING_STARTED.md           # Startup guide
└── README_zh-CN.md              # Chinese documentation
```

## 🔗 API Endpoints

### Get Greenway Data
```http
GET /api/greenways?name=温榆河
```

**Response:** GeoJSON FeatureCollection with geometry and properties

### Example
```bash
curl "http://localhost:3000/api/greenways?name=南沙绿道"
```

## 🗄️ Database Schema

### Main Table: greenways
```sql
CREATE TABLE greenways (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  total_length DECIMAL(10, 2),
  coverage_area VARCHAR(255),
  construction_area DECIMAL(10, 2),
  features TEXT,
  description TEXT,
  geometry geometry(MultiLineString, 4326),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Key Features
- **MultiLineString Geometry**: Preserves separate line segments without false connections
- **PostGIS Support**: Advanced spatial queries and analysis
- **SRID 4326**: WGS84 standard coordinate system
- **ST_AsGeoJSON()**: Converts geometries to GeoJSON format

## 🎨 Design System

### Color Scheme
| Element | Color | Hex Code |
|---------|-------|----------|
| Main Map Greenways | Green | #4CAF50 |
| Detail Page Lines | Blue | #2196F3 |
| Border/Boundary | Dark Blue | #1565C0 |
| Background | Light Gray | #f5f5f5 |

### 10 Greenways in System
1. **温榆河绿道** - Wenyu River (108km)
2. **环二环城市绿道** - Ring Road No.2 (87km)
3. **亮马河绿道** - Liangma River (5.5km)
4. **常营半马绿道** - Changying Half Marathon (21km)
5. **昌平42绿道** - Changping No.42 (42km)
6. **丽都商圈绿道** - Lido Business Circle (6.8km)
7. **北运河绿道** - Bei Yunhe River (36km)
8. **南沙绿道** - Nansha (15km)
9. **奥林匹克森林公园绿道** - Olympic Forest Park (23km)
10. **营城建都绿道** - Yingcheng (42km)

## 🔧 Configuration Files

### Backend Environment (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenway
DB_USER=postgres
DB_PASSWORD=123456
PORT=3000
```

### Frontend Configuration (vite.config.js)
- Build output: `dist/`
- API proxy: `/api` → `http://localhost:3000/api`
- Hot reload enabled for development
- Production optimization enabled

## 📚 Technical Stack

### Frontend
- **Vue 3** (Composition API)
- **OpenLayers** (7.x) - GIS mapping library
- **Vite** - Modern build tool
- **Baidu Maps API** - Panorama integration

### Backend
- **Node.js** (v20+)
- **Express.js** - Web framework
- **PostgreSQL** (18) - Database
- **PostGIS** (3.6) - Spatial extension

### Database
- **PostgreSQL 18** with PostGIS 3.6.1
- **MultiLineString** geometry type
- **ST_AsGeoJSON()** for serialization
- **Dynamic queries** for flexible data access

## 🛠️ Utility Scripts

Located in `greenway-backend/scripts/`:

| Script | Purpose |
|--------|---------|
| `init-db.js` | Create database tables and schema |
| `import-geometry.js` | Import GeoJSON geometries to PostgreSQL |
| `sync-frontend-data.js` | Sync greenway properties from frontend |
| `check-env.js` | Validate environment configuration |
| `alter-geometry-type.js` | Modify geometry column to MultiLineString |

## 💻 Development Guide

### Adding a New Greenway

1. **Add GeoJSON Data**
   ```
   greenway-vue/public/数据/绿道/[name].geojson
   ```

2. **Update Database**
   ```bash
   cd greenway-backend
   node scripts/sync-frontend-data.js
   ```

3. **Create Detail Page**
   - Reference: `greenway-vue/src/views/WenyuDetail.vue`
   - Use: `loadGreenwayDataByName(name)` helper

4. **Register in Overview**
   - Add layer configuration to `GreenwayOverview.vue`

### Customizing Appearance
- **Map colors**: Modify `lineColor` in component styles
- **UI themes**: Edit `<style scoped>` sections
- **Layout**: Adjust grid/flex values in CSS

## 🐛 Troubleshooting

### Greenway Not Visible
```bash
# Check database geometry type
node scripts/verify-all-geom.js

# Verify API returns data
curl "http://localhost:3000/api/greenways?name=南沙绿道"

# Check browser console for errors
# Open DevTools (F12) → Console tab
```

### API Connection Failed
```bash
# Ensure backend is running
curl http://localhost:3000/api/greenways

# Check database connection in logs
# Look for [数据库] messages in console
```

### Build Errors
```bash
# Clear cache and reinstall
cd greenway-vue
rm -rf node_modules dist
npm install
npm run build
```

## 📊 Performance Metrics

- **Initial Load**: ~2-3 seconds
- **Map Pan/Zoom**: 60 FPS
- **API Response**: <100ms
- **Bundle Size**: ~500KB (gzipped)

## 🔐 Security Considerations

- API input validation enabled
- No sensitive data in frontend code
- Environment variables for credentials
- CORS configured for development
- SQL injection prevention via parameterized queries

## 📝 Data Workflow

```
GeoJSON Files
    ↓
import-geometry.js
    ↓
PostgreSQL + PostGIS
    ↓
ST_AsGeoJSON()
    ↓
/api/greenways endpoint
    ↓
Vue 3 Components
    ↓
OpenLayers MapViewer
    ↓
Browser Display
```

## 🚢 Production Deployment

### Docker Support
```dockerfile
# Frontend
FROM node:18-alpine
WORKDIR /app
COPY greenway-vue .
RUN npm install && npm run build

# Backend
FROM node:18-alpine
WORKDIR /app
COPY greenway-backend .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
- Use `.env.production` for production credentials
- Enable HTTPS/SSL in production
- Set proper CORS origins
- Use managed PostgreSQL service
- Implement rate limiting

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request
4. Follow code style conventions

## 📧 Support

For issues and questions:
- Check `GETTING_STARTED.md` for setup help
- Review browser console for errors
- Verify database connectivity
- Check backend service logs

## 🔗 Related Documentation

- [OpenLayers API](https://openlayers.org/doc/)
- [PostGIS Manual](https://postgis.net/docs/)
- [Vue 3 Guide](https://vuejs.org/guide/)
- [Baidu Maps API](https://lbsyun.baidu.com/)bash
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
