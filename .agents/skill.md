# Skill 使用指南

> 本文件记录所有已安装的 Skill 及其适用场景，方便在对话中快速决策"该激活哪个 Skill"。

---

## 📋 总览速查表

| Skill 名称 | 一句话用途 | 关键触发词 |
|---|---|---|
| `brainstorming` | 实现前先探索需求与设计 | 新功能、设计方案、需求分析 |
| `systematic-debugging` | 系统化 debug，避免乱猜乱改 | bug、报错、测试失败、异常行为 |
| `vue-best-practices` | Vue 3 开发最佳实践 | `.vue`、Vue、Pinia、Vite |
| `vue-debug-guides` | Vue 3 调试与报错修复 | 报错、warning、hydration |
| `vue-pinia-best-practices` | Pinia 状态管理 | store、状态、pinia |
| `vue-router-best-practices` | Vue Router 4 路由 | 路由、导航守卫、route params |
| `vue-options-api-best-practices` | Options API 风格 | `data()`、`methods`、`this.` |
| `vue-jsx-best-practices` | Vue 中使用 JSX | JSX、render 函数 |
| `create-adaptable-composable` | 创建可复用 composable | composable、MaybeRef、hooks |
| `vue-testing-best-practices` | Vue 专项测试（Vitest + Vue Test Utils） | Vue 测试、Vitest、Test Utils |
| `frontend-design` | 高质量前端界面设计 | 网页、组件、UI、landing page |
| `canvas-design` | 静态视觉设计（PNG/PDF） | 海报、平面设计、artwork |
| `algorithmic-art` | 代码生成艺术（p5.js） | 生成艺术、粒子、flow field |
| `theme-factory` | 为任意作品套用主题风格 | 主题、配色、字体风格 |
| `brand-guidelines` | Anthropic 品牌视觉规范 | 品牌色、品牌设计 |
| `mobile-android-design` | Material Design 3 + Jetpack Compose | Android、MD3、Compose、原生应用 |
| `web-design-guidelines` | UI/UX 代码审查与无障碍合规检查 | review UI、审查、accessibility |
| `docx` | 创建/编辑 Word 文档 | `.docx`、Word 文档、报告 |
| `pdf` | PDF 处理（读写/合并/拆分） | `.pdf`、PDF 操作 |
| `pptx` | 创建/编辑 PPT 演示文稿 | `.pptx`、slides、幻灯片 |
| `doc-coauthoring` | 协作撰写文档的结构化工作流 | 写文档、技术规范、proposal |
| `internal-comms` | 企业内部通讯写作 | 周报、通告、FAQ、incident |
| `mcp-builder` | 构建 MCP Server | MCP、Model Context Protocol |
| `skill-creator` | 创建新的 Skill | 创建 skill、扩展能力 |
| `slack-gif-creator` | 生成 Slack 用动态 GIF | GIF、Slack 表情、动图 |
| `web-artifacts-builder` | 构建 Web 产物 | HTML artifact、网页小工具 |
| `webapp-testing` | Web 应用 E2E 测试（Playwright） | 测试、e2e、自动化测试 |
| `pdf`（表单） | PDF 表单填写与提取 | 表单、fillable fields |

---

## 🧠 通用开发工作流 Skill

### `brainstorming`
**何时使用：** 进行任何创造性工作（新增功能、构建组件、修改行为）之前，**必须**先使用。  
**场景举例：**
- 开发新功能前梳理需求和设计方案
- 不确定怎么实现时，先通过对话探索方向
- 设计组件结构、数据流、交互逻辑
- 把模糊的想法变成具体的规格文档

> ⚠️ 这是一个**前置 Skill**，先用它理清思路，再动手写代码。

---

### `systematic-debugging`
**何时使用：** 遇到任何 bug、测试失败或意外行为时，在提出修复方案之前使用。  
**场景举例：**
- 代码行为与预期不符，找不到原因
- 修了一个 bug 又引发新 bug
- 测试用例失败，原因不明
- 需要系统性地定位问题根源，而不是乱猜

> ⚠️ 与 `vue-debug-guides` 的区别：本 skill 是**通用**的系统化调试方法论，后者专注于 Vue 生态的具体报错场景。

---

## 🟩 Vue 系列 Skill（日常开发最常用）

### `vue-best-practices`
**何时使用：** 任何 Vue 3 开发任务都应默认加载。  
**场景举例：**
- 写 `.vue` 单文件组件
- 用 `<script setup>` + Composition API
- 使用 Vite、Volar、vue-tsc
- 与 Vue Router、Pinia 配合开发

> ⚠️ 默认使用 Composition API，除非项目明确要求 Options API。

---

### `vue-debug-guides`
**何时使用：** 遇到 Vue 运行时报错、警告、或难以排查的 bug 时。  
**场景举例：**
- 控制台出现 Vue warning / error
- SSR hydration 不匹配问题
- async 组件加载失败
- 响应式数据不更新

---

### `vue-pinia-best-practices`
**何时使用：** 涉及 Pinia 状态管理的任何工作。  
**场景举例：**
- 创建/设计 store
- 跨组件共享状态
- store 中的异步 action
- 调试状态响应性问题

---

### `vue-router-best-practices`
**何时使用：** 涉及路由配置与导航的任何工作。  
**场景举例：**
- 配置路由表、嵌套路由
- 编写导航守卫（beforeEach、beforeEnter）
- 获取 route params / query
- 路由懒加载

---

### `vue-options-api-best-practices`
**何时使用：** 维护老项目或要求 Options API 风格时。  
**场景举例：**
- 使用 `data()`、`methods`、`computed`、`watch`
- 使用 `this.xxx` 访问组件数据
- Vue 2 迁移 Vue 3 时的过渡期

---

### `vue-jsx-best-practices`
**何时使用：** 在 Vue 中使用 JSX 编写 render 函数时。  
**场景举例：**
- 动态组件、render 函数
- `class` vs `className` 等 JSX 语法差异
- 配置 `@vitejs/plugin-vue-jsx`

---

### `create-adaptable-composable`
**何时使用：** 需要创建高复用性的 Vue composable（支持传入普通值、ref、getter）时。  
**场景举例：**
- 封装 `useFetch`、`useDebounce` 等通用 hooks
- 参数需要同时支持静态值和响应式 ref
- 使用 `MaybeRef` / `toValue()` / `toRef()` 模式

---

### `vue-testing-best-practices`
**何时使用：** 编写或调试 Vue 组件测试、单元测试时。  
**场景举例：**
- 使用 Vitest 编写单元测试
- 使用 Vue Test Utils 挂载和测试组件
- 模拟（mock）Pinia store、路由、异步请求
- 使用 Playwright 编写 E2E 测试

> ⚠️ 与 `webapp-testing` 的区别：本 skill 专注 Vue 生态的测试模式（Vitest + Vue Test Utils），后者更侧重通用 Web E2E 测试。

---

## 🎨 设计与视觉 Skill

### `frontend-design`
**何时使用：** 需要高质量、有设计感的前端界面时（避免"AI 感"）。  
**场景举例：**
- 设计 landing page、Dashboard、营销页
- 制作 HTML/CSS/React 组件
- 需要创意配色、排版、动效

---

### `canvas-design`
**何时使用：** 需要输出静态视觉作品（PNG 图片或 PDF）时。  
**场景举例：**
- 制作海报、封面、宣传图
- 生成视觉风格说明文档

---

### `algorithmic-art`
**何时使用：** 用代码生成艺术画面时（p5.js）。  
**场景举例：**
- 生成 flow field、粒子系统、分形
- 探索参数化视觉效果
- 输出 `.html`（交互式预览）+ `.js`（算法） + `.md`（美学说明）

---

### `theme-factory`
**何时使用：** 为已有作品（文档、PPT、HTML 页面）快速套用统一视觉主题时。  
**场景举例：**
- 为 slides 套用配色方案
- 为报告指定字体+色调
- 10 种预设主题可直接调用，也可临时生成新主题

---

### `brand-guidelines`
**何时使用：** 需要遵循 Anthropic 品牌视觉规范时（一般不常用于个人项目）。  
**场景举例：**
- 制作符合公司品牌色的设计稿
- 套用官方字体和排版规范

---

### `mobile-android-design`
**何时使用：** 开发或设计原生 Android 应用界面时。  
**场景举例：**
- 使用 Jetpack Compose 构建 UI 组件
- 应用 Material Design 3（Material You）设计规范
- 设计自适应布局、动态配色（Dynamic Color）
- 遵循 Google 的 Android 界面设计指导原则

---

### `web-design-guidelines`
**何时使用：** 需要对现有前端代码进行 UI/UX 合规审查时。  
**场景举例：**
- 检查页面的无障碍性（Accessibility / WCAG 合规）
- 审查组件是否符合 Web 界面最佳实践
- 评估 UX 交互设计的合理性
- 对照规范 audit 现有网站的设计

---

## 📄 文档与文件处理 Skill

### `docx`
**何时使用：** 需要创建或操作 Word 文档（`.docx`）时。  
**场景举例：**
- 生成带目录、标题、页码的专业报告
- 编辑/替换 Word 文档中的内容
- 处理追踪修改（Track Changes）、注释
- 将内容输出为正式 Word 文件

---

### `pdf`
**何时使用：** 任何涉及 PDF 文件的操作。  
**场景举例：**
- 提取 PDF 文字、表格内容
- 合并多个 PDF，或拆分 PDF 页面
- 填写 PDF 表单、加水印、加密
- 对扫描 PDF 进行 OCR

---

### `pptx`
**何时使用：** 任何涉及 PPT 演示文稿（`.pptx`）的操作。  
**场景举例：**
- 创建 pitch deck、课程 slides
- 解析/提取现有 PPT 内容
- 修改幻灯片布局、备注、模板

---

### `doc-coauthoring`
**何时使用：** 需要结构化地协作撰写文档（而不是直接生成）时。  
**场景举例：**
- 写技术设计文档（TDD）、PRD、RFC
- 写项目提案、决策文档
- 需要多轮迭代和读者视角验证的文档

---

## 💬 沟通与协作 Skill

### `internal-comms`
**何时使用：** 撰写企业内部沟通材料时。  
**场景举例：**
- 周报、进度更新、领导汇报
- 公司通告、Newsletter
- 故障报告（incident report）
- 内部 FAQ 整理

---

## 🔧 工具与技术 Skill

### `mcp-builder`
**何时使用：** 开发 MCP（Model Context Protocol）Server 时。  
**场景举例：**
- 用 Python（FastMCP）或 Node.js/TypeScript（MCP SDK）构建服务
- 集成外部 API 作为 LLM 工具
- 设计高质量的 MCP tool 接口

---

### `skill-creator`
**何时使用：** 需要创建一个全新的 Skill 或更新现有 Skill 时。  
**场景举例：**
- 把常用工作流封装成 Skill
- 给 Copilot 添加专业领域知识
- 迭代升级当前 Skill 的描述和内容

---

### `web-artifacts-builder`
**何时使用：** 构建独立运行的 Web 小工具或 HTML artifact 时。  
**场景举例：**
- 生成可直接在浏览器运行的单文件 HTML 工具
- 构建数据可视化、计算器、预览页面

---

### `webapp-testing`
**何时使用：** 为 Web 应用编写或调试测试时。  
**场景举例：**
- 编写 E2E 测试脚本（Playwright/Cypress）
- 单元测试、集成测试
- 自动化回归测试流程

---

### `slack-gif-creator`
**何时使用：** 需要制作 Slack 专用动态 GIF 时。  
**场景举例：**
- 制作自定义 Slack 表情包（emoji GIF）
- 创作用于 Slack 消息的动图
- 需满足 Slack 的尺寸和文件大小限制

---

## 🗂️ 我的项目常用组合

针对**北京绿道系统**项目，最常用的 Skill 组合：

| 场景 | 推荐 Skill |
|------|-----------|
| 新功能/组件开发前规划 | `brainstorming` |
| 遇到难以定位的 bug | `systematic-debugging` |
| 写 Vue 组件、composable | `vue-best-practices` |
| Vue 报错调试 | `vue-debug-guides` |
| Pinia store 设计 | `vue-pinia-best-practices` |
| 路由配置/守卫 | `vue-router-best-practices` |
| 封装通用 composable | `create-adaptable-composable` |
| Vue 组件/单元测试 | `vue-testing-best-practices` |
| 写界面/UI 设计 | `frontend-design` |
| 审查 UI 代码规范 | `web-design-guidelines` |
| Android 端界面开发 | `mobile-android-design` |
| 写项目文档/README | `doc-coauthoring` |
| 生成 Word/PDF 报告 | `docx` / `pdf` |
| 做汇报 PPT | `pptx` + `theme-factory` |
