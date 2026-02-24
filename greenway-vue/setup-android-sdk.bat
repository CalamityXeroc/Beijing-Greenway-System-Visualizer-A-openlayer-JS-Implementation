@echo off
REM Android SDK Quick Setup Tool
REM Automatically finds and configures Android SDK path

setlocal enabledelayedexpansion

echo ====================================================
echo Android SDK Configuration Tool
echo ====================================================
echo.

REM Search for Android SDK
echo Searching for Android SDK...
echo.

set SDK_FOUND=0
set SDK_PATH=

REM Check common locations
for %%I in (
  "C:\Users\cheng\AppData\Local\Android\Sdk"
  "C:\Android\sdk"
  "C:\Program Files\Android\Sdk"
  "D:\Android\Sdk"
  "E:\Android\Sdk"
) do (
  if exist %%I (
    set SDK_PATH=%%I
    set SDK_FOUND=1
    echo Found SDK at: !SDK_PATH!
    echo.
    goto :found
  )
)

:notfound
if %SDK_FOUND%==0 (
  echo ERROR: Android SDK not found!
  echo.
  echo Please install Android SDK first:
  echo 1. Download Android Studio: https://developer.android.com/studio
  echo 2. Install and run Android Studio
  echo 3. Complete SDK installation
  echo 4. Run this script again
  echo.
  pause
  exit /b 1
)

:found
echo.
echo ====================================================
echo Configuring Android SDK path...
echo ====================================================
echo.

REM Create or update local.properties
set LOCAL_PROPS=android\local.properties
set SDK_PATH_ESCAPED=!SDK_PATH:\=\\!

echo sdk.dir=!SDK_PATH_ESCAPED! > %LOCAL_PROPS%

echo Configuration saved to: %LOCAL_PROPS%
echo Content: sdk.dir=!SDK_PATH_ESCAPED!
echo.

REM Set environment variable
setx ANDROID_SDK_ROOT "%SDK_PATH%"
setx ANDROID_HOME "%SDK_PATH%"

echo Environment variables set:
echo ✓ ANDROID_SDK_ROOT=%SDK_PATH%
echo ✓ ANDROID_HOME=%SDK_PATH%
echo.

echo ====================================================
echo Configuration complete!
echo ====================================================
echo.
echo Next steps:
echo 1. Close this window
echo 2. Restart PowerShell/CMD
echo 3. Run: .\build-android.bat
echo 4. Choose option 1 to build Debug APK
echo.
pause
