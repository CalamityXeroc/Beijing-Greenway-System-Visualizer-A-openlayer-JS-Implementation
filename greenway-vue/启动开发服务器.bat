@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════╗
echo ║     北京绿道系统 - 前端开发服务器启动             ║
echo ╚════════════════════════════════════════════════════╝
echo.

rem 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ 错误：未检测到 Node.js，请先安装 Node.js
    echo   下载地址：https://nodejs.org/
    pause
    exit /b 1
)

rem 检查依赖
if not exist node_modules (
    echo ⏳ 首次运行，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ✗ 依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo ✓ 启动前端开发服务器...
echo   访问地址: http://localhost:5173
echo   按 Ctrl+C 可停止服务器
echo.

call npm run dev
pause
