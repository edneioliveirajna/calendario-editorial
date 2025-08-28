const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Configuração do banco
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido ou expirado' });
        }
        req.user = user;
        next();
    });
};

// ========================================
// COMPARTILHAR CALENDÁRIO
// ========================================
router.post('/share', authenticateToken, async (req, res) => {
    const { calendarId, userEmail, permissions } = req.body;
    const ownerId = req.user.userId || req.user.id;

    try {
        // Verificar se o calendário existe e pertence ao usuário
        const calendarCheck = await pool.query(
            'SELECT id, name FROM calendars WHERE id = $1 AND user_id = $2',
            [calendarId, ownerId]
        );

        if (calendarCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Calendário não encontrado ou você não tem permissão para compartilhá-lo' });
        }

        // Buscar usuário pelo email
        const userCheck = await pool.query(
            'SELECT id, email, name FROM users WHERE email = $1',
            [userEmail]
        );

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const sharedWithId = userCheck.rows[0].id;

        // Verificar se não está tentando compartilhar consigo mesmo
        if (sharedWithId === ownerId) {
            return res.status(400).json({ error: 'Não é possível compartilhar um calendário consigo mesmo' });
        }

        // Verificar se já existe compartilhamento
        const existingShare = await pool.query(
            'SELECT id FROM calendar_shares WHERE calendar_id = $1 AND shared_with_id = $2',
            [calendarId, sharedWithId]
        );

        if (existingShare.rows.length > 0) {
            return res.status(400).json({ error: 'Este calendário já está compartilhado com este usuário' });
        }

        // Criar compartilhamento
        const permissionsData = {
            can_edit: permissions?.can_edit !== false,
            can_delete: permissions?.can_delete !== false,
            can_share: permissions?.can_share || false
        };

        const newShare = await pool.query(
            `INSERT INTO calendar_shares 
             (calendar_id, owner_id, shared_with_id, can_edit, can_delete, can_share) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [calendarId, ownerId, sharedWithId, permissionsData.can_edit, permissionsData.can_delete, permissionsData.can_share]
        );

        res.status(201).json({
            message: 'Calendário compartilhado com sucesso',
            share: newShare.rows[0],
            sharedWith: {
                id: sharedWithId,
                email: userCheck.rows[0].email,
                name: userCheck.rows[0].name
            }
        });

    } catch (error) {
        console.error('Erro ao compartilhar calendário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ========================================
// LISTAR COMPARTILHAMENTOS DE UM CALENDÁRIO
// ========================================
router.get('/calendar/:calendarId', authenticateToken, async (req, res) => {
    const { calendarId } = req.params;
    const userId = req.user.userId || req.user.id;

    try {
        // Verificar se o usuário é dono do calendário ou tem acesso compartilhado
        const accessCheck = await pool.query(
            `SELECT c.id, c.name, c.user_id as owner_id,
                    CASE 
                        WHEN c.user_id = $1 THEN true
                        WHEN cs.id IS NOT NULL THEN cs.can_edit
                        ELSE false
                    END as can_access
             FROM calendars c
             LEFT JOIN calendar_shares cs ON c.id = cs.calendar_id AND cs.shared_with_id = $1
             WHERE c.id = $2`,
            [userId, calendarId]
        );

        if (accessCheck.rows.length === 0 || !accessCheck.rows[0].can_access) {
            return res.status(403).json({ error: 'Acesso negado a este calendário' });
        }

        // Buscar todos os compartilhamentos do calendário
        const shares = await pool.query(
            `SELECT cs.*, u.email, u.name as user_name
             FROM calendar_shares cs
             JOIN users u ON cs.shared_with_id = u.id
             WHERE cs.calendar_id = $1
             ORDER BY cs.shared_at DESC`,
            [calendarId]
        );

        res.json({
            calendar: {
                id: accessCheck.rows[0].id,
                name: accessCheck.rows[0].name,
                owner_id: accessCheck.rows[0].owner_id,
                is_owner: accessCheck.rows[0].owner_id === userId
            },
            shares: shares.rows
        });

    } catch (error) {
        console.error('Erro ao listar compartilhamentos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ========================================
// REMOVER COMPARTILHAMENTO
// ========================================
router.delete('/share/:shareId', authenticateToken, async (req, res) => {
    const { shareId } = req.params;
    const userId = req.user.userId || req.user.id;

    try {
        // Verificar se o usuário é dono do calendário
        const shareCheck = await pool.query(
            `SELECT cs.*, c.name as calendar_name
             FROM calendar_shares cs
             JOIN calendars c ON cs.calendar_id = c.id
             WHERE cs.id = $1 AND cs.owner_id = $2`,
            [shareId, userId]
        );

        if (shareCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Você não tem permissão para remover este compartilhamento' });
        }

        // Remover compartilhamento
        await pool.query('DELETE FROM calendar_shares WHERE id = $1', [shareId]);

        res.json({
            message: 'Compartilhamento removido com sucesso',
            removedShare: shareCheck.rows[0]
        });

    } catch (error) {
        console.error('Erro ao remover compartilhamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ========================================
// ATUALIZAR PERMISSÕES DE COMPARTILHAMENTO
// ========================================
router.put('/share/:shareId', authenticateToken, async (req, res) => {
    const { shareId } = req.params;
    const { permissions } = req.body;
    const userId = req.user.userId || req.user.id;

    try {
        // Verificar se o usuário é dono do calendário
        const shareCheck = await pool.query(
            `SELECT cs.*, c.name as calendar_name
             FROM calendar_shares cs
             JOIN calendars c ON cs.calendar_id = c.id
             WHERE cs.id = $1 AND cs.owner_id = $2`,
            [shareId, userId]
        );

        if (shareCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Você não tem permissão para editar este compartilhamento' });
        }

        // Atualizar permissões
        const updatedShare = await pool.query(
            `UPDATE calendar_shares 
             SET can_edit = $1, can_delete = $2, can_share = $3
             WHERE id = $4
             RETURNING *`,
            [
                permissions?.can_edit !== false,
                permissions?.can_delete !== false,
                permissions?.can_share || false,
                shareId
            ]
        );

        res.json({
            message: 'Permissões atualizadas com sucesso',
            updatedShare: updatedShare.rows[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar permissões:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ========================================
// LISTAR CALENDÁRIOS COMPARTILHADOS COM O USUÁRIO
// ========================================
router.get('/shared-with-me', authenticateToken, async (req, res) => {
    const userId = req.user.userId || req.user.id;

    try {
        // Buscar calendários compartilhados com o usuário
        const sharedCalendars = await pool.query(
            `SELECT c.id, c.name, c.description, c.created_at,
                    cs.can_edit, cs.can_delete, cs.can_share, cs.shared_at,
                    u.name as owner_name, u.email as owner_email
             FROM calendar_shares cs
             JOIN calendars c ON cs.calendar_id = c.id
             JOIN users u ON cs.owner_id = u.id
             WHERE cs.shared_with_id = $1
             ORDER BY cs.shared_at DESC`,
            [userId]
        );

        res.json({
            sharedCalendars: sharedCalendars.rows
        });

    } catch (error) {
        console.error('Erro ao listar calendários compartilhados:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ========================================
// BUSCAR USUÁRIOS PARA COMPARTILHAR
// ========================================
router.get('/search-users', authenticateToken, async (req, res) => {
    const { query } = req.query;
    const currentUserId = req.user.userId || req.user.id;

    try {
        // Buscar usuários pelo nome ou email (excluindo o usuário atual)
        const users = await pool.query(
            `SELECT id, name, email
             FROM users
             WHERE (name ILIKE $1 OR email ILIKE $1)
             AND id != $2
             ORDER BY name
             LIMIT 10`,
            [`%${query}%`, currentUserId]
        );

        res.json({
            users: users.rows
        });

    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
