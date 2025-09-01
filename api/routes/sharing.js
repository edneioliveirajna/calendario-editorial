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

// ========================================
// BUSCAR USUÁRIOS PARA COMPARTILHAR
// ========================================
router.get('/search-users', authenticateUser, async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user.id;
        
        if (!query || query.length < 2) {
            return res.json({
                success: true,
                message: 'Query muito curta. Digite pelo menos 2 caracteres.',
                users: []
            });
        }
        
        console.log('🔍 Buscando usuários com query:', query, 'para usuário:', currentUserId);
        
        // Buscar usuários pelo nome ou email (excluindo o usuário atual)
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email')
            .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
            .neq('id', currentUserId)
            .order('name')
            .limit(10);
        
        if (error) {
            console.error('❌ Erro ao buscar usuários:', error);
            throw error;
        }
        
        console.log('✅ Usuários encontrados:', users?.length || 0);
        
        res.json({
            success: true,
            message: 'Usuários encontrados com sucesso!',
            users: users || []
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuários',
            error: error.message
        });
    }
});

// ========================================
// COMPARTILHAR CALENDÁRIO
// ========================================
router.post('/share', authenticateUser, async (req, res) => {
    try {
        const { calendarId, userEmail, permissions } = req.body;
        const ownerId = req.user.id;
        
        if (!calendarId || !userEmail) {
            return res.status(400).json({
                success: false,
                message: 'ID do calendário e email são obrigatórios'
            });
        }
        
        console.log('📤 Compartilhando calendário:', { calendarId, userEmail, ownerId });
        
        // Verificar se o calendário existe e pertence ao usuário
        const { data: calendar, error: calendarError } = await supabase
            .from('calendars')
            .select('id, name')
            .eq('id', calendarId)
            .eq('user_id', ownerId)
            .single();
        
        if (calendarError || !calendar) {
            return res.status(404).json({
                success: false,
                message: 'Calendário não encontrado ou você não tem permissão para compartilhá-lo'
            });
        }
        
        // Buscar usuário pelo email
        const { data: targetUser, error: userError } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('email', userEmail)
            .single();
        
        if (userError || !targetUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        // Verificar se não está tentando compartilhar consigo mesmo
        if (targetUser.id === ownerId) {
            return res.status(400).json({
                success: false,
                message: 'Não é possível compartilhar um calendário consigo mesmo'
            });
        }
        
        // Verificar se já existe compartilhamento
        const { data: existingShare, error: shareCheckError } = await supabase
            .from('calendar_shares')
            .select('id')
            .eq('calendar_id', calendarId)
            .eq('shared_with_id', targetUser.id)
            .single();
        
        if (existingShare && !shareCheckError) {
            return res.status(400).json({
                success: false,
                message: 'Este calendário já está compartilhado com este usuário'
            });
        }
        
        // Criar compartilhamento
        const { data, error } = await supabase
            .from('calendar_shares')
            .insert([
                {
                    calendar_id: calendarId,
                    owner_id: ownerId,
                    shared_with_id: targetUser.id,
                    can_edit: permissions?.can_edit !== false,
                    can_delete: permissions?.can_delete !== false,
                    can_share: permissions?.can_share || false,
                    shared_at: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) throw error;
        
        res.status(201).json({
            success: true,
            message: 'Calendário compartilhado com sucesso!',
            data: data[0]
        });
        
    } catch (error) {
        console.error('❌ Erro ao compartilhar calendário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao compartilhar calendário',
            error: error.message
        });
    }
});

// ========================================
// OBTER COMPARTILHAMENTOS DE UM CALENDÁRIO
// ========================================
router.get('/calendar/:calendarId', authenticateUser, async (req, res) => {
    try {
        const { calendarId } = req.params;
        const user_id = req.user.id;
        
        console.log('📋 Carregando compartilhamentos para calendário:', calendarId, 'usuário:', user_id);
        
        // Buscar compartilhamentos do calendário (compartilhados por você)
        const { data: shares, error } = await supabase
            .from('calendar_shares')
            .select(`
                *,
                users!calendar_shares_shared_with_id_fkey(id, name, email)
            `)
            .eq('calendar_id', calendarId)
            .eq('owner_id', user_id)
            .order('shared_at', { ascending: false });
        
        if (error) {
            console.error('❌ Erro ao buscar compartilhamentos:', error);
            throw error;
        }
        
        console.log('✅ Compartilhamentos encontrados:', shares?.length || 0);
        
        res.json({
            success: true,
            message: 'Compartilhamentos do calendário carregados com sucesso!',
            shares: shares || []
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar compartilhamentos do calendário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar compartilhamentos do calendário',
            error: error.message
        });
    }
});

// ========================================
// REMOVER COMPARTILHAMENTO
// ========================================
router.delete('/:shareId', authenticateUser, async (req, res) => {
    try {
        const { shareId } = req.params;
        const user_id = req.user.id;
        
        console.log('🗑️ Removendo compartilhamento:', shareId, 'usuário:', user_id);
        
        // Verificar se o compartilhamento existe e foi criado pelo usuário
        const { data: share, error: checkError } = await supabase
            .from('calendar_shares')
            .select('*')
            .eq('id', shareId)
            .eq('owner_id', user_id)
            .single();
        
        if (checkError || !share) {
            return res.status(404).json({
                success: false,
                message: 'Compartilhamento não encontrado'
            });
        }
        
        // Deletar compartilhamento
        const { error } = await supabase
            .from('calendar_shares')
            .delete()
            .eq('id', shareId);
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Compartilhamento removido com sucesso!'
        });
        
    } catch (error) {
        console.error('❌ Erro ao remover compartilhamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao remover compartilhamento',
            error: error.message
        });
    }
});

module.exports = router;