@echo off
REM 北京绿道系统 - Android 环境检查脚本
REM 检查Java JDK和Android SDK是否正确安装和配置

echo ============================================
echo Android 开发环境检查工具
echo ============================================
echo.

REM 检查 Java
echo [1/4] 检查 Java Development Kit (JDK)...
for /f "tokens=*" %%i in ('java -version 2^>^&1') do set java_output=%%i
if "%java_output%"=="" (
  echo ❌ Java 未安装
  echo 请访问: https://www.oracle.com/java/technologies/downloads/
  echo 推荐安装 JDK 17 或 21
  pause
  exit /b 1
) else (
  echo ✅ Java 已安装: %java_output%
)
echo.

REM 检查 JAVA_HOME
echo [2/4] 检查 JAVA_HOME 环境变量...
if "%JAVA_HOME%"=="" (
  echo ❌ JAVA_HOME 未设置
  echo 手动设置方法:
  echo 1. 打开 系统 ^> 高级系统设置 ^> 环境变量
  echo 2. 新建用户变量: JAVA_HOME
  echo 3. 设置值为 JDK 安装路径，例如: C:\Program Files\Java\jdk-17
  echo.
  set /p java_path="请输入 JDK 安装路径 (或按 Enter 跳过): "
  if not "!java_path!"=="" (
    setx JAVA_HOME "!java_path!"
    echo ✅ JAVA_HOME 已设置为: !java_path!
  )
) else (
  echo ✅ JAVA_HOME 已设置: %JAVA_HOME%
)
echo.

REM 检查 Android SDK
echo [3/4] 检查 Android SDK...
if "%ANDROID_SDK_ROOT%"=="" (
  echo ❌ ANDROID_SDK_ROOT 未设置
  echo.
  echo Android SDK 通常安装在以下位置：
  echo - Windows: %%APPDATA%%\Local\Android\Sdk
  echo   (展开后: C:\Users\YourUsername\AppData\Local\Android\Sdk)
  echo - 或自定义位置 (如通过 Android Studio 安装)
  echo.
  echo 查找 SDK 位置:
  echo 1. 打开 Android Studio
  echo 2. File ^> Settings ^> Appearance ^& Behavior ^> System Settings ^> Android SDK
  echo 3. 在设置页面顶部查看 Android SDK Location
  echo.
  set /p sdk_path="请输入 Android SDK 路径 (或按 Enter 跳过): "
  if not "!sdk_path!"=="" (
    setx ANDROID_SDK_ROOT "!sdk_path!"
    echo ✅ ANDROID_SDK_ROOT 已设置为: !sdk_path!
  )
) else (
  echo ✅ ANDROID_SDK_ROOT 已设置: %ANDROID_SDK_ROOT%
  
  REM 检查关键 SDK 组件
  if exist "%ANDROID_SDK_ROOT%\platforms\android-30" (
    echo ✅ Android API 30 已安装
  ) else (
    echo ⚠️  Android API 30 未安装 (可能需要)
  )
  
  if exist "%ANDROID_SDK_ROOT%\build-tools\30.0.3" (
    echo ✅ Build-Tools 30.0.3 已安装
  ) else (
    echo ⚠️  Build-Tools 30.0.3 未安装 (可能需要)
  )
)
echo.

REM 检查 Gradle
echo [4/4] 检查 Gradle...
cd /d "c:\Users\cheng\Desktop\BST_lab\tryyyyyy\greenway-vue\android"
if exist gradlew (
  echo ✅ Gradle Wrapper 已配置
  echo.
  echo 运行以下命令进行完整检查:
  echo gradlew.bat -version
  echo.
  set /p run_gradle="是否运行 Gradle 版本检查? (Y/N): "
  if /i "!run_gradle!"=="Y" (
    call gradlew.bat -version
  )
) else (
  echo ❌ Gradle Wrapper 未找到
)
echo.

echo ============================================
echo 检查完成
echo ============================================
echo.
echo 后续步骤:
echo 1. 确保所有环境变量已正确设置
echo 2. 重启 PowerShell/CMD 窗口以使用新环境变量
echo 3. 运行: npm run mobile:build:android
echo.
pause
