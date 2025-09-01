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

// Importar rotas
const authRoutes = require('./auth');
const calendarRoutes = require('./calendars');
const taskRoutes = require('./tasks');
const noteRoutes = require('./notes');
const sharingRoutes = require('./sharing');

// Usar rotas
app.use('/auth', authRoutes);
app.use('/calendars', calendarRoutes);
app.use('/tasks', taskRoutes);
app.use('/notes', noteRoutes);
app.use('/sharing', sharingRoutes);

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
