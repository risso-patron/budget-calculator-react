@echo off
echo === Corrigiendo nombres de animaciones ===

cd /d "c:\Users\luisr\Repo-de-desarrollo\budget-calculator-react\public\animations"

echo Renombrando Rocket.webp...
if exist Rocket.webp (
    del /f rocket.webp 2>nul
    ren Rocket.webp rocket.webp
)

echo Renombrando Homer.webp...
if exist Homer.webp (
    del /f homer.webp 2>nul
    ren Homer.webp homer.webp
)

echo.
echo === Listando archivos ===
dir /b *.webp

echo.
echo === Limpiando cache de Vite ===
cd /d "c:\Users\luisr\Repo-de-desarrollo\budget-calculator-react"
rmdir /s /q node_modules\.vite 2>nul
rmdir /s /q dist 2>nul

echo.
echo === LISTO! ===
echo.
echo AHORA:
echo 1. Cierra COMPLETAMENTE tu navegador (Alt+F4)
echo 2. Ejecuta: npm run dev
echo 3. Abre en modo incognito: Ctrl+Shift+N
echo 4. Ve a: http://localhost:5174
echo.
pause
