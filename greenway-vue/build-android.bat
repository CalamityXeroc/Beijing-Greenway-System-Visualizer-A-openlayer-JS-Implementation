@echo off
REM Beijing Greenway System - Android APK Build Script
REM Quick Android Debug/Release APK build tool for Windows

setlocal enabledelayedexpansion

echo ====================================================
echo Beijing Greenway System - Android Build Tool
echo ====================================================
echo.

REM Check Java
echo [1/4] Checking Java installation...
java -version >nul 2>&1
if errorlevel 1 (
  echo Error: Java not found. Please install JDK 17 or higher.
  echo Download from: https://www.oracle.com/java/technologies/downloads/
  pause
  exit /b 1
)
echo OK - Java is installed
echo.

REM Install dependencies
echo [2/4] Installing npm dependencies...
call npm install
if errorlevel 1 (
  echo Error: npm install failed
  pause
  exit /b 1
)
echo OK - Dependencies installed
echo.

REM Build Web version
echo [3/4] Building Web version...
call npm run build
if errorlevel 1 (
  echo Error: Web build failed
  pause
  exit /b 1
)
echo OK - Web build completed
echo.

REM Sync Capacitor
echo [4/4] Syncing Capacitor resources...
call npx cap sync android
if errorlevel 1 (
  echo Error: Capacitor sync failed
  pause
  exit /b 1
)
echo OK - Capacitor sync completed
echo.

REM Menu
echo ====================================================
echo Select build type:
echo ====================================================
echo 1. Build Debug APK (for development/testing)
echo 2. Build Release APK (for Google Play Store)
echo 3. Install Debug APK on device/emulator
echo 4. Open Android Studio
echo 5. Exit
echo ====================================================
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
  echo.
  echo Building Debug APK...
  cd android
  call gradlew.bat assembleDebug
  if errorlevel 1 (
    echo Error: Debug build failed
    cd ..
    pause
    exit /b 1
  )
  echo OK - Debug APK built successfully
  echo Location: app\build\outputs\apk\debug\app-debug.apk
  cd ..
  pause
) else if "%choice%"=="2" (
  echo.
  echo Building Release APK...
  cd android
  call gradlew.bat assembleRelease
  if errorlevel 1 (
    echo Error: Release build failed
    cd ..
    pause
    exit /b 1
  )
  echo OK - Release APK built successfully
  echo Location: app\build\outputs\apk\release\app-release.apk
  cd ..
  pause
) else if "%choice%"=="3" (
  echo.
  echo Installing on device/emulator...
  cd android
  call gradlew.bat installDebug
  if errorlevel 1 (
    echo Error: Installation failed
    cd ..
    pause
    exit /b 1
  )
  echo OK - App installed successfully
  echo Note: Enable USB Debugging on your device
  cd ..
  pause
) else if "%choice%"=="4" (
  echo.
  echo Opening Android Studio...
  start "" android
  exit /b 0
) else if "%choice%"=="5" (
  echo Goodbye!
  exit /b 0
) else (
  echo Error: Invalid choice. Please enter 1-5.
  pause
  exit /b 1
)

echo.
echo Done!
pause
