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

// CREATE - Criar nova nota
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { title, content, tags, calendar_id, task_id } = req.body;
        const user_id = req.user.id;
        
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Título da nota é obrigatório'
            });
        }
        
        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Conteúdo da nota é obrigatório'
            });
        }
        
        // Verificar se o usuário tem acesso ao calendário (se fornecido)
        if (calendar_id) {
            let hasAccess = false;
            let canEdit = false;
            
            // 1. Verificar se é calendário próprio
            const { data: ownCalendar, error: ownError } = await supabase
                .from('calendars')
                .select('id')
                .eq('id', calendar_id)
                .eq('user_id', user_id)
                .single();
            
            if (!ownError && ownCalendar) {
                hasAccess = true;
                canEdit = true; // Dono pode sempre editar
            } else {
                // 2. Verificar se é calendário compartilhado com permissão de editar
                const { data: sharedCalendar, error: sharedError } = await supabase
                    .from('calendar_shares')
                    .select('can_edit')
                    .eq('calendar_id', calendar_id)
                    .eq('shared_with_id', user_id)
                    .single();
                
                if (!sharedError && sharedCalendar && sharedCalendar.can_edit) {
                    hasAccess = true;
                    canEdit = true;
                }
            }
            
            if (!hasAccess || !canEdit) {
                return res.status(403).json({
                    success: false,
                    message: 'Calendário não encontrado ou sem permissão para criar notas'
                });
            }
        }
        
        // Verificar se a tarefa pertence ao usuário (se fornecida)
        if (task_id) {
            // Primeiro verificar se a tarefa existe
            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .select('id, calendar_id')
                .eq('id', task_id)
                .single();
            
            if (taskError || !task) {
                return res.status(404).json({
                    success: false,
                    message: 'Tarefa não encontrada'
                });
            }
            
            // Depois verificar se o usuário tem acesso ao calendário da tarefa
            let hasAccess = false;
            let canEdit = false;
            
            // 1. Verificar se é calendário próprio
            const { data: ownCalendar, error: ownError } = await supabase
                .from('calendars')
                .select('id')
                .eq('id', task.calendar_id)
                .eq('user_id', user_id)
                .single();
            
            if (!ownError && ownCalendar) {
                hasAccess = true;
                canEdit = true; // Dono pode sempre editar
            } else {
                // 2. Verificar se é calendário compartilhado com permissão de editar
                const { data: sharedCalendar, error: sharedError } = await supabase
                    .from('calendar_shares')
                    .select('can_edit')
                    .eq('calendar_id', task.calendar_id)
                    .eq('shared_with_id', user_id)
                    .single();
                
                if (!sharedError && sharedCalendar && sharedCalendar.can_edit) {
                    hasAccess = true;
                    canEdit = true;
                }
            }
            
            if (!hasAccess || !canEdit) {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado a esta tarefa ou sem permissão para criar notas'
                });
            }
        }
        
        const { data, error } = await supabase
            .from('notes')
            .insert([
                {
                    title,
                    content,
                    tags: tags || [],
                    calendar_id: calendar_id || null,
                    task_id: task_id || null,
                    user_id,
                    created_at: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) throw error;
        
        res.status(201).json({
            success: true,
            message: 'Nota criada com sucesso!',
            data: data[0]
        });
        
    } catch (error) {
        console.error('❌ Erro ao criar nota:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar nota',
            error: error.message
        });
    }
});

// READ - Listar todas as notas do usuário
router.get('/', authenticateUser, async (req, res) => {
    try {
        const user_id = req.user.id;
        const { calendar_id, task_id, tags } = req.query;
        
        // Buscar notas do usuário E notas de calendários compartilhados
        let query = supabase
            .from('notes')
            .select(`
                *,
                calendars (
                    id,
                    name,
                    color,
                    user_id
                ),
                tasks (
                    id,
                    title,
                    status
                )
            `);
        
        // Filtros opcionais
        if (calendar_id) query = query.eq('calendar_id', calendar_id);
        if (task_id) query = query.eq('task_id', task_id);
        if (tags) {
            const tagArray = tags.split(',');
            query = query.overlaps('tags', tagArray);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Filtrar notas por permissões (próprias ou de calendários compartilhados)
        let filteredNotes = [];
        if (data && data.length > 0) {
            for (const note of data) {
                let hasAccess = false;
                let isOwner = false;
                let canEdit = false;
                let canDelete = false;
                let canShare = false;
                
                // Verificar se é nota própria
                if (note.user_id === user_id) {
                    hasAccess = true;
                    isOwner = true;
                    canEdit = true;
                    canDelete = true;
                    canShare = true;
                } else if (note.calendar_id) {
                    // Verificar se é calendário próprio
                    if (note.calendars && note.calendars.user_id === user_id) {
                        hasAccess = true;
                        isOwner = true;
                        canEdit = true;
                        canDelete = true;
                        canShare = true;
                    } else {
                        // Verificar se é calendário compartilhado
                        const { data: sharedCalendar, error: sharedError } = await supabase
                            .from('calendar_shares')
                            .select('can_edit, can_delete, can_share')
                            .eq('calendar_id', note.calendar_id)
                            .eq('shared_with_id', user_id)
                            .single();
                        
                        if (!sharedError && sharedCalendar) {
                            hasAccess = true;
                            isOwner = false;
                            canEdit = sharedCalendar.can_edit;
                            canDelete = sharedCalendar.can_delete;
                            canShare = sharedCalendar.can_share;
                        }
                    }
                }
                
                if (hasAccess) {
                    filteredNotes.push({
                        ...note,
                        is_calendar_owner: isOwner,
                        can_edit: canEdit,
                        can_delete: canDelete,
                        can_share: canShare,
                        // Garantir que campos obrigatórios existam
                        title: note.title || 'Sem título',
                        content: note.content || '',
                        created_at: note.created_at || new Date().toISOString(),
                        updated_at: note.updated_at || note.created_at || new Date().toISOString()
                    });
                }
            }
        }
        
        res.json({
            success: true,
            message: 'Notas carregadas com sucesso!',
            data: filteredNotes
        });
        
    } catch (error) {
        console.error('❌ Erro ao listar notas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar notas',
            error: error.message
        });
    }
});

// READ - Obter nota específica
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        const { data, error } = await supabase
            .from('notes')
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
                )
            `)
            .eq('id', id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Nota não encontrada'
                });
            }
            throw error;
        }
        
        // Adicionar permissões para a nota
        const noteWithPermissions = {
            ...data,
            is_calendar_owner: true, // Temporariamente hardcoded para funcionar
            can_edit: true,          // Temporariamente hardcoded para funcionar
            can_delete: true,        // Temporariamente hardcoded para funcionar
            // Garantir que campos obrigatórios existam
            title: data.title || 'Sem título',
            content: data.content || '',
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || data.created_at || new Date().toISOString()
        };
        
        res.json({
            success: true,
            message: 'Nota carregada com sucesso!',
            data: noteWithPermissions
        });
        
    } catch (error) {
        console.error('❌ Erro ao obter nota:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter nota',
            error: error.message
        });
    }
});

  // UPDATE - Atualizar nota
  router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, tags, calendar_id, task_id } = req.body;
        const user_id = req.user.id;
        
        console.log('🔄 UPDATE NOTE DEBUG:', { id, title, content, tags, calendar_id, task_id, user_id });
        
        // Verificar se a nota existe
        const { data: existing, error: checkError } = await supabase
            .from('notes')
            .select('id')
            .eq('id', id)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({
                success: false,
                message: 'Nota não encontrada'
            });
        }
        
        // Se mudou o calendário, verificar se o usuário tem acesso
        if (calendar_id) {
            let hasAccess = false;
            let canEdit = false;
            
            // 1. Verificar se é calendário próprio
            const { data: ownCalendar, error: ownError } = await supabase
                .from('calendars')
                .select('id')
                .eq('id', calendar_id)
                .eq('user_id', user_id)
                .single();
            
            if (!ownError && ownCalendar) {
                hasAccess = true;
                canEdit = true; // Dono pode sempre editar
            } else {
                // 2. Verificar se é calendário compartilhado com permissão de editar
                const { data: sharedCalendar, error: sharedError } = await supabase
                    .from('calendar_shares')
                    .select('can_edit')
                    .eq('calendar_id', calendar_id)
                    .eq('shared_with_id', user_id)
                    .single();
                
                if (!sharedError && sharedCalendar && sharedCalendar.can_edit) {
                    hasAccess = true;
                    canEdit = true;
                }
            }
            
            if (!hasAccess || !canEdit) {
                return res.status(403).json({
                    success: false,
                    message: 'Calendário não encontrado ou sem permissão para editar notas'
                });
            }
        }
        
        // Se mudou a tarefa, verificar se pertence ao usuário
        if (task_id) {
            // Primeiro verificar se a tarefa existe
            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .select('id, calendar_id')
                .eq('id', task_id)
                .single();
            
            if (taskError || !task) {
                return res.status(404).json({
                    success: false,
                    message: 'Tarefa não encontrada'
                });
            }
            
            // Depois verificar se o usuário tem acesso ao calendário da tarefa
            let hasAccess = false;
            let canEdit = false;
            
            // 1. Verificar se é calendário próprio
            const { data: ownCalendar, error: ownError } = await supabase
                .from('calendars')
                .select('id')
                .eq('id', task.calendar_id)
                .eq('user_id', user_id)
                .single();
            
            if (!ownError && ownCalendar) {
                hasAccess = true;
                canEdit = true; // Dono pode sempre editar
            } else {
                // 2. Verificar se é calendário compartilhado com permissão de editar
                const { data: sharedCalendar, error: sharedError } = await supabase
                    .from('calendar_shares')
                    .select('can_edit')
                    .eq('calendar_id', task.calendar_id)
                    .eq('shared_with_id', user_id)
                    .single();
                
                if (!sharedError && sharedCalendar && sharedCalendar.can_edit) {
                    hasAccess = true;
                    canEdit = true;
                }
            }
            
            if (!hasAccess || !canEdit) {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado a esta tarefa ou sem permissão para editar notas'
                });
            }
        }
        
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        // Removido tags (coluna não existe)
        if (calendar_id !== undefined) updateData.calendar_id = calendar_id;
        if (task_id !== undefined) updateData.task_id = task_id;
        
        updateData.updated_at = new Date().toISOString();
        
        const { data, error } = await supabase
            .from('notes')
            .update(updateData)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        
        console.log('✅ UPDATE NOTE SUCCESS:', data[0]);
        
        res.json({
            success: true,
            message: 'Nota atualizada com sucesso!',
            data: data[0]
        });
        
    } catch (error) {
        console.error('❌ Erro ao atualizar nota:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar nota',
            error: error.message
        });
    }
});

  // DELETE - Deletar nota
  router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        console.log('🗑️ DELETE NOTE DEBUG:', { id, user_id });
        
        // Verificar se a nota existe e pertence ao usuário
        const { data: existing, error: checkError } = await supabase
            .from('notes')
            .select('id, calendar_id, task_id')
            .eq('id', id)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({
                success: false,
                message: 'Nota não encontrada'
            });
        }
        
        // Verificar se o usuário tem acesso à nota (via calendário ou tarefa)
        let hasAccess = false;
        
        if (existing.calendar_id) {
            const { data: calendar, error: calendarError } = await supabase
                .from('calendars')
                .select('id')
                .eq('id', existing.calendar_id)
                .eq('user_id', user_id)
                .single();
            
            if (calendar && !calendarError) {
                hasAccess = true;
            }
        }
        
        if (!hasAccess && existing.task_id) {
            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .select('id, calendar_id')
                .eq('id', existing.task_id)
                .single();
            
            if (task && !taskError) {
                const { data: calendar, error: calendarError } = await supabase
                    .from('calendars')
                    .select('id')
                    .eq('id', task.calendar_id)
                    .eq('user_id', user_id)
                    .single();
                
                if (calendar && !calendarError) {
                    hasAccess = true;
                }
            }
        }
        
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado a esta nota'
            });
        }
        
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        console.log('✅ DELETE NOTE SUCCESS:', { id });
        
        res.json({
            success: true,
            message: 'Nota deletada com sucesso!'
        });
        
    } catch (error) {
        console.error('❌ Erro ao deletar nota:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar nota',
            error: error.message
        });
    }
});

// READ - Buscar notas por texto
router.get('/search/:query', authenticateUser, async (req, res) => {
    try {
        const { query } = req.params;
        const user_id = req.user.id;
        
        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Query de busca deve ter pelo menos 2 caracteres'
            });
        }
        
        const { data, error } = await supabase
            .from('notes')
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
                )
            `)
            .eq('user_id', user_id)
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Adicionar permissões para cada nota
        const notesWithPermissions = (data || []).map(note => ({
            ...note,
            is_calendar_owner: true, // Temporariamente hardcoded para funcionar
            can_edit: true,          // Temporariamente hardcoded para funcionar
            can_delete: true,        // Temporariamente hardcoded para funcionar
            // Garantir que campos obrigatórios existam
            title: note.title || 'Sem título',
            content: note.content || '',
            created_at: note.created_at || new Date().toISOString(),
            updated_at: note.updated_at || note.created_at || new Date().toISOString()
        }));
        
        res.json({
            success: true,
            message: 'Busca realizada com sucesso!',
            query,
            data: notesWithPermissions
        });
        
    } catch (error) {
        console.error('❌ Erro na busca:', error);
        res.status(500).json({
            success: false,
            message: 'Erro na busca',
            error: error.message
        });
    }
});

module.exports = router;
