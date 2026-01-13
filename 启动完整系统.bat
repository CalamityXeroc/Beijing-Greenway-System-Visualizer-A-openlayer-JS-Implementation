@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║    北京绿道系统 - 前后端完整启动脚本              ║
echo ╚════════════════════════════════════════════════════╝
echo.

rem 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ 错误：未检测到 Node.js，请先安装
    echo   下载：https://nodejs.org/
    pause
    exit /b 1
)

echo ⏳ 检查后端配置...
if not exist greenway-backend\.env.local (
    echo.
    echo ✗ 后端配置缺失，请先配置 greenway-backend\.env.local
    echo.
    echo 配置步骤：
    echo   1. cd greenway-backend
    echo   2. cp .env.example .env.local
    echo   3. 编辑 .env.local 填入 PostgreSQL 信息
    echo.
    pause
    exit /b 1
)

echo ✓ 后端配置已找到
echo.

rem 启动后端
cd greenway-backend
echo ⏳ 启动后端服务器 (http://localhost:3000)...
start "Greenway Backend" cmd /k npm run dev

cd ..
timeout /t 3 /nobreak

rem 启动前端
cd greenway-vue
echo ⏳ 启动前端服务器 (http://localhost:5173)...
start "Greenway Frontend" cmd /k npm run dev

cd ..
echo.
echo ═══════════════════════════════════════════════════════
echo ✓ 前后端服务器已启动！
echo.
echo 📍 前端地址：http://localhost:5173
echo 📍 后端地址：http://localhost:3000
echo.
echo 💡 提示：
echo    - 两个新窗口分别运行前后端服务
echo    - 关闭窗口可停止对应服务
echo    - 第一次启动可能需要几分钟初始化
echo ═══════════════════════════════════════════════════════
echo.
pause
