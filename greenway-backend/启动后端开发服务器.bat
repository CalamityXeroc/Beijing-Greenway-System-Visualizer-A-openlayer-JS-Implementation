@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ========================================================
echo     北京绿道系统 - 后端开发服务器启动
echo ========================================================
echo.

rem 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] 错误：未检测到 Node.js，请先安装
    echo     下载: https://nodejs.org/
    pause
    exit /b 1
)

rem 检查依赖
if not exist node_modules (
    echo [INFO] 首次运行，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [X] 依赖安装失败
        pause
        exit /b 1
    )
)

echo [OK] Node.js 已检测
echo.

rem 检查配置文件
if not exist .env.local (
    echo [X] 数据库配置缺失 (.env.local 不存在)
    echo.
    echo 配置步骤:
    echo   1. 复制 .env.example 为 .env.local
    echo      copy .env.example .env.local
    echo.
    echo   2. 编辑 .env.local 填入 PostgreSQL 信息:
    echo      DB_HOST=localhost
    echo      DB_PORT=5432
    echo      DB_NAME=greenway
    echo      DB_USER=postgres
    echo      DB_PASSWORD=postgres
    echo.
    echo   3. 首次使用初始化数据库:
    echo      npm run db:init
    echo.
    pause
    exit /b 1
)

echo [OK] 配置文件已找到
echo.
echo ========================================================
echo     启动信息:
echo     - API 地址: http://localhost:3001
echo     - 健康检查: http://localhost:3001/health
echo     - 按 Ctrl+C 停止服务器
echo ========================================================
echo.

npm run dev
pause

