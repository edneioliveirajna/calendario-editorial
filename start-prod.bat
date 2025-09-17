@echo off
echo ========================================
echo 🚀 INICIANDO SISTEMA CALENDARIO - PRODUÇÃO
echo ========================================
echo.

echo 🔧 Iniciando Backend PRODUÇÃO (porta 3001)...
start "Backend PROD" cmd /k "cd backend && npm run start:prod"

echo ⏳ Aguardando backend inicializar...
timeout /t 5 /nobreak >nul

echo 🌐 Iniciando Frontend PRODUÇÃO (porta 8080)...
start "Frontend PROD" cmd /k "cd frontend && npm run dev:prod"

echo.
echo ✅ Sistema PRODUÇÃO iniciado com sucesso!
echo.
echo 📍 URLs de acesso PRODUÇÃO:
echo    Frontend: http://localhost:8080 (modo produção)
echo    Backend:  http://localhost:3001 (modo produção)
echo.
echo 🔑 Credenciais de teste:
echo    Email: admin@planitglow.com
echo    Senha: 123456
echo.
echo ========================================
pause
