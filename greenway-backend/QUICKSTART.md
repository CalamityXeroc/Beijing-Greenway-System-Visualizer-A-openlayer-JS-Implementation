# 快速开始指南

## 📋 前置条件

- ✅ Node.js 16+ 已安装
- ✅ PostgreSQL 12+ 已安装（带 PostGIS）
- ✅ npm 或 yarn

## 🚀 5 分钟快速启动

### 第 1 步：配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 PostgreSQL 信息：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenway_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### 第 2 步：验证环境

```bash
npm install
npm run check
```

输出应该显示所有检查通过 ✓

### 第 3 步：初始化数据库

```bash
npm run db:init
```

预期输出：
```
[数据库] ✓ 数据库已创建
[数据库] ✓ PostGIS 扩展已启用
[数据库] ✓ 表结构已创建
```

### 第 4 步：导入数据

```bash
npm run db:import
```

导入 10 个绿道的 GeoJSON 数据。

### 第 5 步：启动服务器

```bash
npm run dev
```

输出：
```
============================================================
[服务器] ✓ 后端已启动
[服务器] 地址: http://localhost:3000
[服务器] 健康检查: http://localhost:3000/health
[服务器] API 文档: http://localhost:3000/api/greenways
============================================================
```

## ✅ 测试 API

在浏览器中打开：
- 健康检查：http://localhost:3000/health
- 获取所有绿道：http://localhost:3000/api/greenways
- GeoJSON 集合：http://localhost:3000/api/greenways/geojson/collection

## 📚 API 文档

详见 [README.md](./README.md) 中的"API 端点"部分。

## 🔧 常见问题

### Q: 无法连接数据库？
A: 检查 PostgreSQL 是否运行，或修改 .env.local 中的连接信息。

### Q: PostGIS 扩展错误？
A: 运行 `psql -U postgres -c "CREATE EXTENSION postgis;"`

### Q: GeoJSON 导入失败？
A: 确保 `../greenway-vue/public/数据/绿道/*.geojson` 文件存在。

## 🎯 下一步

1. 在前端项目中调用 API
2. 添加更多自定义路由
3. 扩展数据库模式（添加更多 POI 类型）
4. 部署到生产环境

## 📞 需要帮助？

查看 [README.md](./README.md) 的"故障排除"部分。
