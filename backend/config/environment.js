const path = require('path');
const fs = require('fs');

/**
 * Carrega as configurações de ambiente baseado no NODE_ENV
 * Prioridade: .env.{NODE_ENV} > .env > variáveis do sistema
 */
function loadEnvironmentConfig() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    // Caminhos dos arquivos de configuração
    const envFiles = [
        path.join(__dirname, '..', `.env.${nodeEnv}`),
        path.join(__dirname, '..', '.env')
    ];
    
    console.log(`🔧 Carregando configurações para ambiente: ${nodeEnv}`);
    
    // Carrega o arquivo de ambiente específico
    for (const envFile of envFiles) {
        if (fs.existsSync(envFile)) {
            console.log(`✅ Carregando: ${envFile}`);
            require('dotenv').config({ path: envFile });
            break;
        }
    }
    
    // Validação das variáveis obrigatórias
    const requiredVars = [
        'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS',
        'JWT_SECRET', 'PORT'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
        missingVars.forEach(varName => console.error(`   - ${varName}`));
        process.exit(1);
    }
    
    console.log('✅ Todas as variáveis de ambiente carregadas com sucesso!');
    console.log(`📊 Ambiente: ${nodeEnv}`);
    console.log(`🗄️  Banco: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    console.log(`🌐 CORS: ${process.env.CORS_ORIGIN}`);
    console.log(`🚀 Porta: ${process.env.PORT}`);
}

module.exports = { loadEnvironmentConfig };
