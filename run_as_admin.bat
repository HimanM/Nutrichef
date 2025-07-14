@echo off
echo Running NutriChef Demo with Administrator privileges...
echo This allows automatic firewall port management for external access.
echo.

:: Check if we're already running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Already running as Administrator.
    echo.
    python main.py
) else (
    echo Requesting Administrator privileges...
    echo.
    powershell -Command "Start-Process python -ArgumentList 'main.py' -Verb RunAs -WorkingDirectory '%cd%'"
)

pause
