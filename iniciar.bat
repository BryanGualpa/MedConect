@echo off
:: MedConnect — Script de Inicialización del Sistema
:: Diseñado para entorno Windows (CMD)

echo ===================================================
echo     MedConnect - INICIALIZANDO SERVIDORES
echo ===================================================
echo.

echo [1/2] Asegurando que la base de datos de Docker este arriba...
call docker-compose up -d db

echo.
echo [2/2] Iniciando servidores de desarrollo en ventanas separadas...

:: Levantar el backend en una nueva terminal de CMD
start "MedConnect - Backend" cmd /c "cd medconnect-backend && npm run dev"

:: Levantar el frontend en una nueva terminal de CMD
start "MedConnect - Frontend" cmd /c "cd medconnect-frontend && npm start"

echo.
echo ===================================================
echo   Servidores iniciados en segundo plano:
echo   - Frontend: http://localhost:3000
echo   - Backend: http://localhost:5000
echo   - Swagger (API Docs): http://localhost:5000/api-docs
echo ===================================================
echo.
timeout /t 5
