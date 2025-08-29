const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase-client');

// Middleware de autenticação (simples por enquanto)
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token de autenticação necessário' 
            });
        }
        
        // Verificar token com Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token inválido' 
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Erro na autenticação',
            error: error.message 
        });
    }
};

// CREATE - Criar nova tarefa
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { title, description, due_date, priority, status, calendar_id } = req.body;
        const user_id = req.user.id;
        
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Título da tarefa é obrigatório'
            });
        }
        
        if (!calendar_id) {
            return res.status(400).json({
                success: false,
                message: 'ID do calendário é obrigatório'
            });
        }
        
        // Verificar se o calendário pertence ao usuário
        const { data: calendar, error: calendarError } = await supabase
            .from('calendars')
            .select('id')
            .eq('id', calendar_id)
            .eq('user_id', user_id)
            .single();
        
        if (calendarError || !calendar) {
            return res.status(404).json({
                success: false,
                message: 'Calendário não encontrado'
            });
        }
        
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    title,
                    description: description || '',
                    due_date: due_date || null,
                    priority: priority || 'medium',
                    status: status || 'pending',
                    calendar_id,
                    user_id,
                    created_at: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) throw error;
        
        res.status(201).json({
            success: true,
            message: 'Tarefa criada com sucesso!',
            data: data[0]
        });
        
    } catch (error) {
        console.error('❌ Erro ao criar tarefa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar tarefa',
            error: error.message
        });
    }
});

// READ - Listar todas as tarefas do usuário
router.get('/', authenticateUser, async (req, res) => {
    try {
        const user_id = req.user.id;
        const { calendar_id, status, priority } = req.query;
        
        let query = supabase
            .from('tasks')
            .select(`
                *,
                calendars (
                    id,
                    name,
                    color
                )
            `)
            .eq('user_id', user_id);
        
        // Filtros opcionais
        if (calendar_id) query = query.eq('calendar_id', calendar_id);
        if (status) query = query.eq('status', status);
        if (priority) query = query.eq('priority', priority);
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Tarefas carregadas com sucesso!',
            data: data || []
        });
        
    } catch (error) {
        console.error('❌ Erro ao listar tarefas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar tarefas',
            error: error.message
        });
    }
});

// READ - Obter tarefa específica
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                calendars (
                    id,
                    name,
                    color
                )
            `)
            .eq('id', id)
            .eq('user_id', user_id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Tarefa não encontrada'
                });
            }
            throw error;
        }
        
        res.json({
            success: true,
            message: 'Tarefa carregada com sucesso!',
            data
        });
        
    } catch (error) {
        console.error('❌ Erro ao obter tarefa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter tarefa',
            error: error.message
        });
    }
});

// UPDATE - Atualizar tarefa
router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, due_date, priority, status, calendar_id } = req.body;
        const user_id = req.user.id;
        
        // Verificar se a tarefa existe e pertence ao usuário
        const { data: existing, error: checkError } = await supabase
            .from('tasks')
            .select('id')
            .eq('id', id)
            .eq('user_id', user_id)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }
        
        // Se mudou o calendário, verificar se pertence ao usuário
        if (calendar_id) {
            const { data: calendar, error: calendarError } = await supabase
                .from('calendars')
                .select('id')
                .eq('id', calendar_id)
                .eq('user_id', user_id)
                .single();
            
            if (calendarError || !calendar) {
                return res.status(404).json({
                    success: false,
                    message: 'Calendário não encontrado'
                });
            }
        }
        
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (due_date !== undefined) updateData.due_date = due_date;
        if (priority !== undefined) updateData.priority = priority;
        if (status !== undefined) updateData.status = status;
        if (calendar_id !== undefined) updateData.calendar_id = calendar_id;
        
        updateData.updated_at = new Date().toISOString();
        
        const { data, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user_id)
            .select();
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Tarefa atualizada com sucesso!',
            data: data[0]
        });
        
    } catch (error) {
        console.error('❌ Erro ao atualizar tarefa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar tarefa',
            error: error.message
        });
    }
});

// DELETE - Deletar tarefa
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        // Verificar se a tarefa existe e pertence ao usuário
        const { data: existing, error: checkError } = await supabase
            .from('tasks')
            .select('id')
            .eq('id', id)
            .eq('user_id', user_id)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }
        
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id);
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Tarefa deletada com sucesso!'
        });
        
    } catch (error) {
        console.error('❌ Erro ao deletar tarefa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar tarefa',
            error: error.message
        });
    }
});

// UPDATE - Marcar tarefa como completa
router.put('/:id/complete', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body;
        const user_id = req.user.id;
        
        // Verificar se a tarefa existe e pertence ao usuário
        const { data: existing, error: checkError } = await supabase
            .from('tasks')
            .select('id')
            .eq('id', id)
            .eq('user_id', user_id)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }
        
        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: completed ? 'completed' : 'pending',
                completed_at: completed ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user_id)
            .select();
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: completed ? 'Tarefa marcada como completa!' : 'Tarefa marcada como pendente!',
            data: data[0]
        });
        
    } catch (error) {
        console.error('❌ Erro ao atualizar status da tarefa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar status da tarefa',
            error: error.message
        });
    }
});

module.exports = router;
