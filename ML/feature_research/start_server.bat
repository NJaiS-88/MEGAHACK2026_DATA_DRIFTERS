@echo off
echo Starting Guided Concept Exploration Engine...
echo.
cd /d "%~dp0"
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
