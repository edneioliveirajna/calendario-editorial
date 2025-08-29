const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API do Calendário Editorial funcionando no Vercel!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: 'production',
        endpoints: {
            auth: '/api/auth',
            calendars: '/api/calendars',
            tasks: '/api/tasks',
            notes: '/api/notes'
        }
    });
});

// Rota de status
app.get('/status', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'production'
    });
});

// Rota de teste de banco de dados
app.get('/test-db', async (req, res) => {
    try {
        const pool = require('./config/database');
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, version() as db_version');
        client.release();
        
        res.json({
            success: true,
            message: '✅ Conexão com banco funcionando!',
            database: {
                current_time: result.rows[0].current_time,
                version: result.rows[0].db_version
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro na conexão com banco:', error);
        res.status(500).json({
            success: false,
            message: '❌ Erro na conexão com banco',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Rota de teste de banco com múltiplas configurações
app.get('/test-db-advanced', async (req, res) => {
    const { Pool } = require('pg');
    
    // Testar diferentes configurações
    const configs = [
        {
            name: 'Configuração atual (IPv6)',
            config: {
                user: process.env.DB_USER,
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                password: process.env.DB_PASS,
                port: process.env.DB_PORT,
                ssl: { rejectUnauthorized: false },
                family: 6
            }
        },
        {
            name: 'Configuração IPv4',
            config: {
                user: process.env.DB_USER,
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                password: process.env.DB_PASS,
                port: process.env.DB_PORT,
                ssl: { rejectUnauthorized: false },
                family: 4
            }
        },
        {
            name: 'Configuração sem família específica',
            config: {
                user: process.env.DB_USER,
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                password: process.env.DB_PASS,
                port: process.env.DB_PORT,
                ssl: { rejectUnauthorized: false }
            }
        }
    ];
    
    const results = [];
    
    for (const testConfig of configs) {
        try {
            console.log(`🧪 Testando: ${testConfig.name}`);
            const testPool = new Pool(testConfig.config);
            const client = await testPool.connect();
            const result = await client.query('SELECT NOW() as current_time');
            client.release();
            await testPool.end();
            
            results.push({
                config: testConfig.name,
                success: true,
                message: '✅ Conexão funcionou!',
                data: result.rows[0]
            });
        } catch (error) {
            results.push({
                config: testConfig.name,
                success: false,
                message: '❌ Falhou',
                error: error.message
            });
        }
    }
    
    res.json({
        success: true,
        message: '🧪 Teste de múltiplas configurações',
        timestamp: new Date().toISOString(),
        results: results
    });
});

// Rota de teste de conectividade avançada
app.get('/test-connectivity', async (req, res) => {
    const dns = require('dns');
    const net = require('net');
    const { Pool } = require('pg');
    
    const hostname = process.env.DB_HOST;
    const port = process.env.DB_PORT;
    
    const tests = [];
    
    // Teste 1: Resolução DNS
    try {
        const addresses = await new Promise((resolve, reject) => {
            dns.resolve4(hostname, (err, addresses) => {
                if (err) reject(err);
                else resolve(addresses);
            });
        });
        tests.push({
            test: 'Resolução DNS IPv4',
            success: true,
            message: `✅ Resolvido para: ${addresses.join(', ')}`
        });
    } catch (error) {
        tests.push({
            test: 'Resolução DNS IPv4',
            success: false,
            message: `❌ Falhou: ${error.message}`
        });
    }
    
    // Teste 2: Resolução DNS IPv6
    try {
        const addresses = await new Promise((resolve, reject) => {
            dns.resolve6(hostname, (err, addresses) => {
                if (err) reject(err);
                else resolve(addresses);
            });
        });
        tests.push({
            test: 'Resolução DNS IPv6',
            success: true,
            message: `✅ Resolvido para: ${addresses.join(', ')}`
        });
    } catch (error) {
        tests.push({
            test: 'Resolução DNS IPv6',
            success: false,
            message: `❌ Falhou: ${error.message}`
        });
    }
    
    // Teste 3: Teste de conectividade TCP
    try {
        const socket = new net.Socket();
        const connected = await new Promise((resolve) => {
            socket.setTimeout(5000);
            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });
            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });
            socket.on('error', () => {
                socket.destroy();
                resolve(false);
            });
            socket.connect(port, hostname);
        });
        
        tests.push({
            test: 'Conectividade TCP',
            success: connected,
            message: connected ? '✅ Porta acessível' : '❌ Porta não acessível'
        });
    } catch (error) {
        tests.push({
            test: 'Conectividade TCP',
            success: false,
            message: `❌ Erro: ${error.message}`
        });
    }
    
    // Teste 4: Teste com pooler Supabase (porta 6543)
    try {
        const poolerConfig = {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASS,
            port: 6543, // Pooler do Supabase
            ssl: { rejectUnauthorized: false }
        };
        
        const testPool = new Pool(poolerConfig);
        const client = await testPool.connect();
        const result = await client.query('SELECT NOW() as current_time');
        client.release();
        await testPool.end();
        
        tests.push({
            test: 'Conexão via Pooler (porta 6543)',
            success: true,
            message: '✅ Conexão funcionou via pooler!',
            data: result.rows[0]
        });
    } catch (error) {
        tests.push({
            test: 'Conexão via Pooler (porta 6543)',
            success: false,
            message: `❌ Falhou: ${error.message}`
        });
    }
    
    // Teste 5: Informações do hostname
    tests.push({
        test: 'Informações do Hostname',
        success: true,
        message: `Hostname: ${hostname}, Porta: ${port}`,
        details: {
            hostname: hostname,
            port: port,
            user: process.env.DB_USER,
            database: process.env.DB_NAME
        }
    });
    
    res.json({
        success: true,
        message: '🔍 Teste de conectividade avançada',
        timestamp: new Date().toISOString(),
        hostname: hostname,
        tests: tests
    });
});

// Rota de teste usando Supabase Client
app.get('/test-supabase-client', async (req, res) => {
    try {
        const { testConnection } = require('./config/supabase-client');
        
        const result = await testConnection();
        
        if (result) {
            res.json({
                success: true,
                message: '✅ Conexão com Supabase Client funcionando!',
                timestamp: new Date().toISOString(),
                method: 'Supabase Client',
                status: 'Conectado'
            });
        } else {
            res.status(500).json({
                success: false,
                message: '❌ Falha na conexão com Supabase Client',
                timestamp: new Date().toISOString(),
                method: 'Supabase Client',
                status: 'Falhou'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Erro no teste do Supabase Client',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Rota de debug detalhado
app.get('/debug', (req, res) => {
    try {
        // Verificar variáveis de ambiente
        const envVars = {
            DB_HOST: process.env.DB_HOST,
            DB_PORT: process.env.DB_PORT,
            DB_NAME: process.env.DB_NAME,
            DB_USER: process.env.DB_USER,
            DB_PASS: process.env.DB_PASS ? '***CONFIGURADA***' : 'NÃO CONFIGURADA',
            JWT_SECRET: process.env.JWT_SECRET ? '***CONFIGURADA***' : 'NÃO CONFIGURADA',
            JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
            CORS_ORIGIN: process.env.CORS_ORIGIN,
            NODE_ENV: process.env.NODE_ENV
        };

        // Verificar se o módulo database pode ser carregado
        let databaseModule = null;
        let databaseError = null;
        
        try {
            databaseModule = require('./config/database');
        } catch (error) {
            databaseError = error.message;
        }

        res.json({
            success: true,
            message: '🔍 Debug das variáveis de ambiente',
            timestamp: new Date().toISOString(),
            environment: {
                node_version: process.version,
                platform: process.platform,
                arch: process.arch,
                memory: process.memoryUsage()
            },
            variables: envVars,
            database_module: {
                loaded: !!databaseModule,
                error: databaseError
            },
            all_env_keys: Object.keys(process.env).filter(key => key.startsWith('DB_') || key.startsWith('JWT_') || key.startsWith('CORS_') || key === 'NODE_ENV')
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Erro no debug',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Importar rotas
const authRoutes = require('./auth');

// Usar rotas
app.use('/auth', authRoutes);

// Rotas temporárias para teste
app.get('/calendars', (req, res) => {
    res.json({ message: 'Endpoint de calendários funcionando!' });
});

app.get('/tasks', (req, res) => {
    res.json({ message: 'Endpoint de tarefas funcionando!' });
});

app.get('/notes', (req, res) => {
    res.json({ message: 'Endpoint de notas funcionando!' });
});

app.get('/sharing', (req, res) => {
    res.json({ message: 'Endpoint de compartilhamento funcionando!' });
});

// Middleware de erro
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Rota 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

module.exports = app;
