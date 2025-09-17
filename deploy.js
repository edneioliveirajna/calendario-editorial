const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script de Deploy Automático
 * Cria uma versão de produção sem afetar o ambiente local
 */

console.log('🚀 ========================================');
console.log('🚀 SISTEMA DE DEPLOY AUTOMÁTICO');
console.log('🚀 ========================================');

const deployDir = path.join(__dirname, 'deploy');
const backendDir = path.join(deployDir, 'backend');
const frontendDir = path.join(deployDir, 'frontend');

// Função para copiar arquivos excluindo node_modules
function copyDirectory(src, dest, exclude = []) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    
    for (const item of items) {
        if (exclude.includes(item)) continue;
        
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        const stat = fs.statSync(srcPath);
        
        if (stat.isDirectory()) {
            copyDirectory(srcPath, destPath, exclude);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    console.log('📁 Criando diretório de deploy...');
    
    // Remove deploy anterior se existir
    if (fs.existsSync(deployDir)) {
        fs.rmSync(deployDir, { recursive: true, force: true });
    }
    
    // Cria estrutura de deploy
    fs.mkdirSync(deployDir, { recursive: true });
    
    console.log('📦 Copiando backend...');
    copyDirectory('./backend', backendDir, ['node_modules', '.env']);
    
    console.log('📦 Copiando frontend...');
    copyDirectory('./frontend', frontendDir, ['node_modules', 'dist', '.env']);
    
    // Copia arquivos de configuração de produção
    console.log('⚙️ Configurando ambiente de produção...');
    fs.copyFileSync('./backend/.env.production', path.join(backendDir, '.env'));
    fs.copyFileSync('./frontend/.env.production', path.join(frontendDir, '.env'));
    
    // Instala dependências do backend
    console.log('📥 Instalando dependências do backend...');
    execSync('npm install --production', { 
        cwd: backendDir, 
        stdio: 'inherit' 
    });
    
    // Instala dependências e builda o frontend
    console.log('📥 Instalando dependências do frontend...');
    execSync('npm install', { 
        cwd: frontendDir, 
        stdio: 'inherit' 
    });
    
    console.log('🏗️ Buildando frontend para produção...');
    execSync('npm run build', { 
        cwd: frontendDir, 
        stdio: 'inherit' 
    });
    
    // Cria script de inicialização para produção
    const startScript = `@echo off
echo ========================================
echo 🚀 INICIANDO SISTEMA EM PRODUÇÃO
echo ========================================
echo.

echo 🔧 Iniciando Backend...
start "Backend PROD" cmd /k "cd backend && node index.js"

echo ⏳ Aguardando backend...
timeout /t 5 /nobreak >nul

echo 🌐 Servindo Frontend...
start "Frontend PROD" cmd /k "cd frontend && npm run preview"

echo.
echo ✅ Sistema em produção iniciado!
echo ========================================
pause`;
    
    fs.writeFileSync(path.join(deployDir, 'start-production.bat'), startScript);
    
    console.log('✅ ========================================');
    console.log('✅ DEPLOY CONCLUÍDO COM SUCESSO!');
    console.log('✅ ========================================');
    console.log('📁 Arquivos de produção em: ./deploy/');
    console.log('🚀 Para iniciar produção: cd deploy && start-production.bat');
    console.log('✅ ========================================');
    
} catch (error) {
    console.error('❌ Erro durante o deploy:', error.message);
    process.exit(1);
}
