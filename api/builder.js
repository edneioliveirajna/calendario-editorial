const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: [
        process.env.CORS_ORIGIN || '*',
        'https://calendario-editorial-five.vercel.app',
        'http://localhost:3000',
        'http://localhost:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Importar rotas
const authRoutes = require('./auth-new');
const calendarRoutes = require('./routes/calendars');
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');
const sharingRoutes = require('./routes/sharing-simple');

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API do Calendário Editorial funcionando no Vercel!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: 'production',
        endpoints: {
            auth: '/auth',
            calendars: '/calendars',
            tasks: '/tasks',
            notes: '/notes',
            sharing: '/sharing'
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

// Usar rotas
app.use('/auth', authRoutes);
app.use('/calendars', calendarRoutes);
app.use('/tasks', taskRoutes);
app.use('/notes', noteRoutes);
app.use('/sharing', sharingRoutes);

// Rota de teste para sharing
app.get('/test-sharing', (req, res) => {
    res.json({
        success: true,
        message: '✅ Rota de teste para sharing funcionando!',
        timestamp: new Date().toISOString(),
        test: 'sharing test route'
    });
});

// Rota de teste usando Supabase Client
app.get('/test-supabase-client', async (req, res) => {
    try {
        const { testConnection } = require('./config/supabase-client');
        
        const result = await testConnection();
        
        if (result.success) {
            res.json({
                success: true,
                message: '✅ Conexão com Supabase Client funcionando!',
                timestamp: new Date().toISOString(),
                method: 'Supabase Client',
                status: 'Conectado',
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: '❌ Falha na conexão com Supabase Client',
                timestamp: new Date().toISOString(),
                method: 'Supabase Client',
                status: 'Falhou',
                error: result.error
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

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('❌ Erro na API:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
    });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method
    });
});

module.exports = app;
