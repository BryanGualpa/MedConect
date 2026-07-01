@echo off
:: MedConnect — Script de Configuración e Instalación Automatizada
:: Diseñado para entorno Windows (CMD)

echo ===================================================
echo      MedConnect - INSTALACION DE DEPENDENCIAS
echo ===================================================
echo.

echo [1/4] Instalando dependencias del BACKEND...
cd medconnect-backend
call npm install
if not exist .env (
    echo Creando archivo .env desde la plantilla...
    copy .env.example .env
    :: Cambiar la contraseña por defecto de desarrollo en el nuevo .env
    powershell -Command "(gc .env) -replace 'tu_password', 'medconnect_dev_password' | Out-File -encoding ASCII .env"
)
cd ..

echo.
echo [2/4] Instalando dependencias del FRONTEND...
cd medconnect-frontend
call npm install
cd ..

echo.
echo [3/4] Iniciando contenedor de base de datos PostgreSQL en Docker...
call docker-compose up -d db

echo.
echo [4/4] Ejecutando migraciones y generando cliente Prisma...
cd medconnect-backend
call npx prisma generate
call npx prisma migrate dev --name init
cd ..

echo.
echo ===================================================
echo   Instalacion completada con exito.
echo   Para iniciar el sistema ejecute: iniciar.bat
echo ===================================================
echo.
pause
