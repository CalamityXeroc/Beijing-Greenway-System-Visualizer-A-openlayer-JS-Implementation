# Beijing Greenway System Visualization Platform

![Vue](https://img.shields.io/badge/Vue-3.4.0-brightgreen.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A modern WebGIS platform for exploring Beijing's greenway network using Vue 3 + OpenLayers + PostgreSQL/PostGIS.

**[English](./README.md) | [中文](./README_zh-CN.md)**

## 🎯 Project Overview

Interactive visualization of 10 major Beijing greenways with map, GIS tools, real-time weather, and panorama street view.

- ✅ 10 Complete greenway routes
- ✅ Vue 3 + OpenLayers frontend
- ✅ Node.js + Express backend  
- ✅ PostgreSQL + PostGIS geospatial database
- ✅ Responsive design + Dark mode

## ⚡ Quick Start

### One-Command Startup

**Windows:**
```bash
.\启动完整系统.bat  # Starts both backend and frontend
```

**Manual - Backend:**
```bash
cd greenway-backend
npm install && npm run db:init && npm run dev
```

**Manual - Frontend (new terminal):**
```bash
cd greenway-vue
npm install && npm run dev
```

## ✨ Core Features

- 🗺️ **Interactive Map** - OpenLayers high-performance rendering
- 🛠️ **GIS Toolkit** - Drawing, measurement, GeoJSON import
- 📍 **10 Greenways** - Each with detail page and street panorama
- 🌡️ **Real-time Weather** - Draggable weather widget
- 🌙 **Dark Mode** - Full-site dark theme + auto time switching
- 📱 **Responsive Design** - Complete mobile support

## 📁 Project Structure

```
├── greenway-backend/       # Express backend + database
├── greenway-vue/           # Vue 3 web frontend application
│   └── android/            # Mobile app (experimental)
├── README.md               # English documentation (this file)
├── README_zh-CN.md         # Chinese documentation
└── 启动完整系统.bat       # One-command startup script
```

**Platform Support:**
- 🌐 **Web:** Desktop browser at [http://localhost:5173](http://localhost:5173)
- 📱 **Mobile:** React Native / Capacitor app (experimental)

## 📚 Documentation

- **[Frontend Guide](./greenway-vue/README.md)** - Vue 3, OpenLayers, GIS toolkit details
- **[Backend Guide](./greenway-backend/README.md)** - API, database, data import steps  
- **[Chinese Version](./README_zh-CN.md)** - 中文文档

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Vue 3.4 + OpenLayers 8.2 + Vite 5 |
| Backend | Node.js + Express 4.18 |
| Database | PostgreSQL 18 + PostGIS 3.6 |
| Data Format | GeoJSON + MultiLineString |

## 🔗 API Endpoints

### Get Greenway Data
```http
GET /api/greenways?name=Wenyu
```

**Returns:** GeoJSON FeatureCollection with geometry and attributes

### Usage Example
```bash
curl "http://localhost:3001/api/greenways?name=Nansha"
```

## 📋 10 Greenways

| # | Name | Length | Description |
|----|------|--------|-------------|
| 1 | Wenyu River | 108km | Waterfront ecological corridor |
| 2 | Ring Road 2 | 87km | Urban greenway loop |
| 3 | Liangma River | 8km | Business district greenway |
| 4-10 | Changying/Changping42/Lido/Bei Yunhe/Nansha/Olympic Forest/Yingcheng | Various | See frontend docs |

## ⚙️ Environment Configuration

Create `.env.local` in each directory (reference `.env.example`):

**Backend (`greenway-backend/.env.local`):**
```env
DB_HOST=localhost
DB_NAME=greenway_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
```

**Frontend (`greenway-vue/.env.local`):**
```env
VITE_AMAP_KEY=your_key
VITE_BAIDU_MAP_KEY=your_key
```

## 🔐 Security Practices

- API input validation enabled
- No sensitive data in frontend code
- Environment variables for credentials
- CORS configured for development
- Parameterized queries to prevent SQL injection

## 🏆 Competition & Intellectual Property

This project is developed for participation in technical competitions and is prepared for software copyright registration (软著申请).

**Usage Terms:**
- Educational and research use freely permitted
- For commercial purposes or derivative works, please contact the author
- Patent/software copyright protection pending

## 📄 License

MIT - See LICENSE file for details

---

**Built with ❤️ to explore Beijing's green spaces**  

