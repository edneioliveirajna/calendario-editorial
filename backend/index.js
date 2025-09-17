console.log('🔍 Iniciando servidor Node.js...');
console.log('🔍 Diretório atual:', process.cwd());

// Carrega configurações de ambiente ANTES de tudo
const { loadEnvironmentConfig } = require('./config/environment');
loadEnvironmentConfig();

console.log('🔍 Verificando dependências...');

let express, cors;

try {
    express = require('express');
    console.log('✅ Express carregado com sucesso');
} catch (error) {
    console.error('❌ Erro ao carregar Express:', error);
    process.exit(1);
}

try {
    cors = require('cors');
    console.log('✅ CORS carregado com sucesso');
} catch (error) {
    console.error('❌ Erro ao carregar CORS:', error);
    process.exit(1);
}

// dotenv já foi carregado pelo sistema de configuração de ambiente

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// LOG DE REQUISIÇÕES
// ========================================
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ========================================
// ROTAS DA API
// ========================================

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API do Calendário Editorial funcionando!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            calendars: '/api/calendars',
            tasks: '/api/tasks',
            notes: '/api/notes'
        }
    });
});

// Rota de status da API
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Importar rotas
console.log('🔍 Carregando rotas...');

let authRoutes, calendarRoutes, taskRoutes, noteRoutes, sharingRoutes;

try {
    authRoutes = require('./routes/auth');
    console.log('✅ Rotas de autenticação carregadas');
} catch (error) {
    console.error('❌ Erro ao carregar rotas de autenticação:', error);
    process.exit(1);
}

try {
    calendarRoutes = require('./routes/calendars');
    console.log('✅ Rotas de calendários carregadas');
} catch (error) {
    console.error('❌ Erro ao carregar rotas de calendários:', error);
    process.exit(1);
}

try {
    taskRoutes = require('./routes/tasks');
    console.log('✅ Rotas de tarefas carregadas');
} catch (error) {
    console.error('❌ Erro ao carregar rotas de tarefas:', error);
    process.exit(1);
}

try {
    noteRoutes = require('./routes/notes');
    console.log('✅ Rotas de notas carregadas');
} catch (error) {
    console.error('❌ Erro ao carregar rotas de notas:', error);
    process.exit(1);
}

try {
    sharingRoutes = require('./routes/sharing');
    console.log('✅ Rotas de compartilhamento carregadas');
} catch (error) {
    console.error('❌ Erro ao carregar rotas de compartilhamento:', error);
    process.exit(1);
}

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/calendars', calendarRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/sharing', sharingRoutes);

// ========================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ========================================
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Algo deu errado no servidor'
    });
});

// ========================================
// ROTA 404 PARA ENDPOINTS NÃO ENCONTRADOS
// ========================================
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint não encontrado',
        message: `A rota ${req.originalUrl} não existe`,
        availableEndpoints: {
            auth: '/api/auth',
            calendars: '/api/calendars',
            tasks: '/api/tasks',
            notes: '/api/notes'
        }
    });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(PORT, () => {
    console.log('🚀 ========================================');
    console.log('🚀 SERVIDOR NODE.JS INICIADO COM SUCESSO!');
    console.log('🚀 ========================================');
    console.log(`📡 Porta: ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/status`);
    console.log('🚀 ========================================');
    console.log('✅ Sistema pronto para receber requisições!');
    console.log('🚀 ========================================');
});

// ========================================
// TRATAMENTO DE ERROS NÃO CAPTURADOS
// ========================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promessa rejeitada não tratada:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exceção não capturada:', error);
    process.exit(1);
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================
process.on('SIGTERM', () => {
    console.log('🔄 Recebido SIGTERM, encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔄 Recebido SIGINT, encerrando servidor...');
    process.exit(0);
});
