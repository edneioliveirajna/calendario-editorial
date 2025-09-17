@echo off
echo ========================================
echo 🚀 INICIANDO SISTEMA CALENDARIO - LOCAL
echo ========================================
echo.

echo 🔧 Iniciando Backend LOCAL (porta 3001)...
start "Backend LOCAL" cmd /k "cd backend && npm run start:dev"

echo ⏳ Aguardando backend inicializar...
timeout /t 5 /nobreak >nul

echo 🌐 Iniciando Frontend LOCAL (porta 8080)...
start "Frontend LOCAL" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Sistema LOCAL iniciado com sucesso!
echo.
echo 📍 URLs de acesso LOCAL:
echo    Frontend: http://localhost:8080
echo    Backend:  http://localhost:3001
echo.
echo 🔑 Credenciais de teste:
echo    Email: admin@planitglow.com
echo    Senha: 123456
echo.
echo ========================================
pause
