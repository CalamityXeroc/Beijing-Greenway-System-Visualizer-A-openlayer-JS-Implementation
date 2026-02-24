# Backend Service - 后端服务

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18+-orange.svg)

English | [中文](./README_zh-CN.md)

Backend service for Beijing Greenway GIS platform using Node.js + Express + PostgreSQL + PostGIS.

## Features

- ✅ RESTful API for greenway data queries
- ✅ GeoJSON storage and spatial queries
- ✅ PostgreSQL/PostGIS integration
- ✅ Environment configuration management
- ✅ Development and production ready

## System Requirements

- **Node.js** >= 18.0
- **PostgreSQL** 18 with PostGIS 3.6
- **npm** or **yarn**

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your PostgreSQL connection:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenway
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
NODE_ENV=development
```

### 3. Initialize Database

```bash
npm run db:init
```

Expected output:
```
[数据库] ✓ 数据库已创建
[数据库] ✓ PostGIS 扩展已启用
[数据库] ✓ 表结构已创建
[数据库] ✓ 空间索引已创建
```

### 4. Import GeoJSON Data

```bash
npm run db:import
```

Expected output:
```
[导入数据] ✓ 开始导入 GeoJSON 文件...
[导入数据] ✓ 成功导入 10 个绿道
```

### 5. Start Development Server

```bash
npm run dev
```

Expected output:
```
============================================================
[服务器] ✓ 后端已启动
[服务器] 地址: http://localhost:3001
[服务器] 健康检查: http://localhost:3001/health
============================================================
```

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run db:init` - Initialize database schema
- `npm run db:import` - Import GeoJSON data
- `npm run check` - Verify environment configuration

## API Endpoints

### Health Check
```bash
GET /health
```

### Get All Greenways
```bash
GET /api/greenways
```

### Get Specific Greenway
```bash
GET /api/greenways?name=南沙绿道
```

### Get GeoJSON Collection
```bash
GET /api/greenways/geojson/collection
```

## Project Structure

```
greenway-backend/
├── src/
│   ├── index.js           # Main server entry point
│   └── db.js              # Database connection pool
├── scripts/
│   ├── init-db.js         # Database initialization
│   ├── import-geometry.js # GeoJSON data import
│   ├── check-env.js       # Environment verification
│   └── sync-frontend-data.js
├── .env.example           # Example environment variables
├── package.json
└── README.md              # This file
```

## Common Issues

### Q: Cannot connect to database?
A: Check PostgreSQL is running and verify connection settings in `.env.local`.

### Q: PostGIS extension not found?
A: Run: `psql -U postgres -c "CREATE EXTENSION postgis;"`

### Q: GeoJSON import fails?
A: Ensure GeoJSON files exist in the expected location and check file paths in import script.

## Troubleshooting

Run the environment check script:
```bash
npm run check
```

This will verify:
- PostgreSQL connectivity
- Node.js dependencies
- Environment configuration
- Database schema

## License

MIT

### 绿道数据接口

#### 获取所有绿道列表
```
GET /api/greenways
```

**响应示例：**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "温榆河绿道",
      "description": "北京温榆河绿道",
      "length": 45.5,
      "introduction": "绿道简介...",
      "location": "北京市朝阳区",
      "geometry": {
        "type": "LineString",
        "coordinates": [[...], [...], ...]
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 获取单个绿道详情（含兴趣点）
```
GET /api/greenways/:id
```

**响应示例：**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "温榆河绿道",
    "description": "...",
    "geometry": {...},
    "points_of_interest": [
      {
        "id": 1,
        "name": "停靠站A",
        "poi_type": "stop",
        "geometry": {"type": "Point", "coordinates": [...]}
      }
    ]
  }
}
```

#### 创建或更新绿道
```
POST /api/greenways
Content-Type: application/json

{
  "name": "新绿道",
  "description": "描述",
  "length": 50,
  "introduction": "简介",
  "location": "位置",
  "geometry": {
    "type": "LineString",
    "coordinates": [[116.5, 39.9], [116.6, 39.95]]
  }
}
```

#### 获取 GeoJSON FeatureCollection
```
GET /api/greenways/geojson/collection
```

用于在地图上显示所有绿道（与前端地图库兼容）。

#### 创建兴趣点
```
POST /api/greenways/:id/poi
Content-Type: application/json

{
  "name": "停靠站",
  "description": "描述",
  "poi_type": "stop",
  "geometry": {
    "type": "Point",
    "coordinates": [116.5, 39.9]
  }
}
```

### 系统检查

#### 健康检查
```
GET /health
```

**响应：**
```json
{
  "status": "ok",
  "database": "connected"
}
```

## 数据库架构

### greenways 表（绿道）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigserial | 主键 |
| name | varchar | 绿道名称（唯一） |
| description | text | 描述 |
| length | numeric | 长度(km) |
| introduction | text | 详细介绍 |
| location | varchar | 位置描述 |
| geometry | geometry(LineString,4326) | 地理路线 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### points_of_interest 表（兴趣点）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigserial | 主键 |
| name | varchar | 兴趣点名称 |
| description | text | 描述 |
| poi_type | varchar | 类型(stop/toilet/parking) |
| greenway_id | bigint | 关联绿道ID |
| geometry | geometry(Point,4326) | 位置坐标 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

## PostgreSQL 安装

### Windows 用户

1. 下载 PostgreSQL 安装程序：https://www.postgresql.org/download/windows/
2. 运行安装程序（选择包含 PostGIS 或后续单独安装）
3. 记住 PostgreSQL 的管理员密码
4. 安装完成后，PostGIS 通常需要单独安装：
   ```
   PostgreSQL Installation\bin\pgAdmin4.exe
   ```

### macOS 用户

```bash
# 使用 Homebrew
brew install postgresql@14
brew install postgis

# 启动服务
brew services start postgresql@14
```

### Linux 用户

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib postgis

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 启用 PostGIS 扩展

```bash
# 连接到 PostgreSQL
psql -U postgres

# 在 psql 提示符中执行
CREATE EXTENSION postgis;
\q
```

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器（自动重启）
npm run dev

# 启动生产服务器
npm start

# 初始化数据库
npm run db:init

# 导入 GeoJSON 数据
npm run db:import
```

## 前端集成

在 Vue 应用中调用后端 API：

```javascript
// 获取所有绿道
const response = await fetch('http://localhost:3001/api/greenways');
const greenways = await response.json();

// 获取 GeoJSON FeatureCollection（用于地图）
const geoResponse = await fetch('http://localhost:3001/api/greenways/geojson/collection');
const featureCollection = await geoResponse.json();
```

## 项目结构

```
greenway-backend/
├── src/
│   ├── index.js              # Express 服务器入口
│   ├── db.js                 # 数据库连接模块
│   └── routes/               # API 路由（可扩展）
├── scripts/
│   ├── init-db.js            # 数据库初始化脚本
│   └── import-geojson.js     # GeoJSON 导入脚本
├── package.json              # 项目配置
├── .env.example              # 环境变量模板
└── README.md                 # 本文件
```

## 故障排除

### 连接数据库失败

```
错误: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案：**
1. 检查 PostgreSQL 是否运行：
   ```bash
   # Windows
   Get-Service PostgreSQL*
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```
2. 检查 `.env.local` 中的数据库配置是否正确
3. 确认 PostGIS 扩展已启用

### PostGIS 扩展未找到

```
错误: extension "postgis" does not exist
```

**解决方案：**
1. 确认已安装 PostGIS：
   ```bash
   psql -U postgres -c "SELECT version();"
   ```
2. 如未安装，先安装 PostGIS 包
3. 重新运行 `npm run db:init`

### 权限拒绝

```
错误: role "postgres" does not exist
```

**解决方案：**
1. 连接到默认的 'postgres' 用户：
   ```bash
   psql -U postgres
   ```
2. 创建新用户（如需要）：
   ```sql
   CREATE USER myuser WITH PASSWORD 'password';
   ALTER ROLE myuser CREATEDB;
   ```

## 扩展功能

### 添加新的 API 端点

在 `src/index.js` 中添加新的路由处理程序：

```javascript
app.get('/api/custom-endpoint', async (req, res) => {
  try {
    const result = await pool.query('SELECT ...');
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});
```

### 添加更多 GeoJSON 数据

将 `.geojson` 文件放在 `../greenway-vue/public/数据/绿道/` 目录，然后运行：

```bash
npm run db:import
```

## 许可证

MIT License

## 相关资源

- [PostgreSQL 官网](https://www.postgresql.org/)
- [PostGIS 文档](https://postgis.net/documentation/)
- [Express.js 文档](https://expressjs.com/)
- [GeoJSON 规范](https://geojson.org/)
