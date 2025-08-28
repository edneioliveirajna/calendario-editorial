@echo off
echo ========================================
echo 🚀 INICIANDO SISTEMA CALENDARIO
echo ========================================
echo.

echo 🔧 Iniciando Backend (porta 3001)...
start "Backend" cmd /k "cd backend && npm start"

echo ⏳ Aguardando backend inicializar...
timeout /t 5 /nobreak >nul

echo 🌐 Iniciando Frontend (porta 8080)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Sistema iniciado com sucesso!
echo.
echo 📍 URLs de acesso:
echo    Frontend: http://localhost:8080
echo    Backend:  http://localhost:3001
echo.
echo 🔑 Credenciais de teste:
echo    Email: admin@planitglow.com
echo    Senha: 123456
echo.
echo ========================================
pause
