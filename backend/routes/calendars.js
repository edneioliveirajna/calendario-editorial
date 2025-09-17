const express = require('express');
const { v4: uuidv4 } = require('uuid');
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
// ROTA: CRIAR CALENDÁRIO
// ========================================
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, company_name, start_month, description, color } = req.body;
        const userId = req.userId;

        // Validação dos dados
        if (!name && !company_name) {
            return res.status(400).json({
                error: 'Dados incompletos',
                message: 'Nome do calendário ou nome da empresa é obrigatório'
            });
        }

        // Usar company_name se fornecido, senão usar name
        const finalCompanyName = company_name || name;
        const finalName = name || company_name;

        // Gerar URL única
        const uniqueUrl = uuidv4();

        // Criar calendário
        const newCalendar = await pool.query(
            'INSERT INTO calendars (user_id, name, company_name, start_month, description, color, unique_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [userId, finalName, finalCompanyName, start_month || '2025-08', description || '', color || '#3B82F6', uniqueUrl]
        );

        const calendar = newCalendar.rows[0];

        res.status(201).json({
            success: true,
            message: 'Calendário criado com sucesso',
            calendar: {
                id: calendar.id,
                name: calendar.name,
                company_name: calendar.company_name,
                start_month: calendar.start_month,
                description: calendar.description,
                color: calendar.color,
                unique_url: calendar.unique_url,
                created_at: calendar.created_at
            }
        });

    } catch (error) {
        console.error('Erro ao criar calendário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível criar o calendário'
        });
    }
});

// ========================================
// ROTA: LISTAR CALENDÁRIOS
// ========================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;

        // Buscar calendários do usuário (próprios)
        const ownCalendarsResult = await pool.query(
            'SELECT id, name, company_name, start_month, description, color, unique_url, created_at, updated_at, user_id as owner_id, true as is_owner, true as can_edit, true as can_delete, true as can_share FROM calendars WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        // Buscar calendários compartilhados com o usuário
        const sharedCalendarsResult = await pool.query(
            `SELECT c.id, c.name, c.company_name, c.start_month, c.description, c.color, c.unique_url, c.created_at, c.updated_at, c.user_id as owner_id, false as is_owner,
                    cs.can_edit, cs.can_delete, cs.can_share, cs.shared_at,
                    u.name as owner_name, u.email as owner_email
             FROM calendar_shares cs
             JOIN calendars c ON cs.calendar_id = c.id
             JOIN users u ON cs.owner_id = u.id
             WHERE cs.shared_with_id = $1
             ORDER BY cs.shared_at DESC`,
            [userId]
        );

        // Combinar os resultados
        const ownCalendars = ownCalendarsResult.rows;
        const sharedCalendars = sharedCalendarsResult.rows;
        const allCalendars = [...ownCalendars, ...sharedCalendars];

        res.json({
            success: true,
            message: 'Calendários listados com sucesso',
            calendars: allCalendars,
            total: allCalendars.length,
            own: ownCalendars.length,
            shared: sharedCalendars.length
        });

    } catch (error) {
        console.error('Erro ao listar calendários:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível listar os calendários'
        });
    }
});

// ========================================
// ROTA: BUSCAR CALENDÁRIO ESPECÍFICO
// ========================================
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Buscar calendário específico do usuário (próprio ou compartilhado)
        const calendarResult = await pool.query(
            `SELECT c.id, c.name, c.company_name, c.start_month, c.description, c.color, c.unique_url, c.created_at, c.updated_at, c.user_id as owner_id,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        WHEN cs.id IS NOT NULL THEN true
                        ELSE false
                    END as can_access,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        ELSE false
                    END as is_owner,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        ELSE cs.can_edit
                    END as can_edit,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        ELSE cs.can_delete
                    END as can_delete,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        ELSE cs.can_share
                    END as can_share,
                    u.name as owner_name, u.email as owner_email
             FROM calendars c
             LEFT JOIN calendar_shares cs ON c.id = cs.calendar_id AND cs.shared_with_id = $1
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.id = $2 AND (c.user_id = $1 OR cs.id IS NOT NULL)`,
            [userId, id]
        );

        if (calendarResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Calendário não encontrado',
                message: 'Calendário não existe ou você não tem acesso a ele'
            });
        }

        const calendar = calendarResult.rows[0];

        res.json({
            success: true,
            message: 'Calendário encontrado com sucesso',
            calendar: calendar
        });

    } catch (error) {
        console.error('Erro ao buscar calendário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível buscar o calendário'
        });
    }
});

// ========================================
// ROTA: ATUALIZAR CALENDÁRIO
// ========================================
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, company_name, start_month, description, color } = req.body;
        const userId = req.userId;

        // Verificar se o calendário existe e pertence ao usuário
        const existingCalendar = await pool.query(
            'SELECT id, start_month FROM calendars WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existingCalendar.rows.length === 0) {
            return res.status(404).json({
                error: 'Calendário não encontrado',
                message: 'Calendário não existe ou não pertence a este usuário'
            });
        }

        const oldStartMonth = existingCalendar.rows[0].start_month;
        const newStartMonth = start_month;

        console.log('🔍 DEBUG - Valores dos meses:');
        console.log(`   oldStartMonth: ${oldStartMonth} (tipo: ${typeof oldStartMonth})`);
        console.log(`   newStartMonth: ${newStartMonth} (tipo: ${typeof newStartMonth})`);
        console.log(`   São diferentes? ${oldStartMonth !== newStartMonth}`);

        // Atualizar calendário
        const updatedCalendar = await pool.query(
            'UPDATE calendars SET name = $1, company_name = $2, start_month = $3, description = $4, color = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING *',
            [name || company_name, company_name, start_month, description || '', color || '#3B82F6', id, userId]
        );

        const calendar = updatedCalendar.rows[0];

        // Se o mês de início foi alterado, ajustar as datas das tarefas
        if (oldStartMonth && newStartMonth && oldStartMonth !== newStartMonth) {
            console.log(`🔄 Ajustando datas das tarefas do calendário ${id}:`);
            console.log(`   Mês anterior: ${oldStartMonth}`);
            console.log(`   Novo mês: ${newStartMonth}`);

            try {
                // Buscar todas as tarefas do calendário
                const tasksResult = await pool.query(
                    'SELECT id, scheduled_date, date FROM tasks WHERE calendar_id = $1',
                    [id]
                );

                const tasks = tasksResult.rows;
                console.log(`   Total de tarefas encontradas: ${tasks.length}`);

                if (tasks.length > 0) {
                    // Calcular a diferença de meses entre as datas
                    const [oldYear, oldMonth] = oldStartMonth.split('-').map(Number);
                    const [newYear, newMonth] = newStartMonth.split('-').map(Number);
                    
                    const monthDiff = (newYear - oldYear) * 12 + (newMonth - oldMonth);
                    console.log(`   Diferença de meses: ${monthDiff}`);

                    // Atualizar cada tarefa
                    for (const task of tasks) {
                        const taskDate = task.date || task.scheduled_date;
                        if (taskDate) {
                            // Criar nova data ajustada
                            const currentDate = new Date(taskDate);
                            const newDate = new Date(currentDate);
                            newDate.setMonth(currentDate.getMonth() + monthDiff);

                            console.log(`   Tarefa ${task.id}: ${taskDate} → ${newDate.toISOString().split('T')[0]}`);

                            // Atualizar tanto scheduled_date quanto date
                            await pool.query(
                                'UPDATE tasks SET scheduled_date = $1, date = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                                [newDate.toISOString().split('T')[0], task.id]
                            );
                        }
                    }

                    console.log(`✅ Todas as ${tasks.length} tarefas foram ajustadas com sucesso!`);
                }
            } catch (taskUpdateError) {
                console.error('❌ Erro ao ajustar tarefas:', taskUpdateError);
                // Não falhar a atualização do calendário por erro nas tarefas
                // Apenas logar o erro
            }
        } else {
            console.log('⚠️  Lógica de ajuste automático não executada:');
            console.log(`   oldStartMonth existe? ${!!oldStartMonth}`);
            console.log(`   newStartMonth existe? ${!!newStartMonth}`);
            console.log(`   São diferentes? ${oldStartMonth !== newStartMonth}`);
        }

        res.json({
            success: true,
            message: 'Calendário atualizado com sucesso',
            calendar: {
                id: calendar.id,
                name: calendar.name,
                company_name: calendar.company_name,
                start_month: calendar.start_month,
                description: calendar.description,
                color: calendar.color,
                unique_url: calendar.unique_url,
                updated_at: calendar.updated_at
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar calendário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível atualizar o calendário'
        });
    }
});

// ========================================
// ROTA: EXCLUIR CALENDÁRIO
// ========================================
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Verificar se o calendário existe e pertence ao usuário
        const existingCalendar = await pool.query(
            'SELECT id FROM calendars WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existingCalendar.rows.length === 0) {
            return res.status(404).json({
                error: 'Calendário não encontrado',
                message: 'Calendário não existe ou não pertence a este usuário'
            });
        }

        // Excluir calendário (as tarefas serão excluídas automaticamente por CASCADE)
        await pool.query(
            'DELETE FROM calendars WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        res.json({
            success: true,
            message: 'Calendário excluído com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir calendário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível excluir o calendário'
        });
    }
});

module.exports = router;
