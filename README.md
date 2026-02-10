# Beijing Greenway System Visualization Platform

![Vue](https://img.shields.io/badge/Vue-3.4.0-brightgreen.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A modern WebGIS platform for exploring Beijing's greenway network using Vue 3 + OpenLayers + PostgreSQL/PostGIS.

**[中文版本](./README_zh-CN.md)**

## ⚠️ Important Notice

This project uses environment variables to manage all sensitive information (API keys, database passwords, etc.). Never commit real credentials to the repository. See [Configuration](#configuration) section for details.

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
- **Memory**: At least 2GB RAM
- **Disk Space**: At least 500MB

## Configuration

### Environment Variables

All sensitive information must be configured via `.env.local` files (never commit to Git):

**Backend** (`greenway-backend/.env.local`)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenway_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
PORT=3000
```

**Frontend** (`greenway-vue/.env.local`)
```env
VITE_AMAP_KEY=your_amap_api_key
VITE_BAIDU_MAP_KEY=your_baidu_map_key
VITE_API_BASE_URL=http://localhost:3000
```

See `.env.example` files in each directory for templates.

### .gitignore Configuration

The following are excluded from version control:
- All `.env` files and sensitive credentials
- `node_modules/` and build artifacts
- `resources/` and `public/` directories (data folders)
- IDE and OS specific files

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

## API Endpoints

### Get Greenway Data
```bash
GET /api/greenways
GET /api/greenways?name=Wenyu
```

Returns GeoJSON FeatureCollection with MultiLineString geometry.

### Health Check
```bash
GET /health
```

## Documentation

- **Frontend Setup:** [greenway-vue/README.md](./greenway-vue/README.md)
- **Backend Setup:** [greenway-backend/README.md](./greenway-backend/README.md)  
- **Chinese Guide:** [README_zh-CN.md](./README_zh-CN.md)

## License

MIT License - See LICENSE file for details

## 10 Greenways Included

1. **温榆河绿道** - Wenyu River (108km)
2. **环二环城市绿道** - Ring Road No.2 (87km)  
3. **亮马河绿道** - Liangma River (5.5km)
4. **常营半马绿道** - Changying Half Marathon (21km)
5. **昌平42绿道** - Changping 42 (42km)
6. **丽都商圈绿道** - Lido Commercial District (6.8km)
7. **北运河绿道** - Bei Yunhe (36km)
8. **南沙绿道** - Nansha (15km)
9. **奥林匹克森林公园绿道** - Olympic Forest Park (23km)
10. **营城建都绿道** - Yingcheng Historic Route (42km)

## Security & Best Practices

- ✅ API keys loaded from environment variables only
- ✅ Database passwords never stored in code
- ✅ CORS properly configured for development
- ✅ SQL injection prevention with parameterized queries
- ✅ No sensitive data in frontend code

## Troubleshooting

**Port Already In Use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Database Connection Failed?**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify connection string
cd greenway-backend
node scripts/check-env.js
```

**Build Issues?**
```bash
cd greenway-vue
rm -rf node_modules dist
npm install
npm run build
```

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support & Documentation

- 📖 [Chinese Documentation](./README_zh-CN.md)
- 🐛 [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Discussions for questions and suggestions

---

**Built with ❤️ to explore Beijing's green spaces**
