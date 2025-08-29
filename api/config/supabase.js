const { Pool } = require('pg');
require('dotenv').config();

// Configuração específica para Supabase
const supabaseConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'db.xxxxxxxxxxxxx.supabase.co',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASS || 'sua_senha_supabase',
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false
    },
    // Configurações para resolver problema de DNS
    family: 6,
    lookup: (hostname, options, callback) => {
        // Forçar resolução IPv6
        const dns = require('dns');
        dns.lookup(hostname, { family: 6 }, callback);
    },
    // Configurações de conexão mais robustas
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // Tentar múltiplas tentativas de conexão
    retryDelay: 1000,
    maxRetries: 3,
};

// Pool de conexões
const pool = new Pool(supabaseConfig);

// Testar conexão
pool.on('connect', () => {
    console.log('✅ Conectado ao Supabase PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Erro na conexão Supabase:', err);
});

// Função para testar conexão
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Teste de conexão Supabase:', result.rows[0]);
        return true;
    } catch (error) {
        console.error('❌ Erro no teste de conexão:', error);
        return false;
    }
};

module.exports = { pool, testConnection };
