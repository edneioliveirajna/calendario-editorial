const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase-client');

// 🔍 ROTA DE TESTE - Verificar estrutura da tabela tasks
router.get('/test-table', async (req, res) => {
    try {
        console.log('🔍 TASKS TEST: Verificando estrutura da tabela tasks...');
        
        // Teste 1: Verificar se a tabela existe
        const { data: tableExists, error: tableError } = await supabase
            .from('tasks')
            .select('id')
            .limit(1);
        
        console.log('🔍 TASKS TEST: Teste de existência - data:', tableExists);
        console.log('🔍 TASKS TEST: Teste de existência - error:', tableError);
        
        // Teste 2: Verificar estrutura da tabela (sem usar RPC)
        console.log('🔍 TASKS TEST: Pulando verificação de estrutura (RPC não disponível)');
        const structure = null;
        const structureError = null;
        
        // Teste 3: Tentar inserir e deletar um registro de teste
        let insertTest = { success: false, data: null, error: null };
        try {
            const { data: insertData, error: insertError } = await supabase
                .from('tasks')
                .insert([{
                    title: 'Teste',
                    description: 'Tarefa de teste',
                    calendar_id: 1,
                    content_type: 'post',
                    platforms: [],
                    status: 'pending',
                    scheduled_date: new Date().toISOString().split('T')[0],
                    created_at: new Date().toISOString()
                }])
                .select();
            
            insertTest = { success: true, data: insertData, error: insertError };
            
            // Se inseriu com sucesso, deletar
            if (insertData && insertData[0]) {
                await supabase
                    .from('tasks')
                    .delete()
                    .eq('id', insertData[0].id);
            }
        } catch (insertErr) {
            insertTest = { success: false, data: null, error: insertErr };
        }
        
        res.json({
            success: true,
            message: 'Teste da tabela tasks concluído',
            table_test: {
                exists: !tableError,
                table_error: tableError,
                structure: structure,
                structure_error: structureError,
                insert_test: insertTest
            }
        });
        
    } catch (error) {
        console.error('❌ TASKS TEST ERROR:', error);
        res.status(500).json({
            success: false,
            message: 'Erro no teste da tabela tasks',
            error: error.message
        });
    }
});

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

// CREATE - Criar nova tarefa
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { title, description, content_type, platforms, status, calendar_id, scheduled_date } = req.body;
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
                    content_type: content_type || 'post',
                    platforms: platforms || [],
                    status: status || 'pending',
                    calendar_id,
                    scheduled_date: scheduled_date || null,
                    created_at: new Date().toISOString()
                }
            ])
            .select('*'); // Garantir que todos os campos sejam retornados, incluindo o ID
        
        if (error) throw error;
        
        // Verificar se o ID foi retornado
        if (!data || !data[0] || !data[0].id) {
            console.error('❌ TASKS ERROR: ID não retornado após inserção:', data);
            return res.status(500).json({
                success: false,
                message: 'Erro interno: ID da tarefa não foi gerado'
            });
        }
        
        console.log('✅ TASKS DEBUG: Tarefa criada com sucesso, ID:', data[0].id);
        console.log('✅ TASKS DEBUG: Resposta completa sendo enviada:', {
            success: true,
            message: 'Tarefa criada com sucesso!',
            data: data[0]
        });
        
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
        console.log('🔍 TASKS DEBUG: Iniciando listagem de tarefas');
        const user_id = req.user.id;
        const { calendar_id, status } = req.query;
        
        console.log('🔍 TASKS DEBUG: Parâmetros recebidos:', {
            user_id,
            calendar_id,
            status
        });
        
        // Buscar tarefas por calendários que pertencem ao usuário
        let query = supabase
            .from('tasks')
            .select(`
                *,
                calendars (
                    id,
                    name,
                    color
                )
            `);
        
        // Filtrar por calendar_id se fornecido
        if (calendar_id) {
            query = query.eq('calendar_id', calendar_id);
        }
        if (status) query = query.eq('status', status);
        
        console.log('🔍 TASKS DEBUG: Query construída, executando...');
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        console.log('🔍 TASKS DEBUG: Resposta da query - data:', data);
        console.log('🔍 TASKS DEBUG: Resposta da query - error:', error);
        
        if (error) throw error;
        
        // Filtrar tarefas por calendários que pertencem ao usuário OU são compartilhados
        let filteredTasks = [];
        if (data && data.length > 0) {
            for (const task of data) {
                if (task.calendar_id) {
                    // Verificar se é calendário próprio
                    const { data: ownCalendar, error: ownError } = await supabase
                        .from('calendars')
                        .select('id')
                        .eq('id', task.calendar_id)
                        .eq('user_id', user_id)
                        .single();
                    
                    if (!ownError && ownCalendar) {
                        // É calendário próprio
                        filteredTasks.push({
                            ...task,
                            is_calendar_owner: true,
                            can_edit: true,
                            can_delete: true,
                            can_share: true
                        });
                    } else {
                        // Verificar se é calendário compartilhado
                        const { data: sharedCalendar, error: sharedError } = await supabase
                            .from('calendar_shares')
                            .select('can_edit, can_delete, can_share')
                            .eq('calendar_id', task.calendar_id)
                            .eq('shared_with_id', user_id)
                            .single();
                        
                        if (!sharedError && sharedCalendar) {
                            // É calendário compartilhado
                            filteredTasks.push({
                                ...task,
                                is_calendar_owner: false,
                                can_edit: sharedCalendar.can_edit,
                                can_delete: sharedCalendar.can_delete,
                                can_share: sharedCalendar.can_share
                            });
                        }
                    }
                }
            }
        }
        
        console.log('✅ TASKS DEBUG: Tarefas filtradas com sucesso, total:', filteredTasks.length);
        
        res.json({
            success: true,
            message: 'Tarefas carregadas com sucesso!',
            data: filteredTasks
        });
        
    } catch (error) {
        console.error('❌ TASKS ERROR: Erro ao listar tarefas:', error);
        console.error('❌ TASKS ERROR: Stack trace:', error.stack);
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
        
        // Verificar se o calendário da tarefa pertence ao usuário
        if (data && data.calendar_id) {
            const { data: calendar, error: calendarError } = await supabase
                .from('calendars')
                .select('id')
                .eq('id', data.calendar_id)
                .eq('user_id', user_id)
                .single();
            
            if (calendarError || !calendar) {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado a esta tarefa'
                });
            }
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
        const { title, description, content_type, platforms, status, calendar_id, scheduled_date } = req.body;
        const user_id = req.user.id;
        
        // Verificar se a tarefa existe pelo ID e se o calendário pertence ao usuário
        const { data: existing, error: checkError } = await supabase
            .from('tasks')
            .select('id, calendar_id')
            .eq('id', id)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }
        
        // Verificar se o calendário da tarefa pertence ao usuário
        const { data: calendar, error: calendarError } = await supabase
            .from('calendars')
            .select('id')
            .eq('id', existing.calendar_id)
            .eq('user_id', user_id)
            .single();
        
        if (calendarError || !calendar) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado a esta tarefa'
            });
        }
        
        // Se mudou o calendário, verificar se o novo pertence ao usuário
        if (calendar_id && calendar_id !== existing.calendar_id) {
            const { data: newCalendar, error: newCalendarError } = await supabase
                .from('calendars')
                .select('id')
                .eq('id', calendar_id)
                .eq('user_id', user_id)
                .single();
            
            if (newCalendarError || !newCalendar) {
                return res.status(404).json({
                    success: false,
                    message: 'Novo calendário não encontrado'
                });
            }
        }
        
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (content_type !== undefined) updateData.content_type = content_type;
        if (platforms !== undefined) updateData.platforms = platforms;
        if (status !== undefined) updateData.status = status;
        if (calendar_id !== undefined) updateData.calendar_id = calendar_id;
        if (scheduled_date !== undefined) updateData.scheduled_date = scheduled_date;
        
        updateData.updated_at = new Date().toISOString();
        
        const { data, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', id)
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
        
        // Verificar se a tarefa existe pelo ID e se o calendário pertence ao usuário
        const { data: existing, error: checkError } = await supabase
            .from('tasks')
            .select('id, calendar_id')
            .eq('id', id)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }
        
        // Verificar se o calendário da tarefa pertence ao usuário
        const { data: calendar, error: calendarError } = await supabase
            .from('calendars')
            .select('id')
            .eq('id', existing.calendar_id)
            .eq('user_id', user_id)
            .single();
        
        if (calendarError || !calendar) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado a esta tarefa'
            });
        }
        
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);
        
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
        
        // Verificar se a tarefa existe pelo ID e se o calendário pertence ao usuário
        const { data: existing, error: checkError } = await supabase
            .from('tasks')
            .select('id, calendar_id')
            .eq('id', id)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }
        
        // Verificar se o calendário da tarefa pertence ao usuário
        const { data: calendar, error: calendarError } = await supabase
            .from('calendars')
            .select('id')
            .eq('id', existing.calendar_id)
            .eq('user_id', user_id)
            .single();
        
        if (calendarError || !calendar) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado a esta tarefa'
            });
        }
        
        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: completed ? 'completed' : 'pending',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
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

// UPDATE - Mover tarefa (drag & drop)
router.put('/:id/move', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { new_date, new_calendar_id } = req.body;
        const user_id = req.user.id;
        
        console.log('🔄 TASKS MOVE DEBUG: Movendo tarefa:', { id, new_date, new_calendar_id });
        
        // Verificar se a tarefa existe pelo ID e se o calendário pertence ao usuário
        const { data: existing, error: checkError } = await supabase
            .from('tasks')
            .select('id, calendar_id, title')
            .eq('id', id)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }
        
        // Verificar se o calendário da tarefa pertence ao usuário
        const { data: calendar, error: calendarError } = await supabase
            .from('calendars')
            .select('id')
            .eq('id', existing.calendar_id)
            .eq('user_id', user_id)
            .single();
        
        if (calendarError || !calendar) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado a esta tarefa'
            });
        }
        
        // Preparar dados para atualização
        const updateData = {
            updated_at: new Date().toISOString()
        };
        
        // Atualizar data se fornecida
        if (new_date) {
            updateData.date = new_date;
        }
        
        // Atualizar calendário se fornecido
        if (new_calendar_id) {
            // Verificar se o novo calendário também pertence ao usuário
            const { data: newCalendar, error: newCalendarError } = await supabase
                .from('calendars')
                .select('id')
                .eq('id', new_calendar_id)
                .eq('user_id', user_id)
                .single();
            
            if (newCalendarError || !newCalendar) {
                return res.status(404).json({
                    success: false,
                    message: 'Novo calendário não encontrado ou acesso negado'
                });
            }
            
            updateData.calendar_id = new_calendar_id;
        }
        
        console.log('🔄 TASKS MOVE DEBUG: Dados para atualização:', updateData);
        
        const { data, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', id)
            .select('*');
        
        if (error) throw error;
        
        console.log('✅ TASKS MOVE DEBUG: Tarefa movida com sucesso:', data[0]);
        
        res.json({
            success: true,
            message: 'Tarefa movida com sucesso!',
            data: data[0]
        });
        
    } catch (error) {
        console.error('❌ Erro ao mover tarefa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao mover tarefa',
            error: error.message
        });
    }
});

module.exports = router;
