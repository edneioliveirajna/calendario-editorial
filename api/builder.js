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
