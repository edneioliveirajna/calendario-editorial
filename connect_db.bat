@echo off
echo Conectando no banco PostgreSQL local...
echo.

REM Definir variável de ambiente para não pedir senha
set PGPASSWORD=admin123

REM Conectar no banco e executar comando
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d calendario_editorial -c "\d calendars"

REM Limpar variável de ambiente
set PGPASSWORD=

echo.
echo Comando executado!
pause
