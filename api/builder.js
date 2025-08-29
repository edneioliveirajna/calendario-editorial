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
