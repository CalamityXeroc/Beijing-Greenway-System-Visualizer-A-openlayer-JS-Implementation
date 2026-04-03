# GitHub 上传说明

## 📤 上传到 GitHub

### 方法1: 使用自动脚本（推荐）

直接运行脚本：
```cmd
upload-to-github.bat
```

### 方法2: 手动执行命令

```bash
# 1. 配置Git用户
git config user.email "2749955791@qq.com"
git config user.name "CalamityXeroc"

# 2. 添加文件
git add .

# 3. 提交
git commit -m "feat: 移动端UI全面升级与后端连接优化

- 🎨 全新移动端UI设计：采用现代化iOS+微信混合风格
- 📱 新增发现页：轮播图、快速入口、热门绿道、社区动态
- 👤 重设计个人中心：现代化英雄区、渐变背景、卡片式布局
- ⚙️ 新增设置页：账号安全、通知、隐私、网络诊断
- 💬 优化我的评论页：现代UI、气泡样式、点赞统计
- 🛡️ 新增管理功能：用户管理、评论管理、数据统计
- 🔍 增强诊断工具：应用内网络诊断、详细日志、快速测试
- 🎨 扩展设计系统：500+行现代组件样式、玻璃卡片、骨架屏
- 🔧 修复后端网络接口选择：自动选择正确WLAN地址
- 📝 完善项目文档：部署指南、结构说明、清理报告
- 🧹 项目结构优化：清理冗余文件，保留核心功能"

# 4. 推送
git push -u origin main
```

## 🔒 隐私保护

以下文件/文件夹已通过 .gitignore 排除，不会上传到 GitHub：

### 敏感信息
- ✅ `.env` 和 `.env.local` - 环境变量配置
- ✅ 所有包含密码、密钥的配置文件

### 大型资源文件
- ✅ `绿道资料/` - 项目资料
- ✅ `模板/` - 模板文件
- ✅ `示例图片/` - 示例资源
- ✅ `敏感词汇表/` - 词库
- ✅ `greenway-vue/public/` - 公共资源（除 .gitkeep）
- ✅ `greenway-vue/public/数据/` - GeoJSON数据

### 依赖和构建产物
- ✅ `node_modules/` - 依赖包
- ✅ `dist/`, `build/` - 构建产物
- ✅ `*.log` - 日志文件

### 开发工具
- ✅ `.vscode/` - VSCode配置（除 extensions.json）
- ✅ `.agents/` - AI助手配置
- ✅ `.claude/` - Claude配置

## ⚠️ 可能遇到的问题

### 问题1: Authentication failed

**原因**: GitHub不再支持密码认证

**解决方案A**: 使用Personal Access Token
1. 访问 https://github.com/settings/tokens
2. 生成新token（勾选 `repo` 权限）
3. 使用token推送：
```bash
git push https://YOUR_TOKEN@github.com/CalamityXeroc/Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation.git main
```

**解决方案B**: 配置SSH密钥（推荐）
1. 生成SSH密钥：
```bash
ssh-keygen -t ed25519 -C "2749955791@qq.com"
```
2. 添加公钥到GitHub: https://github.com/settings/keys
3. 修改远程地址：
```bash
git remote set-url origin git@github.com:CalamityXeroc/Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation.git
```

### 问题2: rejected (non-fast-forward)

**原因**: 远程仓库有新提交

**解决方案**: 先拉取再推送
```bash
git pull origin main --rebase
git push -u origin main
```

### 问题3: 推送到错误的分支

**解决方案**: 确认分支
```bash
# 查看当前分支
git branch

# 切换到main分支
git checkout main

# 或切换到master分支
git checkout master
```

## ✅ 上传后验证

1. **访问仓库**: https://github.com/CalamityXeroc/Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation

2. **检查提交历史**: 
   - 点击 "Commits"
   - 查看最新提交信息

3. **验证文件**:
   - 确认源代码已上传
   - 确认敏感文件未上传（.env, 绿道资料等）
   - 确认文档完整（README.md, 部署指南.md等）

4. **检查.gitignore**:
   - 确认排除规则正确生效
   - 验证大文件未被提交

## 📝 后续维护

### 日常提交
```bash
git add .
git commit -m "类型: 简短描述"
git push
```

### 提交类型规范
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

### 创建新分支
```bash
# 创建开发分支
git checkout -b dev

# 创建功能分支
git checkout -b feature/新功能名称

# 推送新分支
git push -u origin 分支名
```

## 📊 上传内容概览

### 将被上传的核心文件
- ✅ `greenway-backend/src/` - 后端源代码
- ✅ `greenway-vue/src/` - 前端源代码
- ✅ `README.md` - 项目主文档
- ✅ `部署指南.md` - 部署说明
- ✅ `PROJECT_STRUCTURE.md` - 项目结构
- ✅ `package.json` - 依赖配置
- ✅ 核心脚本（start-backend.bat等）

### 不会上传的文件
- ❌ `.env.local` - 环境变量
- ❌ `node_modules/` - 依赖包
- ❌ `绿道资料/` - 项目资料
- ❌ `public/` - 公共资源
- ❌ 敏感词汇表、模板等

---

**准备完毕！**运行 `upload-to-github.bat` 即可上传到GitHub。
