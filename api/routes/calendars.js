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

// CREATE - Criar novo calendário
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { company_name, start_month, name, description, color, is_public } = req.body;
        const user_id = req.user.id;
        
        // Usar company_name se fornecido, senão usar name
        const calendarName = company_name || name;
        
        if (!calendarName) {
            return res.status(400).json({
                success: false,
                message: 'Nome da empresa ou nome do calendário é obrigatório'
            });
        }
        
        // Gerar unique_url baseado no nome da empresa
        const uniqueUrl = calendarName.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now();
        
        const { data, error } = await supabase
            .from('calendars')
            .insert([
                {
                    company_name: calendarName,  // Usar company_name
                    start_month: start_month || null,  // Adicionar start_month
                    name: calendarName,  // Manter compatibilidade
                    description: description || '',
                    color: color || '#3B82F6',
                    is_public: is_public || false,
                    user_id,
                    unique_url: uniqueUrl,  // Adicionar unique_url
                    created_at: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) throw error;
        
        res.status(201).json({
            success: true,
            message: 'Calendário criado com sucesso!',
            calendar: data[0]  // Retornar 'calendar' em vez de 'data'
        });
        
    } catch (error) {
        console.error('❌ Erro ao criar calendário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar calendário',
            error: error.message
        });
    }
});

// READ - Listar todos os calendários do usuário
router.get('/', authenticateUser, async (req, res) => {
    try {
        const user_id = req.user.id;
        
        const { data, error } = await supabase
            .from('calendars')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Calendários carregados com sucesso!',
            data: data || []
        });
        
    } catch (error) {
        console.error('❌ Erro ao listar calendários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar calendários',
            error: error.message
        });
    }
});

// READ - Obter calendário específico
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        const { data, error } = await supabase
            .from('calendars')
            .select('*')
            .eq('id', id)
            .eq('user_id', user_id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Calendário não encontrado'
                });
            }
            throw error;
        }
        
        res.json({
            success: true,
            message: 'Calendário carregado com sucesso!',
            data
        });
        
    } catch (error) {
        console.error('❌ Erro ao obter calendário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter calendário',
            error: error.message
        });
    }
});

// UPDATE - Atualizar calendário
router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, is_public } = req.body;
        const user_id = req.user.id;
        
        // Verificar se o calendário existe e pertence ao usuário
        const { data: existing, error: checkError } = await supabase
            .from('calendars')
            .select('id')
            .eq('id', id)
            .eq('user_id', user_id)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({
                success: false,
                message: 'Calendário não encontrado'
            });
        }
        
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (color !== undefined) updateData.color = color;
        if (is_public !== undefined) updateData.is_public = is_public;
        
        updateData.updated_at = new Date().toISOString();
        
        const { data, error } = await supabase
            .from('calendars')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user_id)
            .select();
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Calendário atualizado com sucesso!',
            data: data[0]
        });
        
    } catch (error) {
        console.error('❌ Erro ao atualizar calendário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar calendário',
            error: error.message
        });
    }
});

// DELETE - Deletar calendário
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        // Verificar se o calendário existe e pertence ao usuário
        const { data: existing, error: checkError } = await supabase
            .from('calendars')
            .select('id')
            .eq('id', id)
            .eq('user_id', user_id)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({
                success: false,
                message: 'Calendário não encontrado'
            });
        }
        
        const { error } = await supabase
            .from('calendars')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id);
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Calendário deletado com sucesso!'
        });
        
    } catch (error) {
        console.error('❌ Erro ao deletar calendário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar calendário',
            error: error.message
        });
    }
});

module.exports = router;
