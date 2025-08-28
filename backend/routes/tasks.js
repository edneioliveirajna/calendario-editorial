const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// ========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ========================================
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Token não fornecido',
                message: 'Token de autenticação é obrigatório'
            });
        }

        const token = authHeader.substring(7);
        
        // Verificar token no banco
        const tokenResult = await pool.query(
            'SELECT user_id, expires_at FROM user_tokens WHERE token = $1 AND expires_at > NOW()',
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(401).json({
                error: 'Token inválido',
                message: 'Token expirado ou inválido'
            });
        }

        req.userId = tokenResult.rows[0].user_id;
        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível autenticar o usuário'
        });
    }
};

// ========================================
// ROTA: CRIAR TAREFA
// ========================================
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { calendar_id, title, description, content_type, platforms, status, scheduled_date, date } = req.body;
        const userId = req.userId;

        // Validação dos dados
        if (!calendar_id || !title || (!scheduled_date && !date)) {
            return res.status(400).json({
                error: 'Dados incompletos',
                message: 'ID do calendário, título e data são obrigatórios'
            });
        }

        // Usar date se fornecido, senão usar scheduled_date
        const finalDate = date || scheduled_date;

        // Verificar se o calendário pertence ao usuário
        console.log('🔍 DEBUG - Verificando acesso ao calendário:', { calendar_id, userId });
        
        const calendarResult = await pool.query(
            `SELECT c.id, c.user_id as owner_id,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        WHEN cs.id IS NOT NULL THEN true
                        ELSE false
                    END as can_access,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        ELSE false
                    END as is_owner,
                    cs.can_edit, cs.can_delete, cs.can_share
             FROM calendars c
             LEFT JOIN calendar_shares cs ON c.id = cs.calendar_id AND cs.shared_with_id = $1
             WHERE c.id = $2 AND (c.user_id = $1 OR cs.id IS NOT NULL)`,
            [userId, calendar_id]
        );

        console.log('🔍 DEBUG - Resultado da query:', calendarResult.rows);

        if (calendarResult.rows.length === 0) {
            console.log('❌ DEBUG - Calendário não encontrado ou sem acesso');
            return res.status(404).json({
                error: 'Calendário não encontrado',
                message: 'Calendário não existe ou você não tem acesso a ele'
            });
        }

        const calendar = calendarResult.rows[0];
        console.log('🔍 DEBUG - Calendário encontrado:', calendar);

        // Verificar permissões para criação de tarefas
        // Admin (dono do calendário) sempre pode criar
        // Usuário compartilhado só pode criar se tiver permissão can_edit
        if (!calendar.is_owner && !calendar.can_edit) {
            console.log('❌ DEBUG - Permissão negada para criação de tarefas');
            return res.status(403).json({
                error: 'Permissão negada',
                message: 'Você não tem permissão para criar tarefas neste calendário'
            });
        }

        console.log('✅ DEBUG - Permissão concedida para criação de tarefas');

        // Criar tarefa
        const newTask = await pool.query(
            'INSERT INTO tasks (calendar_id, title, description, content_type, platforms, status, scheduled_date, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [
                calendar_id,
                title,
                description || '',
                content_type || 'post',
                platforms ? JSON.stringify(platforms) : '[]',
                status || 'pending',
                finalDate || null, // Permitir null
                finalDate || null  // Permitir null
            ]
        );

        const task = newTask.rows[0];

        res.status(201).json({
            success: true,
            message: 'Tarefa criada com sucesso',
            task: {
                id: task.id,
                calendar_id: task.calendar_id,
                title: task.title,
                description: task.description,
                content_type: task.content_type,
                platforms: task.platforms,
                status: task.status,
                scheduled_date: task.scheduled_date,
                date: task.date,
                created_at: task.created_at
            }
        });

    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível criar a tarefa'
        });
    }
});

// ========================================
// ROTA: LISTAR TAREFAS DE UM CALENDÁRIO ESPECÍFICO
// ========================================
router.get('/calendar/:calendarId', authenticateToken, async (req, res) => {
    try {
        const { calendarId } = req.params;
        const userId = req.userId;

        // Verificar se o usuário tem acesso ao calendário (próprio ou compartilhado)
        const calendarResult = await pool.query(
            `SELECT c.id, c.name, c.user_id as owner_id,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        WHEN cs.id IS NOT NULL THEN true
                        ELSE false
                    END as can_access,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        ELSE false
                    END as is_owner,
                    cs.can_edit, cs.can_delete, cs.can_share
             FROM calendars c
             LEFT JOIN calendar_shares cs ON c.id = cs.calendar_id AND cs.shared_with_id = $1
             WHERE c.id = $2 AND (c.user_id = $1 OR cs.id IS NOT NULL)`,
            [userId, calendarId]
        );

        if (calendarResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Calendário não encontrado',
                message: 'Calendário não existe ou você não tem acesso a ele'
            });
        }

        const calendar = calendarResult.rows[0];

        // Buscar tarefas do calendário com informações sobre notas associadas
        const tasksResult = await pool.query(
            `SELECT t.id, t.calendar_id, t.title, t.description, t.content_type, 
                    t.platforms, t.status, t.scheduled_date, t.date, t.created_at, t.updated_at,
                    COUNT(n.id) as notes_count,
                    CASE WHEN COUNT(n.id) > 0 THEN true ELSE false END as has_notes
             FROM tasks t
             LEFT JOIN notes n ON t.id = n.task_id
             WHERE t.calendar_id = $1 
             GROUP BY t.id, t.calendar_id, t.title, t.description, t.content_type, 
                      t.platforms, t.status, t.scheduled_date, t.date, t.created_at, t.updated_at
             ORDER BY t.scheduled_date ASC, t.created_at DESC`,
            [calendarId]
        );

        const tasks = tasksResult.rows;

        res.json({
            success: true,
            message: 'Tarefas listadas com sucesso',
            tasks: tasks,
            total: tasks.length,
            calendar: {
                id: calendar.id,
                name: calendar.name,
                is_owner: calendar.is_owner,
                permissions: {
                    can_edit: calendar.can_edit,
                    can_delete: calendar.can_delete,
                    can_share: calendar.can_share
                }
            }
        });

    } catch (error) {
        console.error('Erro ao listar tarefas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível listar as tarefas'
        });
    }
});

// ========================================
// ROTA: LISTAR TODAS AS TAREFAS DO USUÁRIO
// ========================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { calendar_id } = req.query; // Pegar calendar_id da query string

        // Construir query base - SEM GROUP BY para testar
        let query = `SELECT t.id, t.calendar_id, t.title, t.description, t.content_type, 
                    t.platforms, t.status, t.scheduled_date, t.date, t.created_at, t.updated_at,
                    c.name as calendar_name, c.color as calendar_color,
                    0 as notes_count,
                    false as has_notes
             FROM tasks t
             INNER JOIN calendars c ON t.calendar_id = c.id
             WHERE c.user_id = $1`;
        
        let params = [userId];
        let paramIndex = 2;

        // Se calendar_id foi fornecido, filtrar por ele
        if (calendar_id) {
            query += ` AND t.calendar_id = $${paramIndex}`;
            params.push(parseInt(calendar_id));
            paramIndex++;
        }

        query += ` ORDER BY t.scheduled_date ASC, t.created_at DESC`;



        const tasksResult = await pool.query(query, params);

        const tasks = tasksResult.rows;

        res.json({
            success: true,
            message: 'Tarefas listadas com sucesso',
            tasks: tasks,
            total: tasks.length
        });

    } catch (error) {
        console.error('Erro ao listar tarefas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível listar as tarefas'
        });
    }
});

// ========================================
// ROTA: BUSCAR TAREFA ESPECÍFICA
// ========================================
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Buscar tarefa e verificar se pertence ao usuário
        const taskResult = await pool.query(
            `SELECT t.id, t.calendar_id, t.title, t.description, t.content_type, 
                    t.platforms, t.status, t.scheduled_date, t.date, t.created_at, t.updated_at,
                    c.name as calendar_name, c.color as calendar_color,
                    COUNT(n.id) as notes_count,
                    CASE WHEN COUNT(n.id) > 0 THEN true ELSE false END as has_notes
             FROM tasks t
             INNER JOIN calendars c ON t.calendar_id = c.id
             LEFT JOIN notes n ON t.id = n.task_id
             WHERE t.id = $1 AND c.user_id = $2
             GROUP BY t.id, t.calendar_id, t.title, t.description, t.content_type, 
                      t.platforms, t.status, t.scheduled_date, t.date, t.created_at, t.updated_at,
                      c.name, c.color`,
            [id, userId]
        );

        if (taskResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Tarefa não encontrada',
                message: 'Tarefa não existe ou não pertence a este usuário'
            });
        }

        const task = taskResult.rows[0];

        res.json({
            success: true,
            message: 'Tarefa encontrada com sucesso',
            task: task
        });

    } catch (error) {
        console.error('Erro ao buscar tarefa:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível buscar a tarefa'
        });
    }
});

// ========================================
// ROTA: ATUALIZAR TAREFA
// ========================================
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, content_type, platforms, status, scheduled_date, date } = req.body;
        const userId = req.userId;

        // Usar date se fornecido, senão usar scheduled_date
        const finalDate = date || scheduled_date;

        // Verificar se a tarefa existe e pertence ao usuário
        const existingTask = await pool.query(
            `SELECT t.id, t.calendar_id, c.user_id as owner_id,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        WHEN cs.id IS NOT NULL THEN true
                        ELSE false
                    END as can_access,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        ELSE false
                    END as is_owner,
                    cs.can_edit, cs.can_delete, cs.can_share
             FROM tasks t
             INNER JOIN calendars c ON t.calendar_id = c.id
             LEFT JOIN calendar_shares cs ON c.id = cs.calendar_id AND cs.shared_with_id = $1
             WHERE t.id = $2 AND (c.user_id = $1 OR cs.id IS NOT NULL)`,
            [userId, id]
        );

        if (existingTask.rows.length === 0) {
            return res.status(404).json({
                error: 'Tarefa não encontrada',
                message: 'Tarefa não existe ou você não tem acesso a ela'
            });
        }

        const taskInfo = existingTask.rows[0];

        // Verificar permissões para edição de tarefas
        // Admin (dono do calendário) sempre pode editar
        // Usuário compartilhado só pode editar se tiver permissão can_edit
        if (!taskInfo.is_owner && !taskInfo.can_edit) {
            return res.status(403).json({
                error: 'Permissão negada',
                message: 'Você não tem permissão para editar esta tarefa'
            });
        }

        // Atualizar tarefa
        const updatedTask = await pool.query(
            'UPDATE tasks SET title = $1, description = $2, content_type = $3, platforms = $4, status = $5, scheduled_date = $6, date = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
            [
                title,
                description,
                content_type,
                platforms ? JSON.stringify(platforms) : '[]',
                status,
                finalDate || null, // Permitir null
                finalDate || null, // Permitir null
                id
            ]
        );

        const task = updatedTask.rows[0];

        res.json({
            success: true,
            message: 'Tarefa atualizada com sucesso',
            task: {
                id: task.id,
                calendar_id: task.calendar_id,
                title: task.title,
                description: task.description,
                content_type: task.content_type,
                platforms: task.platforms,
                status: task.status,
                scheduled_date: task.scheduled_date,
                date: task.date,
                updated_at: task.updated_at
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível atualizar a tarefa'
        });
    }
});

// ========================================
// ROTA: EXCLUIR TAREFA
// ========================================
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Verificar se a tarefa existe e pertence ao usuário
        const existingTask = await pool.query(
            `SELECT t.id, t.calendar_id, c.user_id as owner_id,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        WHEN cs.id IS NOT NULL THEN true
                        ELSE false
                    END as can_access,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        ELSE false
                    END as is_owner,
                    cs.can_edit, cs.can_delete, cs.can_share
             FROM tasks t
             INNER JOIN calendars c ON t.calendar_id = c.id
             LEFT JOIN calendar_shares cs ON c.id = cs.calendar_id AND cs.shared_with_id = $1
             WHERE t.id = $2 AND (c.user_id = $1 OR cs.id IS NOT NULL)`,
            [userId, id]
        );

        if (existingTask.rows.length === 0) {
            return res.status(404).json({
                error: 'Tarefa não encontrada',
                message: 'Tarefa não existe ou você não tem acesso a ela'
            });
        }

        const taskInfo = existingTask.rows[0];

        // Verificar permissões para exclusão de tarefas
        // Admin (dono do calendário) sempre pode excluir
        // Usuário compartilhado só pode excluir se tiver permissão can_delete
        if (!taskInfo.is_owner && !taskInfo.can_delete) {
            return res.status(403).json({
                error: 'Permissão negada',
                message: 'Você não tem permissão para excluir esta tarefa'
            });
        }

        // Excluir tarefa
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Tarefa excluída com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível excluir a tarefa'
        });
    }
});

// ========================================
// ROTA: MOVER TAREFA (MUDAR DATA)
// ========================================
router.patch('/:id/move', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { new_date, status } = req.body;
        const userId = req.userId;

        // Verificar se a tarefa existe e pertence ao usuário
        const existingTask = await pool.query(
            `SELECT t.id, t.calendar_id, c.user_id as owner_id,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        WHEN cs.id IS NOT NULL THEN true
                        ELSE false
                    END as can_access,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        ELSE false
                    END as is_owner,
                    cs.can_edit, cs.can_delete, cs.can_share
             FROM tasks t
             INNER JOIN calendars c ON t.calendar_id = c.id
             LEFT JOIN calendar_shares cs ON c.id = cs.calendar_id AND cs.shared_with_id = $1
             WHERE t.id = $2 AND (c.user_id = $1 OR cs.id IS NOT NULL)`,
            [userId, id]
        );

        if (existingTask.rows.length === 0) {
            return res.status(404).json({
                error: 'Tarefa não encontrada',
                message: 'Tarefa não existe ou você não tem acesso a ela'
            });
        }

        const taskInfo = existingTask.rows[0];

        // Verificar permissões para movimentação de tarefas
        // Admin (dono do calendário) sempre pode mover
        // Usuário compartilhado só pode mover se tiver permissão can_edit
        if (!taskInfo.is_owner && !taskInfo.can_edit) {
            return res.status(403).json({
                error: 'Permissão negada',
                message: 'Você não tem permissão para mover esta tarefa'
            });
        }

        // Preparar dados para atualização
        let updateFields = [];
        let updateValues = [];
        let paramCount = 1;

        if (new_date) {
            updateFields.push(`scheduled_date = $${paramCount++}`);
            updateFields.push(`date = $${paramCount++}`);
            updateValues.push(new_date, new_date);
        }

        if (status) {
            updateFields.push(`status = $${paramCount++}`);
            updateValues.push(status);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                error: 'Dados insuficientes',
                message: 'Nova data ou status é obrigatório'
            });
        }

        updateValues.push(id); // ID da tarefa

        // Atualizar tarefa
        const updatedTask = await pool.query(
            `UPDATE tasks SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
            updateValues
        );

        const task = updatedTask.rows[0];

        res.json({
            success: true,
            message: 'Tarefa movida com sucesso',
            task: {
                id: task.id,
                scheduled_date: task.scheduled_date,
                date: task.date,
                status: task.status,
                updated_at: task.updated_at
            }
        });

    } catch (error) {
        console.error('Erro ao mover tarefa:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível mover a tarefa'
        });
    }
});

module.exports = router;
