const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase-client');

// Middleware de autenticação corrigido
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token de autenticação necessário' 
            });
        }
        
        // Verificar token JWT localmente
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        // Verificar se o usuário existe no banco
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

// CREATE - Compartilhar item (calendário, tarefa ou nota)
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
        
        // Verificar se o item existe e pertence ao usuário
        let itemExists = false;
        let itemData = null;
        
        switch (item_type) {
            case 'calendar':
                const { data: calendar, error: calendarError } = await supabase
                    .from('calendars')
                    .select('*')
                    .eq('id', item_id)
                    .eq('user_id', user_id)
                    .single();
                
                if (!calendarError && calendar) {
                    itemExists = true;
                    itemData = calendar;
                }
                break;
                
            case 'task':
                const { data: task, error: taskError } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('id', item_id)
                    .eq('user_id', user_id)
                    .single();
                
                if (!taskError && task) {
                    itemExists = true;
                    itemData = task;
                }
                break;
                
            case 'note':
                const { data: note, error: noteError } = await supabase
                    .from('notes')
                    .select('*')
                    .eq('id', item_id)
                    .eq('user_id', user_id)
                    .single();
                
                if (!noteError && note) {
                    itemExists = true;
                    itemData = note;
                }
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de item inválido. Use: calendar, task ou note'
                });
        }
        
        if (!itemExists) {
            return res.status(404).json({
                success: false,
                message: 'Item não encontrado ou não pertence ao usuário'
            });
        }
        
        // Verificar se já existe um compartilhamento
        const { data: existingShare, error: shareCheckError } = await supabase
            .from('sharing')
            .select('*')
            .eq('item_type', item_type)
            .eq('item_id', item_id)
            .eq('shared_with_email', shared_with_email)
            .eq('status', 'pending')
            .single();
        
        if (existingShare && !shareCheckError) {
            return res.status(400).json({
                success: false,
                message: 'Item já foi compartilhado com este usuário'
            });
        }
        
        // Criar compartilhamento
        const { data, error } = await supabase
            .from('sharing')
            .insert([
                {
                    item_type,
                    item_id,
                    shared_by_user_id: user_id,
                    shared_with_email,
                    permissions: permissions || ['read'],
                    status: 'pending',
                    created_at: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) throw error;
        
        res.status(201).json({
            success: true,
            message: 'Item compartilhado com sucesso!',
            data: data[0]
        });
        
    } catch (error) {
        console.error('❌ Erro ao compartilhar item:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao compartilhar item',
            error: error.message
        });
    }
});

// READ - Listar itens compartilhados pelo usuário
router.get('/shared', authenticateUser, async (req, res) => {
    try {
        const user_id = req.user.id;
        
        const { data, error } = await supabase
            .from('sharing')
            .select(`
                *,
                calendars (
                    id,
                    name,
                    color
                ),
                tasks (
                    id,
                    title,
                    status
                ),
                notes (
                    id,
                    title
                )
            `)
            .eq('shared_by_user_id', user_id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Itens compartilhados carregados com sucesso!',
            data: data || []
        });
        
    } catch (error) {
        console.error('❌ Erro ao listar itens compartilhados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar itens compartilhados',
            error: error.message
        });
    }
});

// READ - Listar itens recebidos pelo usuário
router.get('/received', authenticateUser, async (req, res) => {
    try {
        const user_email = req.user.email;
        
        const { data, error } = await supabase
            .from('sharing')
            .select(`
                *,
                calendars (
                    id,
                    name,
                    color
                ),
                tasks (
                    id,
                    title,
                    status
                ),
                notes (
                    id,
                    title
                )
            `)
            .eq('shared_with_email', user_email)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Itens recebidos carregados com sucesso!',
            data: data || []
        });
        
    } catch (error) {
        console.error('❌ Erro ao listar itens recebidos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar itens recebidos',
            error: error.message
        });
    }
});

// UPDATE - Aceitar compartilhamento
router.put('/:id/accept', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user_email = req.user.email;
        
        // Verificar se o compartilhamento existe e é para o usuário
        const { data: sharing, error: checkError } = await supabase
            .from('sharing')
            .select('*')
            .eq('id', id)
            .eq('shared_with_email', user_email)
            .eq('status', 'pending')
            .single();
        
        if (checkError || !sharing) {
            return res.status(404).json({
                success: false,
                message: 'Compartilhamento não encontrado ou já processado'
            });
        }
        
        // Atualizar status para aceito
        const { data, error } = await supabase
            .from('sharing')
            .update({
                status: 'accepted',
                accepted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Compartilhamento aceito com sucesso!',
            data: data[0]
        });
        
    } catch (error) {
        console.error('❌ Erro ao aceitar compartilhamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao aceitar compartilhamento',
            error: error.message
        });
    }
});

// UPDATE - Recusar compartilhamento
router.put('/:id/decline', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user_email = req.user.email;
        
        // Verificar se o compartilhamento existe e é para o usuário
        const { data: sharing, error: checkError } = await supabase
            .from('sharing')
            .select('*')
            .eq('id', id)
            .eq('shared_with_email', user_email)
            .eq('status', 'pending')
            .single();
        
        if (checkError || !sharing) {
            return res.status(404).json({
                success: false,
                message: 'Compartilhamento não encontrado ou já processado'
            });
        }
        
        // Atualizar status para recusado
        const { data, error } = await supabase
            .from('sharing')
            .update({
                status: 'declined',
                declined_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Compartilhamento recusado com sucesso!',
            data: data[0]
        });
        
    } catch (error) {
        console.error('❌ Erro ao recusar compartilhamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao recusar compartilhamento',
            error: error.message
        });
    }
});

// DELETE - Cancelar compartilhamento
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        // Verificar se o compartilhamento existe e foi criado pelo usuário
        const { data: sharing, error: checkError } = await supabase
            .from('sharing')
            .select('*')
            .eq('id', id)
            .eq('shared_by_user_id', user_id)
            .single();
        
        if (checkError || !sharing) {
            return res.status(404).json({
                success: false,
                message: 'Compartilhamento não encontrado'
            });
        }
        
        // Deletar compartilhamento
        const { error } = await supabase
            .from('sharing')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Compartilhamento cancelado com sucesso!'
        });
        
    } catch (error) {
        console.error('❌ Erro ao cancelar compartilhamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao cancelar compartilhamento',
            error: error.message
        });
    }
});

// READ - Obter detalhes de um compartilhamento
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const user_email = req.user.email;
        
        // Verificar se o compartilhamento existe e é do usuário
        const { data, error } = await supabase
            .from('sharing')
            .select(`
                *,
                calendars (
                    id,
                    name,
                    color
                ),
                tasks (
                    id,
                    title,
                    status
                ),
                notes (
                    id,
                    title
                )
            `)
            .eq('id', id)
            .or(`shared_by_user_id.eq.${user_id},shared_with_email.eq.${user_email}`)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Compartilhamento não encontrado'
                });
            }
            throw error;
        }
        
        res.json({
            success: true,
            message: 'Compartilhamento carregado com sucesso!',
            data
        });
        
    } catch (error) {
        console.error('❌ Erro ao obter compartilhamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter compartilhamento',
            error: error.message
        });
    }
});

// SEARCH - Buscar usuários para compartilhar
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

// READ - Obter compartilhamentos de um calendário específico
router.get('/calendar/:calendarId', authenticateUser, async (req, res) => {
    try {
        const { calendarId } = req.params;
        const user_id = req.user.id;
        
        console.log('📋 Carregando compartilhamentos para calendário:', calendarId, 'usuário:', user_id);
        
        // Buscar compartilhamentos do calendário (compartilhados por você)
        const { data: shares, error } = await supabase
            .from('sharing')
            .select('*')
            .eq('item_type', 'calendar')
            .eq('item_id', calendarId)
            .eq('shared_by_user_id', user_id)
            .order('created_at', { ascending: false });
        
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

module.exports = router;
