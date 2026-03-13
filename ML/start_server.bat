@echo off
echo ========================================
echo Starting ThinkMap ML Service
echo ========================================
echo.
cd /d %~dp0
python run_server.py
pause
