# 更新日志 (Changelog)

所有重要的项目变更都会记录在此文件中。

## [2026-02-14] - 黑夜模式功能发布

### ✨ 新增功能

#### 🌙 全站黑夜模式系统
- **自动主题切换**
  - 根据北京时间自动判断白天/黑夜（6:00-18:00 为日间模式）
  - 使用 `useTheme()` 组件化的全局主题管理
  - localStorage 持久化存储用户偏好

- **手动主题控制**
  - 左上角固定位置的主题切换按钮（圆形图标）
  - 仅在主界面（首页）显示，进入详情页自动隐藏
  - 支持快速切换和自动模式重置

- **完整的UI适配**
  - 白天模式：原始设计的清爽绿色和蓝色配色
  - 夜间模式：深灰黑色背景 (#1a1a1a) 搭配亮灰色文本 (#e8e8e8)
  
- **涵盖全部页面**
  - ✅ 主界面 (GreenwayOverview.vue) - 包含所有卡片和信息区
  - ✅ 14条绿道详情页 - 每条都完整支持黑夜模式
    - WenyuDetail.vue (温榆河)
    - HuanerhuanDetail.vue (环二环)
    - LiangmaheDetail.vue (亮马河)
    - ChangyingDetail.vue (常营)
    - Changping42Detail.vue (昌平42)
    - LiduDetail.vue (丽都)
    - BeiyunheDetail.vue (北运河)
    - NanshaDetail.vue (南沙)
    - AosenDetail.vue (奥森)
    - YingchengDetail.vue (营城建都)
    - SanshanDetail.vue (三山五园)
    - ChaoyangDetail.vue (朝阳)
    - 以及其他页面

#### 🎨 CSS 变量系统
- **日间模式变量** (`[data-theme="day"]`)
  - `--bg-primary`: #ffffff (白色主背景)
  - `--text-primary`: #2c3e50 (深灰色主文本)
  - `--border-color`: #e0e0e0 (浅灰色边框)
  - 其他配色、阴影和组件样式变量

- **夜间模式变量** (`[data-theme="night"]`)
  - `--bg-primary`: #1a1a1a (深灰黑色主背景)
  - `--text-primary`: #e8e8e8 (亮灰色主文本)
  - `--border-color`: #3a3a3a (深灰色边框)
  - 其他相应的深色配色变量

### 🛠️ 技术实现

#### 新增文件
- `src/utils/useTheme.js` - 全局主题管理 composable
  - 自动时间切换逻辑
  - localStorage 持久化
  - 全局状态管理

#### 修改文件
- `src/assets/main.css` - 添加 CSS 变量定义和全局主题样式
- `src/App.vue` - 添加主题切换按钮和控制逻辑
- `src/views/GreenwayOverview.vue` - 添加 scoped 和全局主题样式
- `src/views/WenyuDetail.vue` - 添加 scoped 和全局主题样式
- `src/views/HuanerhuanDetail.vue` - 添加 scoped 和全局主题样式
- `src/views/LiangmaheDetail.vue` - 添加 scoped 和全局主题样式
- `src/views/ChangyingDetail.vue` - 添加 scoped 和全局主题样式
- `src/views/Changping42Detail.vue` - 添加 scoped 和全局主题样式
- `src/views/LiduDetail.vue` - 添加 scoped 和全局主题样式
- `src/views/BeiyunheDetail.vue` - 添加 scoped 和全局主题样式
- `src/views/NanshaDetail.vue` - 添加 scoped 和全局主题样式
- `src/views/AosenDetail.vue` - 添加 scoped 和全局主题样式
- `src/views/YingchengDetail.vue` - 添加 scoped 和全局主题样式
- `src/views/SanshanDetail.vue` - 添加 scoped 和全局主题样式
- `src/views/ChaoyangDetail.vue` - 添加 scoped 和全局主题样式

#### 解决方案
- **Scoped 样式限制**
  - Vue 的 `<style scoped>` 会添加特殊属性导致全局 [data-theme] 选择器失效
  - 在每个组件中添加两个 <style> 块：
    - 第一个 scoped，用于组件内部样式隔离
    - 第二个非 scoped，专门处理主题选择器，确保主题切换正常工作

### 🎯 使用方法

#### 用户操作
1. **自动切换** - 应用会根据当前时间自动切换主题
2. **手动切换** - 点击主界面左上角的圆形主题按钮
3. **记忆偏好** - 应用会记住上次的选择，下次启动保持一致

#### 开发者集成
```javascript
// 在 Vue 组件中使用
import { useTheme } from '@/utils/useTheme'

export default {
  setup() {
    const { theme, toggleTheme, setTheme } = useTheme()
    
    return { theme, toggleTheme, setTheme }
  }
}
```

### 🔒 隐私与安全
- 所有敏感配置继续使用 .env.local 管理
- public/ 文件夹不被上传（git 配置）
- API 密钥和数据库凭证保持私密

### 📊 浏览器兼容性
- Chrome/Edge 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅

### 🚀 性能优化
- 使用 CSS 变量实现高效的主题切换，无需重新渲染
- localStorage 缓存用户偏好，避免重复计算
- 硬件加速优化，保证流畅的视觉体验

### 📝 文档更新
- 更新 README_zh-CN.md，添加黑夜模式功能说明
- 添加 CHANGELOG_zh-CN.md 记录本次更新

## 后续计划

- [ ] 支持更多主题（如高对比度、色弱友好等）
- [ ] 主题编辑器，允许用户自定义颜色
- [ ] 在线配置共享功能
- [ ] 移动端主题持久化优化

---

**项目维护者** | 2026-02-14
