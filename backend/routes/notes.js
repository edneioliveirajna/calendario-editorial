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
// ROTA: CRIAR NOTA
// ========================================
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, content, calendar_id, task_id, date, is_general } = req.body;
        const userId = req.userId;

        // Validação dos dados
        if (!title) {
            return res.status(400).json({
                error: 'Dados incompletos',
                message: 'Título da nota é obrigatório'
            });
        }

        // Criar nota com os novos campos
        const newNote = await pool.query(
            `INSERT INTO notes (user_id, title, content, calendar_id, task_id, date, is_general) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [userId, title, content || '', calendar_id || null, task_id || null, date || null, is_general || false]
        );

        const note = newNote.rows[0];

        res.status(201).json({
            success: true,
            message: 'Nota criada com sucesso',
            note: {
                id: note.id,
                title: note.title,
                content: note.content,
                calendar_id: note.calendar_id,
                task_id: note.task_id,
                date: note.date,
                is_general: note.is_general,
                created_at: note.created_at
            }
        });

    } catch (error) {
        console.error('Erro ao criar nota:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível criar a nota'
        });
    }
});

// ========================================
// ROTA: LISTAR NOTAS DO USUÁRIO
// ========================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { calendar_id, task_id, is_general } = req.query;

        let query = `
            SELECT n.id, n.title, n.content, n.calendar_id, n.task_id, n.date, n.is_general, 
                   n.created_at, n.updated_at,
                   c.name as calendar_name,
                   t.title as task_title,
                   CASE 
                       WHEN c.user_id = $1 THEN true
                       WHEN cs.id IS NOT NULL THEN true
                       ELSE false
                   END as can_access,
                   CASE 
                       WHEN c.user_id = $1 THEN true
                       ELSE false
                   END as is_calendar_owner,
                   cs.can_edit, cs.can_delete, cs.can_share
            FROM notes n
            LEFT JOIN calendars c ON n.calendar_id = c.id
            LEFT JOIN tasks t ON n.task_id = t.id
            LEFT JOIN calendar_shares cs ON c.id = cs.calendar_id AND cs.shared_with_id = $1
            WHERE (n.user_id = $1 OR (n.calendar_id IS NOT NULL AND (c.user_id = $1 OR cs.id IS NOT NULL)))
        `;
        
        const params = [userId];
        let paramIndex = 2;

        // Filtros opcionais
        if (calendar_id) {
            query += ` AND n.calendar_id = $${paramIndex}`;
            params.push(calendar_id);
            paramIndex++;
        }

        if (task_id) {
            query += ` AND n.task_id = $${paramIndex}`;
            params.push(task_id);
            paramIndex++;
        }

        if (is_general !== undefined) {
            query += ` AND n.is_general = $${paramIndex}`;
            params.push(is_general === 'true');
            paramIndex++;
        }

        query += ' ORDER BY n.updated_at DESC, n.created_at DESC';

        const notesResult = await pool.query(query, params);
        const notes = notesResult.rows;

        res.json({
            success: true,
            message: 'Notas listadas com sucesso',
            notes: notes,
            total: notes.length
        });

    } catch (error) {
        console.error('Erro ao listar notas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível listar as notas'
        });
    }
});

// ========================================
// ROTA: BUSCAR NOTA ESPECÍFICA
// ========================================
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Verificar se a nota existe e se o usuário tem acesso (própria, compartilhada ou é dono do calendário)
        const noteResult = await pool.query(
            `SELECT n.id, n.title, n.content, n.calendar_id, n.task_id, n.date, n.is_general,
                    n.created_at, n.updated_at,
                    c.name as calendar_name,
                    t.title as task_title,
                    CASE 
                        WHEN n.user_id = $1 THEN true
                        WHEN cs.id IS NOT NULL THEN true
                        WHEN c.user_id = $1 THEN true
                        ELSE false
                    END as can_access,
                    CASE 
                        WHEN n.user_id = $1 THEN true
                        ELSE false
                    END as is_owner,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        ELSE false
                    END as is_calendar_owner,
                    cs.can_edit, cs.can_delete, cs.can_share
             FROM notes n
             LEFT JOIN calendars c ON n.calendar_id = c.id
             LEFT JOIN tasks t ON n.task_id = t.id
             LEFT JOIN calendar_shares cs ON n.calendar_id = cs.calendar_id AND cs.shared_with_id = $1
             WHERE n.id = $2 AND (n.user_id = $1 OR cs.id IS NOT NULL OR c.user_id = $1)`,
            [userId, id]
        );

        if (noteResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Nota não encontrada',
                message: 'Nota não existe ou você não tem acesso a ela'
            });
        }

        const note = noteResult.rows[0];

        res.json({
            success: true,
            message: 'Nota encontrada com sucesso',
            note: note
        });

    } catch (error) {
        console.error('Erro ao buscar nota:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível buscar a nota'
        });
    }
});

// ========================================
// ROTA: ATUALIZAR NOTA
// ========================================
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.userId;

        // Verificar se a nota existe e se o usuário tem acesso (própria, compartilhada ou é dono do calendário)
        const existingNote = await pool.query(
            `SELECT n.id, n.calendar_id, n.user_id as note_owner_id,
                    CASE 
                        WHEN n.user_id = $1 THEN true
                        WHEN cs.id IS NOT NULL THEN true
                        WHEN c.user_id = $1 THEN true
                        ELSE false
                    END as can_access,
                    CASE 
                        WHEN n.user_id = $1 THEN true
                        ELSE false
                    END as is_owner,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        ELSE false
                    END as is_calendar_owner,
                    cs.can_edit, cs.can_delete, cs.can_share
             FROM notes n
             LEFT JOIN calendars c ON n.calendar_id = c.id
             LEFT JOIN calendar_shares cs ON n.calendar_id = cs.calendar_id AND cs.shared_with_id = $1
             WHERE n.id = $2 AND (n.user_id = $1 OR cs.id IS NOT NULL OR c.user_id = $1)`,
            [userId, id]
        );

        if (existingNote.rows.length === 0) {
            return res.status(404).json({
                error: 'Nota não encontrada',
                message: 'Nota não existe ou você não tem acesso a ela'
            });
        }

        const note = existingNote.rows[0];

        // Verificar permissões para edição
        // Admin (dono do calendário) sempre pode editar
        // Usuário compartilhado só pode editar se tiver permissão can_edit
        if (!note.is_owner && !note.is_calendar_owner && !note.can_edit) {
            return res.status(403).json({
                error: 'Permissão negada',
                message: 'Você não tem permissão para editar esta nota'
            });
        }

        // Atualizar nota
        const updatedNote = await pool.query(
            `UPDATE notes SET title = $1, content = $2, calendar_id = $3, task_id = $4, date = $5, is_general = $6, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $7 RETURNING *`,
            [title, content, req.body.calendar_id || null, req.body.task_id || null, req.body.date || null, req.body.is_general || false, id]
        );

        const updatedNoteData = updatedNote.rows[0];

        res.json({
            success: true,
            message: 'Nota atualizada com sucesso',
            note: {
                id: updatedNoteData.id,
                title: updatedNoteData.title,
                content: updatedNoteData.content,
                calendar_id: updatedNoteData.calendar_id,
                task_id: updatedNoteData.task_id,
                date: updatedNoteData.date,
                is_general: updatedNoteData.is_general,
                updated_at: updatedNoteData.updated_at
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar nota:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível atualizar a nota'
        });
    }
});

// ========================================
// ROTA: EXCLUIR NOTA
// ========================================
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Verificar se a nota existe e se o usuário tem acesso (própria, compartilhada ou é dono do calendário)
        const existingNote = await pool.query(
            `SELECT n.id, n.calendar_id, n.user_id as note_owner_id,
                    CASE 
                        WHEN n.user_id = $1 THEN true
                        WHEN cs.id IS NOT NULL THEN true
                        WHEN c.user_id = $1 THEN true
                        ELSE false
                    END as can_access,
                    CASE 
                        WHEN n.user_id = $1 THEN true
                        ELSE false
                    END as is_owner,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        ELSE false
                    END as is_calendar_owner,
                    cs.can_edit, cs.can_delete, cs.can_share
             FROM notes n
             LEFT JOIN calendars c ON n.calendar_id = c.id
             LEFT JOIN calendar_shares cs ON n.calendar_id = cs.calendar_id AND cs.shared_with_id = $1
             WHERE n.id = $2 AND (n.user_id = $1 OR cs.id IS NOT NULL OR c.user_id = $1)`,
            [userId, id]
        );

        if (existingNote.rows.length === 0) {
            return res.status(404).json({
                error: 'Nota não encontrada',
                message: 'Nota não existe ou você não tem acesso a ela'
            });
        }

        const note = existingNote.rows[0];

        // Verificar permissões para exclusão
        // Admin (dono do calendário) sempre pode excluir
        // Usuário compartilhado só pode excluir se tiver permissão can_delete
        if (!note.is_owner && !note.is_calendar_owner && !note.can_delete) {
            return res.status(403).json({
                error: 'Permissão negada',
                message: 'Você não tem permissão para excluir esta nota'
            });
        }

        // Excluir nota
        await pool.query('DELETE FROM notes WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Nota excluída com sucesso',
            note: {
                id: note.id,
                calendar_id: note.calendar_id,
                was_owner: note.is_owner
            }
        });

    } catch (error) {
        console.error('Erro ao excluir nota:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível excluir a nota'
        });
    }
});

module.exports = router;
