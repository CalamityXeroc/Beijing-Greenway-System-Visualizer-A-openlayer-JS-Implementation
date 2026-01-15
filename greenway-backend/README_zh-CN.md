# 后端服务

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18+-orange.svg)

[English](./README.md) | 中文

北京绿道地理信息系统的后端服务，使用 Node.js + Express + PostgreSQL + PostGIS 构建。

## 功能特性

- ✅ RESTful API 绿道数据查询
- ✅ GeoJSON 存储和空间查询
- ✅ PostgreSQL/PostGIS 集成
- ✅ 环境配置管理
- ✅ 开发和生产就绪

## 系统需求

- **Node.js** >= 18.0
- **PostgreSQL** 18 + PostGIS 3.6
- **npm** 或 **yarn**

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 PostgreSQL 连接信息：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenway_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
NODE_ENV=development
```

### 3. 初始化数据库

```bash
npm run db:init
```

预期输出：
```
[数据库] ✓ 数据库已创建
[数据库] ✓ PostGIS 扩展已启用
[数据库] ✓ 表结构已创建
[数据库] ✓ 空间索引已创建
```

### 4. 导入 GeoJSON 数据

```bash
npm run db:import
```

预期输出：
```
[导入数据] ✓ 开始导入 GeoJSON 文件...
[导入数据] ✓ 成功导入 10 个绿道
```

### 5. 启动开发服务器

```bash
npm run dev
```

预期输出：
```
============================================================
[服务器] ✓ 后端已启动
[服务器] 地址: http://localhost:3000
[服务器] 健康检查: http://localhost:3000/health
============================================================
```

## 可用脚本

- `npm run dev` - 启动开发服务器（自动重启）
- `npm start` - 启动生产服务器
- `npm run db:init` - 初始化数据库架构
- `npm run db:import` - 导入 GeoJSON 数据
- `npm run check` - 验证环境配置

## API 接口

### 健康检查
```bash
GET /health
```

### 获取所有绿道
```bash
GET /api/greenways
```

### 获取特定绿道
```bash
GET /api/greenways?name=南沙绿道
```

### 获取 GeoJSON 集合
```bash
GET /api/greenways/geojson/collection
```

## 项目结构

```
greenway-backend/
├── src/
│   ├── index.js           # 主服务入口
│   └── db.js              # 数据库连接池
├── scripts/
│   ├── init-db.js         # 数据库初始化
│   ├── import-geometry.js # GeoJSON 数据导入
│   ├── check-env.js       # 环境验证
│   └── sync-frontend-data.js
├── .env.example           # 示例环境变量
├── package.json
└── README_zh-CN.md        # 本文件
```

## 常见问题

### Q: 无法连接数据库？
A: 检查 PostgreSQL 是否运行，并验证 `.env.local` 中的连接设置。

### Q: PostGIS 扩展未找到？
A: 运行：`psql -U postgres -c "CREATE EXTENSION postgis;"`

### Q: GeoJSON 导入失败？
A: 确保 GeoJSON 文件在预期位置存在，检查导入脚本中的文件路径。

## 故障排除

运行环境检查脚本：
```bash
npm run check
```

这将验证：
- PostgreSQL 连接
- Node.js 依赖
- 环境配置
- 数据库架构

## 许可证

MIT
