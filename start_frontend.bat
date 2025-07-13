@echo off
title NutriChef Frontend Server
echo Starting NutriChef Frontend Server...
echo Frontend will be available at: http://localhost:5173
echo.
cd /d "D:\nutrichef\frontend"
npm run dev
echo.
echo Frontend server stopped.
pause