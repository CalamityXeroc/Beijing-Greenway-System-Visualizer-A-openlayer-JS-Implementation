@echo off
setlocal

set SDK=C:\Users\cheng\AppData\Local\Android\Sdk
set ADB=%SDK%\platform-tools\adb.exe
set EMU=%SDK%\emulator\emulator.exe
set AVD=Medium_Phone_API_36.1

echo [1/4] Stop old emulator/adb processes...
taskkill /F /IM emulator.exe >nul 2>nul
taskkill /F /IM qemu-system-x86_64.exe >nul 2>nul
taskkill /F /IM adb.exe >nul 2>nul

echo [2/4] Start adb server...
"%ADB%" start-server

echo [3/4] Launch emulator in stable mode...
start "Emulator Window Guardian" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0emulator-window-guardian.ps1" -WaitSeconds 45
start "Android Emulator" "%EMU%" -avd "%AVD%" -no-snapshot-load -gpu angle_indirect

echo [4/4] Waiting for device to come online...
"%ADB%" wait-for-device
"%ADB%" devices -l

echo Done.
endlocal
