const { pool, testConnection } = require('./supabase');

// Testar conexão ao inicializar
testConnection();

module.exports = pool;
