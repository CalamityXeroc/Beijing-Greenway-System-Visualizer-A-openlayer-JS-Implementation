# Beijing Greenway System Visualization Platform

![Vue](https://img.shields.io/badge/Vue-3.4.0-brightgreen.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A modern WebGIS platform for exploring Beijing's greenway network using Vue 3 + OpenLayers + PostgreSQL/PostGIS.

**[中文版本](./README_zh-CN.md)**

## Quick Start

### One-Command Startup

**Windows:**
```bash
.\启动完整系统.bat
```

**Linux/macOS:**
```bash
bash 启动完整系统.bat
```

This starts both backend (port 3000) and frontend (port 5173).

### Manual Setup

**Backend Setup:**
```bash
cd greenway-backend
npm install
npm run db:init      # Initialize database
npm run db:import    # Import GeoJSON data
npm run dev          # Start development server
```

**Frontend Setup (new terminal):**
```bash
cd greenway-vue
npm install
npm run dev
```

**Access Application:** http://localhost:5173

## Features

- ✅ **10 Greenways** with interactive visualization
- ✅ **Vue 3 + OpenLayers** modern web GIS
- ✅ **PostgreSQL/PostGIS** spatial database
- ✅ **Real-time Weather** & **Baidu Panorama** integration
- ✅ **10 Complete Detail Pages** for each greenway route
- ✅ **GIS Toolkit**: Drawing, measurement, layer controls
- ✅ **Responsive Design** for desktop/mobile

## System Requirements

- **Node.js** >= 18.0
- **PostgreSQL** 18 with PostGIS 3.6
- **npm** or **yarn**

## Project Structure

```
tryyyyyy/
├── greenway-backend/           # Express backend service
│   ├── src/
│   │   ├── index.js           # Main server
│   │   └── db.js              # Database connection
│   ├── scripts/
│   │   ├── init-db.js         # Initialize database
│   │   ├── import-geometry.js # Import GeoJSON data
│   │   ├── check-env.js       # Check environment
│   │   └── sync-frontend-data.js
│   └── package.json
├── greenway-vue/               # Vue 3 frontend app
│   ├── src/
│   │   ├── views/             # Pages (overview + 10 detail pages)
│   │   ├── components/        # Reusable components
│   │   ├── utils/             # Helper functions
│   │   └── config/            # Configuration files
│   └── package.json
├── README_zh-CN.md            # Chinese documentation
└── 启动完整系统.bat           # One-command startup script
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3.4, OpenLayers 8.2, Vite 5.0 |
| Backend | Node.js, Express 4.18 |
| Database | PostgreSQL 18, PostGIS 3.6 |
| Data Format | GeoJSON, MultiLineString |

## API Overview

### Get Greenway Data

```bash
GET /api/greenways
GET /api/greenways?name=南沙绿道
```

Returns GeoJSON FeatureCollection with MultiLineString geometry.

### Health Check

```bash
GET /health
```

## Configuration

All sensitive information (API keys, database passwords) must be configured via environment variables in `.env.local` files:

- **Frontend**: `greenway-vue/.env.local`
- **Backend**: `greenway-backend/.env.local`

See `.env.example` files in each directory for configuration template.

## Documentation

- **Frontend Setup:** See [greenway-vue/README.md](./greenway-vue/README.md)
- **Backend Setup:** See [greenway-backend/README.md](./greenway-backend/README.md)
- **Chinese Full Guide:** See [README_zh-CN.md](./README_zh-CN.md)

## License

MIT

## 10 Greenways

1. **温榆河绿道** - Wenyu River (108km)
2. **环二环城市绿道** - Ring Road No.2 (87km)
3. **亮马河绿道** - Liangma River (5.5km)
4. **常营半马绿道** - Changying (21km)
5. **昌平42绿道** - Changping 42 (42km)
6. **丽都商圈绿道** - Lido (6.8km)
7. **北运河绿道** - Bei Yunhe (36km)
8. **南沙绿道** - Nansha (15km)
9. **奥林匹克森林公园绿道** - Olympic Forest (23km)
10. **营城建都绿道** - Yingcheng (42km)

## Configuration

### .env (Backend)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenway
DB_USER=postgres
DB_PASSWORD=123456
PORT=3000
```

### Color Scheme
- Main Map: Green (#4CAF50)
- Detail Pages: Blue (#2196F3)

## Utility Scripts

| Script | Purpose |
|--------|---------|
| `init-db.js` | Initialize database |
| `import-geometry.js` | Import GeoJSON to PostGIS |
| `sync-frontend-data.js` | Sync greenway data |
| `check-env.js` | Validate environment |

## Troubleshooting

**Greenway not visible?**
```bash
curl "http://localhost:3000/api/greenways?name=南沙绿道"
# Check response in browser DevTools (F12)
```

**API connection failed?**
```bash
curl http://localhost:3000/api/greenways
# Verify backend is running
```

**Build errors?**
```bash
cd greenway-vue
rm -rf node_modules dist
npm install && npm run build
```

## Performance

- Initial Load: ~2-3s
- Map Zoom/Pan: 60 FPS
- API Response: <100ms
- Bundle Size: ~500KB (gzipped)

## Deployment

See [SETUP_ENVIRONMENT.md](./SETUP_ENVIRONMENT.md) for environment configuration and [README_zh-CN.md](./README_zh-CN.md) for detailed deployment instructions.

## License

MIT License - See LICENSE file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Support

- Check [GETTING_STARTED.md](./GETTING_STARTED.md) for setup help
- Open GitHub issues for bugs/features
- Review console errors (F12 DevTools)

---

**For Academic Use**: See [README_zh-CN.md](./README_zh-CN.md) for complete technical documentation.

**Built with ❤️ to explore Beijing's green spaces**
