# 后端服务

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-orange.svg)

[English](./README.md) | 中文

北京绿道地理信息系统的后端服务，使用 Node.js + Express + PostgreSQL + PostGIS 构建。

## 功能特性

- ✅ RESTful API 绿道数据查询
- ✅ GeoJSON 存储和空间查询
- ✅ PostgreSQL/PostGIS 集成
- ✅ **AI 助手服务**：基于 DeepSeek V3.2 的智能对话 API，支持对话历史管理；用户消息自动写入 `chat_logs` 表
- ✅ **管理员 AI 对话分析**：词云 + 每日趋势 + 最近提问记录，中文分词使用 `segment` 库
- ✅ 环境配置管理
- ✅ 开发和生产就绪

## 系统需求

- **Node.js** >= 18.0
- **PostgreSQL** 14+ + PostGIS 3.3+
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
DB_NAME=greenway
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret
DEEPSEEK_API_KEY=your_deepseek_api_key
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
[服务器] 地址: http://localhost:3001
[服务器] 健康检查: http://localhost:3001/health
============================================================
```

## 可用脚本

- `npm run dev` - 启动开发服务器（自动重启）
- `npm start` - 启动生产服务器
- `npm run db:init` - 初始化数据库架构
- `npm run db:import` - 导入 GeoJSON 数据
- `npm run db:chat-logs` - 创建 AI 对话日志表 (`chat_logs`)
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

### AI 对话
```bash
POST /api/ai/chat
DELETE /api/ai/context/:id
```

### 管理员 AI 分析（需 Bearer JWT）
```bash
GET /api/admin/ai-stats?days=7      # 词云 + 每日趋势（支持 7/14/30 天）
GET /api/admin/ai-stats/recent      # 最近原始提问记录
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
│   ├── db.js              # 数据库连接池
│   └── routes/
│       ├── ai.js            # DeepSeek 对话 API + 对话日志入库
│       └── adminAiStats.js  # 管理员 AI 分析
├── scripts/
│   ├── init-db.js                 # 数据库初始化
│   ├── import-geometry.js        # GeoJSON 数据导入
│   ├── add-chat-logs-table.js    # 数据库迁移：chat_logs 表
│   ├── check-env.js              # 环境验证
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
