@echo off
start "Emulator Window Guardian" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0emulator-window-guardian.ps1" -WaitSeconds 45
echo Emulator initial-position guard started.
