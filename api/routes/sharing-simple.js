const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase-client');

// Middleware de autenticação
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token de autenticação necessário' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email')
            .eq('id', decoded.userId)
            .single();
        
        if (error || !user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token inválido' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expirado' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Erro na autenticação',
            error: error.message 
        });
    }
};

// Rota GET para teste
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: '✅ Rota de sharing funcionando!',
        timestamp: new Date().toISOString(),
        routes: ['/share', '/shared', '/received']
    });
});

// Compartilhar item
router.post('/share', authenticateUser, async (req, res) => {
    try {
        const { item_type, item_id, shared_with_email, permissions } = req.body;
        const user_id = req.user.id;
        
        if (!item_type || !item_id || !shared_with_email) {
            return res.status(400).json({
                success: false,
                message: 'Tipo do item, ID e email são obrigatórios'
            });
        }
        
        // Buscar usuário com quem compartilhar
        const { data: targetUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', shared_with_email)
            .single();
        
        if (userError || !targetUser) {
            return res.status(400).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        // Criar compartilhamento
        const { data: share, error: shareError } = await supabase
            .from('shares')
            .insert([{
                item_type: item_type,
                item_id: item_id,
                shared_by: user_id,
                shared_with: targetUser.id,
                permissions: permissions || 'read',
                status: 'pending',
                created_at: new Date().toISOString()
            }])
            .select('*')
            .single();
        
        if (shareError) throw shareError;
        
        res.status(201).json({
            success: true,
            message: 'Item compartilhado com sucesso',
            share: share
        });
        
    } catch (error) {
        console.error('Erro ao compartilhar:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Ver itens compartilhados por você
router.get('/shared', authenticateUser, async (req, res) => {
    try {
        const user_id = req.user.id;
        
        const { data: shares, error } = await supabase
            .from('shares')
            .select(`
                *,
                users!shares_shared_with_fkey(name, email)
            `)
            .eq('shared_by', user_id);
        
        if (error) throw error;
        
        res.json({
            success: true,
            shares: shares || []
        });
        
    } catch (error) {
        console.error('Erro ao buscar compartilhamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Ver itens compartilhados com você
router.get('/received', authenticateUser, async (req, res) => {
    try {
        const user_id = req.user.id;
        
        const { data: shares, error } = await supabase
            .from('shares')
            .select(`
                *,
                users!shares_shared_by_fkey(name, email)
            `)
            .eq('shared_with', user_id);
        
        if (error) throw error;
        
        res.json({
            success: true,
            shares: shares || []
        });
        
    } catch (error) {
        console.error('Erro ao buscar compartilhamentos recebidos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Ver compartilhamentos de um calendário específico
router.get('/calendar/:calendarId', authenticateUser, async (req, res) => {
    try {
        const { calendarId } = req.params;
        const user_id = req.user.id;
        
        // Buscar compartilhamentos do calendário (compartilhados por você)
        const { data: sharedShares, error: sharedError } = await supabase
            .from('shares')
            .select(`
                *,
                users!shares_shared_with_fkey(name, email)
            `)
            .eq('item_type', 'calendar')
            .eq('item_id', calendarId)
            .eq('shared_by', user_id);
        
        if (sharedError) throw sharedError;
        
        // Buscar compartilhamentos recebidos do calendário
        const { data: receivedShares, error: receivedError } = await supabase
            .from('shares')
            .select(`
                *,
                users!shares_shared_by_fkey(name, email)
            `)
            .eq('item_type', 'calendar')
            .eq('item_id', calendarId)
            .eq('shared_with', user_id);
        
        if (receivedError) throw receivedError;
        
        res.json({
            success: true,
            message: 'Compartilhamentos do calendário carregados com sucesso',
            data: {
                shared: sharedShares || [],
                received: receivedShares || []
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar compartilhamentos do calendário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

module.exports = router;
