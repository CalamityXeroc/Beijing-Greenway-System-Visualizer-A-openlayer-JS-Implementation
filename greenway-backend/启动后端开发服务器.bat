@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════╗
echo ║     北京绿道系统 - 后端开发服务器启动             ║
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
echo ⚙️  后端服务器启动信息：
echo   - API 地址: http://localhost:3000
echo   - 前端应连接到此服务器获取数据
echo   - 按 Ctrl+C 可停止服务器
echo.

rem 检查数据库
echo ⏳ 检查数据库配置...
if not exist .env.local (
    echo.
    echo ✗ 数据库配置缺失 (.env.local 不存在)
    echo.
    echo 请按以下步骤配置：
    echo   1. 复制 .env.example 为 .env.local
    echo   2. 编辑 .env.local 填入 PostgreSQL 连接信息：
    echo      - DB_HOST=localhost
    echo      - DB_PORT=5432
    echo      - DB_NAME=greenway_db
    echo      - DB_USER=postgres
    echo      - DB_PASSWORD=your_password
    echo   3. 如果是首次使用，运行: npm run db:init
    echo   4. 导入数据：npm run db:import
    echo.
    pause
    exit /b 1
)

echo ✓ 配置文件已找到
echo.
echo ⏳ 正在启动后端服务器...
echo.

call npm run dev
pause
