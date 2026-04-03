@echo off
setlocal

echo ============================================
echo 修复后端连接问题并重新部署移动应用
echo ============================================
echo.
echo 修复内容:
echo - API端口修改为 3001
echo - 添加详细日志输出
echo - 添加网络诊断工具
echo.
echo ============================================

echo [1/4] 构建 Web 应用...
call npm run build
if errorlevel 1 (
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo.
echo [2/4] 同步到 Capacitor...
call npx capacitor copy
if errorlevel 1 (
    echo ❌ 同步失败！
    pause
    exit /b 1
)

echo.
echo [3/4] 同步 Android 平台配置...
call npx capacitor sync android
if errorlevel 1 (
    echo ❌ Android 同步失败！
    pause
    exit /b 1
)

echo.
echo [4/4] 部署到模拟器...
echo 正在启动 Android Studio 并安装到模拟器...
call npx capacitor run android
if errorlevel 1 (
    echo ❌ 部署失败！
    pause
    exit /b 1
)

echo.
echo ============================================
echo ✅ 部署完成！
echo.
echo 已修复的问题：
echo - API地址：http://192.168.1.100:3001
echo - 网络安全配置：允许 HTTP 连接
echo - 添加详细控制台日志
echo.
echo 如果仍有问题，请：
echo 1. 确认后端在 192.168.1.100:3001 运行
echo 2. 在应用中访问：设置 ^> 网络诊断
echo 3. 查看浏览器控制台日志（Chrome DevTools）
echo ============================================
pause