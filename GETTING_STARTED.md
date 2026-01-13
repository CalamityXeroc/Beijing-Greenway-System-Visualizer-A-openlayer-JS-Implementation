# 快速开始 / Quick Start

[中文](#快速开始) | [English](#quick-start-1)

---

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/CalamityXeroc/Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation.git
cd Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation
```

### 2. 前端启动（最快）
```bash
cd greenway-vue
npm install
npm run dev
# 打开浏览器访问 http://localhost:5173
```

### 3. 后端启动（需要 PostgreSQL）
```bash
cd greenway-backend
npm install
npm run db:init        # 初始化数据库（需要 PostgreSQL 运行）
npm run db:import      # 导入 GeoJSON 数据
npm run dev            # 启动后端 http://localhost:3000
```

### 4. 一键启动（Windows 用户）
在项目根目录找到 `启动完整系统.bat`，双击运行即可。

## 环境配置

### PostgreSQL 数据库
1. [下载安装 PostgreSQL 13+](https://www.postgresql.org/download/)
2. 创建 `.env.local` 文件在 `greenway-backend/` 目录下：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenway_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
NODE_ENV=development
```

### 天气 API（可选）
需要配置高德天气 API Key 在 `greenway-vue/.env.local`：

```env
VITE_AMAP_KEY=your_amap_key
```

## 项目结构速览

```
├── greenway-vue/       # 前端（Vue 3 + OpenLayers）
├── greenway-backend/   # 后端（Node.js + Express + PostgreSQL）
├── public/             # GeoJSON 地理数据
└── GETTING_STARTED.md  # 本文件
```

## 常见问题

### Q: 数据库连接失败？
A: 确保 PostgreSQL 已启动，检查 `.env.local` 中的数据库配置是否正确。

### Q: 只想运行前端？
A: 直接在 `greenway-vue/` 目录运行 `npm run dev` 即可。

### Q: 如何构建生产版本？
A: 在 `greenway-vue/` 目录运行 `npm run build`，输出文件在 `dist/` 目录。

## 了解更多

- 详细文档：[README_zh-CN.md](./README_zh-CN.md)
- 英文文档：[README.md](./README.md)
- 后端说明：[greenway-backend/README.md](./greenway-backend/README.md)
- 前端说明：[greenway-vue/README.md](./greenway-vue/README.md)

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/CalamityXeroc/Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation.git
cd Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation
```

### 2. Start Frontend (Fastest)
```bash
cd greenway-vue
npm install
npm run dev
# Open http://localhost:5173 in your browser
```

### 3. Start Backend (Requires PostgreSQL)
```bash
cd greenway-backend
npm install
npm run db:init        # Initialize database (PostgreSQL must be running)
npm run db:import      # Import GeoJSON data
npm run dev            # Start backend http://localhost:3000
```

### 4. One-Click Startup (Windows)
Find `启动完整系统.bat` in project root and double-click to run.

## Environment Setup

### PostgreSQL Database
1. [Download and install PostgreSQL 13+](https://www.postgresql.org/download/)
2. Create `.env.local` file in `greenway-backend/` directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenway_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
NODE_ENV=development
```

### Weather API (Optional)
Configure AMap weather API key in `greenway-vue/.env.local`:

```env
VITE_AMAP_KEY=your_amap_key
```

## Project Structure

```
├── greenway-vue/       # Frontend (Vue 3 + OpenLayers)
├── greenway-backend/   # Backend (Node.js + Express + PostgreSQL)
├── public/             # GeoJSON geospatial data
└── GETTING_STARTED.md  # This file
```

## FAQ

### Q: Database connection failed?
A: Make sure PostgreSQL is running and check `.env.local` configuration in backend directory.

### Q: Want to run only frontend?
A: Run `npm run dev` in `greenway-vue/` directory.

### Q: How to build production version?
A: Run `npm run build` in `greenway-vue/`, output files in `dist/` directory.

## Learn More

- Detailed docs (Chinese): [README_zh-CN.md](./README_zh-CN.md)
- English docs: [README.md](./README.md)
- Backend guide: [greenway-backend/README.md](./greenway-backend/README.md)
- Frontend guide: [greenway-vue/README.md](./greenway-vue/README.md)
