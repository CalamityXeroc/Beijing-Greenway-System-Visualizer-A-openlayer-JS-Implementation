@echo off
chcp 65001 >nul
echo ========================================
echo 上传项目到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [1/7] 配置Git用户信息...
git config user.email "2749955791@qq.com"
git config user.name "CalamityXeroc"
echo    用户邮箱: 2749955791@qq.com
echo    用户名称: CalamityXeroc
echo    ✓ 配置完成

echo.
echo [2/7] 检查Git仓库状态...
git status

echo.
echo [3/7] 添加文件到暂存区...
git add .
if errorlevel 1 (
    echo    ✗ 添加失败
    pause
    exit /b 1
)
echo    ✓ 文件已添加

echo.
echo [4/7] 提交更新...
git commit -m "feat: 移动端UI全面升级与后端连接优化" -m "- 🎨 全新移动端UI设计：采用现代化iOS+微信混合风格" -m "- 📱 新增发现页：轮播图、快速入口、热门绿道、社区动态" -m "- 👤 重设计个人中心：现代化英雄区、渐变背景、卡片式布局" -m "- ⚙️ 新增设置页：账号安全、通知、隐私、网络诊断" -m "- 💬 优化我的评论页：现代UI、气泡样式、点赞统计" -m "- 🛡️ 新增管理功能：用户管理、评论管理、数据统计" -m "- 🔍 增强诊断工具：应用内网络诊断、详细日志、快速测试" -m "- 🎨 扩展设计系统：500+行现代组件样式、玻璃卡片、骨架屏" -m "- 🔧 修复后端网络接口选择：自动选择正确WLAN地址" -m "- 📝 完善项目文档：部署指南、结构说明、清理报告" -m "- 🧹 项目结构优化：清理冗余文件，保留核心功能"
if errorlevel 1 (
    echo    ✗ 提交失败或没有更改
    pause
    exit /b 1
)
echo    ✓ 提交成功

echo.
echo [5/7] 检查远程仓库配置...
git remote -v

echo.
echo [6/7] 确认远程仓库...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo    远程仓库未配置，正在添加...
    git remote add origin https://github.com/CalamityXeroc/Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation.git
    if errorlevel 1 (
        echo    ✗ 添加远程仓库失败
        pause
        exit /b 1
    )
    echo    ✓ 远程仓库已添加
) else (
    echo    ✓ 远程仓库已配置
)

echo.
echo [7/7] 推送到GitHub...
echo.
echo 正在推送到 main 分支...
git push -u origin main
if errorlevel 1 (
    echo.
    echo 推送 main 分支失败，尝试推送到 master 分支...
    git push -u origin master
    if errorlevel 1 (
        echo.
        echo ========================================
        echo ⚠️ 推送失败
        echo ========================================
        echo.
        echo 可能的原因:
        echo 1. 需要GitHub访问令牌（Personal Access Token）
        echo 2. 网络连接问题
        echo 3. 权限问题
        echo.
        echo 解决方案:
        echo 1. 获取GitHub访问令牌:
        echo    https://github.com/settings/tokens
        echo.
        echo 2. 使用令牌推送:
        echo    git push https://YOUR_TOKEN@github.com/CalamityXeroc/Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation.git main
        echo.
        echo 3. 或配置SSH密钥（推荐）
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo ✓ 上传完成！
echo ========================================
echo.
echo 项目已成功推送到GitHub
echo 仓库地址: https://github.com/CalamityXeroc/Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation
echo.
echo 查看提交记录:
echo https://github.com/CalamityXeroc/Beijing-Greenway-System-Visualizer-A-openlayer-JS-Implementation/commits
echo.
pause
