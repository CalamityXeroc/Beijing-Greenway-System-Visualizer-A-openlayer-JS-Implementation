# 北京绿道可视化平台

![Vue](https://img.shields.io/badge/Vue-3.4.0-brightgreen.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

基于 Vue 3 + OpenLayers + PostgreSQL/PostGIS 的现代 WebGIS 平台，交互式探索北京绿道网络。

**[English](./README.md) | [中文](./README_zh-CN.md)**

## 🎯 项目简介

可视化北京 10 条主要绿道，提供交互式地图、GIS 工具、实时天气、全景街景等功能。

- ✅ 10 条完整绿道路线
- ✅ Vue 3 + OpenLayers 前端
- ✅ Node.js + Express 后端  
- ✅ PostgreSQL + PostGIS 地理数据库
- ✅ 响应式设计 + 黑夜模式

## ⚡ 快速开始

### 一键启动

**Windows:**
```bash
.\启动完整系统.bat  # 同时启动后端和前端
```

**手动启动 - 后端：**
```bash
cd greenway-backend
npm install && npm run db:init && npm run dev
```

**手动启动 - 前端（新终端）：**
```bash
cd greenway-vue
npm install && npm run dev
```

## ✨ 核心功能

- 🗺️ **交互式地图** - OpenLayers 高性能渲染
- 🛠️ **GIS 工具集** - 绘制、测量、导入 GeoJSON
- 📍 **10 条绿道** - 每条都有详情页和全景街景
- 🌡️ **实时天气** - 可拖动的天气组件
- 🌙 **黑夜模式** - 全站深色主题 + 自动时间切换
- 📱 **响应式设计** - 完全适配移动设备

## 📁 项目结构

```
├── greenway-backend/       # Express 后端 + 数据库
├── greenway-vue/           # Vue 3 网页前端应用
│   └── android/            # 移动应用（试验阶段）
├── README.md               # 英文文档（本项目概览）
├── README_zh-CN.md         # 中文文档（本文件）
└── 启动完整系统.bat       # 一键启动脚本
```

**平台支持：**
- 🌐 **网页**：桌面浏览器访问 [http://localhost:5173](http://localhost:5173)
- 📱 **移动应用**：React Native / Capacitor 应用（试验阶段）

## 📚 完整文档

- **[前端指南](./greenway-vue/README.md)** - Vue 3、OpenLayers、GIS 工具详解
- **[后端指南](./greenway-backend/README.md)** - API、数据库、数据导入步骤  
- **[英文文档](./README.md)** - English version

## 技术栈

| 组件 | 技术 |
|------|------|
| 前端 | Vue 3.4 + OpenLayers 8.2 + Vite 5 |
| 后端 | Node.js + Express 4.18 |
| 数据库 | PostgreSQL 18 + PostGIS 3.6 |
| 数据格式 | GeoJSON + MultiLineString |

## 许可证

MIT
│   │   └── 数据/绿道/           # GeoJSON 几何数据
│   └── package.json
│
├── GETTING_STARTED.md           # 快速开始指南
└── README_zh-CN.md              # 中文文档
```

## 🔗 API 端点

### 获取绿道数据
```http
GET /api/greenways?name=温榆河
```

**返回：** GeoJSON FeatureCollection，包含几何和属性数据

### 使用示例
```bash
curl "http://localhost:3000/api/greenways?name=南沙绿道"
```

## 🗄️ 数据库架构

### 主表：greenways
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

### 关键特性
- **MultiLineString 几何**：保留独立线段，避免错误连接
- **PostGIS 支持**：先进的空间查询和分析
- **坐标系统**：SRID 4326（WGS84 标准）
- **GeoJSON 转换**：ST_AsGeoJSON() 将几何转换为 GeoJSON 格式

## 🎨 设计系统

### 色彩方案
| 元素 | 颜色 | 十六进制 |
|------|------|---------|
| 主地图绿道 | 绿色 | #4CAF50 |
| 详情页路线 | 蓝色 | #2196F3 |
| 边界/市界 | 深蓝色 | #1565C0 |
| 背景色 | 浅灰 | #f5f5f5 |

### 系统包含的 10 条绿道
1. **温榆河绿道** - 全长 108km
2. **环二环城市绿道** - 全长 87km
3. **亮马河绿道** - 全长 5.5km
4. **常营半马绿道** - 全长 21km
5. **昌平42绿道** - 全长 42km
6. **丽都商圈绿道** - 全长 6.8km
7. **北运河绿道** - 全长 36km
8. **南沙绿道** - 全长 15km
9. **奥林匹克森林公园绿道** - 全长 23km
10. **营城建都绿道** - 全长 42km

## ⚙️ 环境配置

在各目录创建 `.env.local`（参考 `.env.example`）：

**后端 (`greenway-backend/.env.local`)：**
```env
DB_HOST=localhost
DB_NAME=greenway_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
```

**前端 (`greenway-vue/.env.local`)：**
```env
VITE_AMAP_KEY=your_key
VITE_BAIDU_MAP_KEY=your_key
```

## 🔐 安全考虑

- API 输入验证已启用
- 前端代码中无敏感数据
- 使用环境变量存储凭据
- 开发环境 CORS 已配置
- 使用参数化查询防止 SQL 注入

## 📝 数据流程

```
GeoJSON 文件
    ↓
import-geometry.js
    ↓
PostgreSQL + PostGIS
    ↓
ST_AsGeoJSON()
    ↓
/api/greenways 端点
    ↓
Vue 3 组件
    ↓
OpenLayers 地图查看器
    ↓
浏览器显示
```

##  10 条绿道

| # | 名称 | 长度 | 描述 |
|----|------|------|------|
| 1 | 温榆河 | 108km | 滨水生态廊道 |
| 2 | 环二环 | 87km | 城市绿道环线 |
| 3 | 亮马河 | 8km | 商务区绿道 |
| 4-10 | 常营半马/昌平42/丽都商圈/北运河/南沙/奥森/营城建都 | 各异 | 详见前端文档 |

## 🐛 故障排除

详细的故障排除指南请参考：
- [前端常见问题](./greenway-vue/README.md#troubleshooting)
- [后端常见问题](./greenway-backend/README.md#troubleshooting)

## 🏆 竞赛与知识产权

本项目是为技术竞赛参赛而开发设计，准备申请软件著作权（软著）。

**使用条款：**
- ✅ 教育科研用途可自由使用
- ⚠️ 商业用途或衍生作品需联系作者
- 🔒 软件著作权保护申请中

## 📄 许可证

MIT - 详见 LICENSE 文件

---

**用 ❤️ 为北京城市绿道而开发**  
*面向竞赛提交和软件著作权保护而设计*
