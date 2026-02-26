# 前端 - Vue 3 + OpenLayers

![Vue](https://img.shields.io/badge/Vue-3.4.0-brightgreen.svg)
![OpenLayers](https://img.shields.io/badge/OpenLayers-8.2.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-blueviolet.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

[English](./README.md) | 中文

一个现代化、交互式的 Web GIS 可视化平台，用于探索北京广泛的绿道网络系统。基于 **Vue 3 + OpenLayers + Vite** 构建，为用户提供直观的界面来发现城市绿色廊道、生态空间和休闲路径。

## ✨ 核心特性

### 🗺️ 交互式地图体验
- **全屏地图视图**：基于 OpenLayers 的高性能地图渲染，流畅交互
- **多图层可视化**：自由切换行政边界和绿道路线
- **智能图层管理**：直观的图层控制界面，动态显示/隐藏
- **响应式设计**：完美适配桌面端和移动端设备

### 🛠️ 专业 GIS 工具
- **绘制工具**：在地图上直接创建点、线、多边形
- **测量工具**：精确计算距离（米/公里）和面积（平方米/平方公里）
- **自定义图层上传**：导入您自己的 GeoJSON 数据进行分析
- **交互式弹窗**：点击要素查看详细信息

### 🌈 增强用户体验
- **实时天气组件**：显示当前天气状况
- **流畅动画效果**：精致的过渡动画和悬停交互
- **信息卡片展示**：直观展示绿道统计和亮点

### 🌄 360° 全景体验
- **百度街景集成**：通过沉浸式全景影像探索绿道
- **多个观景点**：在路线沿线的不同景点之间切换

### 🎯 10 条完整绿道路线
- **温榆河**：108公里滨水生态廊道
- **环二环**：87公里环绕二环路的城市绿道
- **亮马河**：8公里国际商务区绿道
- **常营半马**：城市运动健身绿道
- **昌平42**：郊区生态绿道
- **丽都商圈**：城市商业区绿道
- **北运河**：历史运河绿道
- **南沙**：滨水生态绿道
- **奥林匹克森林公园**：奥运遗产公园绿道
- **营城建都**：历史文化遗产路线

## 🚀 快速开始

### 环境要求

- **Node.js**：18.x 或更高版本
- **npm**：9.x 或更高版本

### 前端快速启动（5分钟）

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 在浏览器打开：http://localhost:5173
```

### 生产构建

```bash
npm run build

# 本地预览生产构建
npm run preview
```

## 环境配置

创建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

在 `.env.local` 中添加您的 API 密钥：

```env
VITE_AMAP_KEY=your_amap_api_key
VITE_API_BASE_URL=http://localhost:3001
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 生产构建
- `npm run preview` - 本地预览生产构建
- `npm run lint` - 运行 ESLint

## 项目结构

```
greenway-vue/
├── src/
│   ├── views/
│   │   ├── GreenwayOverview.vue    # 主地图页面
│   │   └── *Detail.vue             # 10个绿道详情页
│   ├── components/
│   │   ├── MapComponent.vue        # OpenLayers 地图
│   │   ├── WeatherWidget.vue       # 天气显示
│   │   └── ...
│   ├── utils/
│   │   └── mapUtils.js            # 辅助函数
│   ├── assets/                    # 图片、样式
│   ├── App.vue                    # 根组件
│   └── main.js                    # 入口点
├── public/                        # 静态资产
├── index.html
├── vite.config.js
└── package.json
```

## 连接到后端

运行完整系统时连接到后端：

1. 确保后端在端口 3001 运行
2. 在 `.env.local` 中设置 `VITE_API_BASE_URL=http://localhost:3001`
3. 前端将从后端 API 获取数据

## 故障排除

### 端口 5173 已被占用？
```bash
npm run dev -- --port 5174
```

### 构建失败？
```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API 调用失败？
- 检查后端是否在端口 3000 运行
- 验证后端 CORS 设置
- 检查浏览器控制台错误

## 许可证

MIT

### 仅前端快速启动（5分钟）

```bash
# 克隆仓库
git clone https://github.com/CalamityXeroc/Beijing-Greenway-Visualizer-A-openlayer-JS-Implementation.git
cd greenway-vue

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 在浏览器打开
# http://localhost:5173
```

### 完整系统启动（包含后端）

#### 第一步：配置后端数据库
```bash
cd ../greenway-backend
cp .env.example .env.local
# 编辑 .env.local 填入 PostgreSQL 信息
npm install
npm run db:init    # 初始化数据库
npm run db:import  # 导入数据
npm run dev        # 启动后端 (端口 3000)
```

#### 第二步：启动前端（新终端）
```bash
cd ../greenway-vue
npm install
npm run dev        # 启动前端 (端口 5173)
```

详见 [后端快速开始](../greenway-backend/QUICKSTART.md)

### 生产环境构建

```bash
npm run build  # 输出到 dist/ 目录
```

## 🛠️ 技术栈

### 核心框架
- **Vue 3.4.0**：渐进式 JavaScript 框架，使用 Composition API
- **Vue Router 4.2.5**：Vue.js 官方路由管理器
- **Vite 5.0.0**：下一代前端构建工具

### 地图与 GIS
- **OpenLayers 8.2.0**：高性能 Web 地图库
  - 矢量/栅格图层支持
  - 绘制和测量工具
  - GeoJSON 格式支持

### 其他功能
- **Axios 1.6.0**：HTTP 请求库
- **百度地图 API**：全景街景集成
- **高德天气 API**：实时天气数据

## 📁 项目结构

```
greenway-vue/
├── public/
│   └── 数据/                    # GeoJSON 空间数据
│       ├── 北京边界.geojson
│       └── 绿道/
├── src/
│   ├── components/              # 可复用组件
│   │   ├── MapViewer.vue        # 核心地图组件
│   │   ├── MapToolbar.vue       # GIS 工具栏
│   │   ├── WeatherCard.vue      # 可拖动天气卡片
│   │   └── BaiduPanoramaViewer.vue  # 360° 全景查看器
│   ├── views/                   # 页面组件（11个）
│   │   ├── GreenwayOverview.vue # 主交互概览页
│   │   ├── WenyuDetail.vue      # 温榆河详情页
│   │   ├── HuanerhuanDetail.vue # 环二环详情页
│   │   ├── LiangmaheDetail.vue  # 亮马河详情页
│   │   └── ...                  # 其他 8 个绿道详情页
│   ├── core/                    # 核心功能模块
│   │   ├── MapManager.js        # 地图管理
│   │   └── LayerManager.js      # 图层管理
│   ├── utils/                   # 工具函数
│   ├── router/                  # Vue Router 配置
│   ├── App.vue                  # 根组件
│   └── main.js                  # 应用入口
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 功能亮点

### 地图交互工具
- **绘制工具**：在地图上创建点、线、多边形
- **测量工具**：计算距离（米/公里）和面积（平方米/平方公里）
- **图层控制**：动态显示/隐藏地图图层
- **全景视图**：集成百度街景，探索绿道沿线风景

### 绿道详情页面
- **固定视图**：禁用缩放和平移，专注显示绿道信息
- **左右分栏**：左侧信息展示，右侧全屏地图
- **实时天气**：可拖动、可折叠的天气卡片
- **360° 全景**：多个观景点的沉浸式街景体验

### 响应式设计
- **流畅交互**：高性能地图渲染和动画
- **移动友好**：适配桌面端和移动设备
- **现代 UI**：透明浮动标题，清晰的信息展示

## 🌈 开发配置

### 环境变量设置

创建 `.env.local` 文件（git 会忽略此文件）：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 添加高德天气 API Key：

```env
VITE_AMAP_KEY=your_amap_api_key_here
```

获取 API Key：https://lbs.amap.com/api/web/guide/create-project/api-key

### 天气服务

天气功能通过后端代理实现（解决跨域问题）：

```bash
# 启动天气代理服务
npm run dev:weather-proxy

# 或直接运行
node weather-proxy.js
```

在生产环境中，天气代理可集成到主后端服务，或部署为独立微服务。

## 🌐 浏览器支持

- **Chrome/Edge**（推荐）：90+ 版本
- **Firefox**：88+ 版本
- **Safari**：14+ 版本

## 🤝 贡献与反馈

我们欢迎贡献和反馈！由于项目处于早期开发阶段，您的意见对我们尤其重要。

### 如何参与
- 💡 **功能建议**：通过 Issue 分享您对新功能或改进的想法
- 🐛 **问题反馈**：发现 Bug？请详细描述重现步骤进行反馈
- 📝 **文档完善**：帮助改进项目文档和使用指南
- 🎨 **UI/UX 反馈**：分享您对设计和用户体验的看法
- 🔧 **代码贡献**：提交 Pull Request 修复问题或添加新功能

### Pull Request 流程
1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request 并清晰描述所做的修改

**提示**：由于项目处于早期开发阶段，在开发重大功能前，建议先通过 Issue 进行讨论。

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件。

## 🙏 致谢

- 北京市规划和自然资源委员会提供绿道数据
- OpenLayers 社区提供优秀的地图库
- Vue.js 团队提供出色的框架
- 百度地图提供全景影像服务

## 📧 联系方式

项目链接：[https://github.com/CalamityXeroc/Beijing-Greenway-Visualizer-A-openlayer-JS-Implementation](https://github.com/CalamityXeroc/Beijing-Greenway-Visualizer-A-openlayer-JS-Implementation)

**学术合作咨询**：
- 📬 完整代码访问（用于学术研究）
- 🤝 绿道可视化项目合作
- 📊 数据共享与联合研究

如有学术合作需求，请通过 Issue 联系或邮件咨询项目维护者。

---

**用 ❤️ 构建，探索北京的绿色空间**
