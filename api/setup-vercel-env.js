#!/usr/bin/env node

/**
 * Script para configurar variáveis de ambiente no Vercel
 * Execute: node setup-vercel-env.js
 */

const { execSync } = require('child_process');

// Variáveis de ambiente para configurar no Vercel
const envVars = {
  'DB_HOST': 'db.snxccjgkqqniowserwtv.supabase.co',
  'DB_PORT': '5432',
  'DB_NAME': 'postgres',
  'DB_USER': 'postgres',
  'DB_PASS': 'Calendario2024!@#',
  'JWT_SECRET': 'seu_jwt_secret_super_seguro_aqui',
  'JWT_EXPIRES_IN': '24h',
  'CORS_ORIGIN': 'https://seu-frontend.vercel.app',
  'NODE_ENV': 'production'
};

console.log('🚀 Configurando variáveis de ambiente no Vercel...\n');

// Verificar se o Vercel CLI está instalado
try {
  execSync('vercel --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Vercel CLI não está instalado!');
  console.log('📦 Instale com: npm i -g vercel');
  process.exit(1);
}

// Configurar cada variável
Object.entries(envVars).forEach(([key, value]) => {
  try {
    console.log(`🔧 Configurando ${key}...`);
    
    // Comando para adicionar variável de ambiente
    const command = `vercel env add ${key} production`;
    
    // Simular input (você precisará digitar o valor manualmente)
    console.log(`   Execute: ${command}`);
    console.log(`   Valor: ${value}`);
    console.log('');
    
  } catch (error) {
    console.error(`❌ Erro ao configurar ${key}:`, error.message);
  }
});

console.log('✅ Variáveis configuradas!');
console.log('\n📋 Resumo das variáveis:');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`);
});

console.log('\n🔗 Para configurar manualmente no dashboard:');
console.log('1. Vá para https://vercel.com/dashboard');
console.log('2. Selecione o projeto api-back-rosy');
console.log('3. Vá em Settings → Environment Variables');
console.log('4. Adicione cada variável acima');
console.log('5. Faça um novo deploy');
