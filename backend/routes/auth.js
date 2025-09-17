const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

const router = express.Router();

// ========================================
// ROTA: REGISTRO DE USUÁRIO
// ========================================
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, company_name } = req.body;

        // Validação dos dados
        if (!email || !password) {
            return res.status(400).json({
                error: 'Dados incompletos',
                message: 'Email e senha são obrigatórios'
            });
        }

        // Usar company_name se fornecido, senão usar name, senão usar email como fallback
        const finalName = company_name || name || email.split('@')[0];

        // Verificar se o usuário já existe
        const userExists = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                error: 'Usuário já existe',
                message: 'Este email já está cadastrado'
            });
        }

        // Hash da senha
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Criar usuário
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [finalName, email, passwordHash]
        );

        const user = newUser.rows[0];

        // Gerar token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Salvar token no banco
        await pool.query(
            'INSERT INTO user_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, token, new Date(Date.now() + 24 * 60 * 60 * 1000)]
        );

        // Retornar resposta
        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                company_name: user.name // Compatibilidade com frontend
            },
            token: token
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível criar o usuário'
        });
    }
});

// ========================================
// ROTA: LOGIN DE USUÁRIO
// ========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validação dos dados
        if (!email || !password) {
            return res.status(400).json({
                error: 'Dados incompletos',
                message: 'Email e senha são obrigatórios'
            });
        }

        // Buscar usuário
        const userResult = await pool.query(
            'SELECT id, name, email, password_hash FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            });
        }

        const user = userResult.rows[0];

        // Verificar senha
        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Salvar token no banco
        await pool.query(
            'INSERT INTO user_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, token, new Date(Date.now() + 24 * 60 * 60 * 1000)]
        );

        // Retornar resposta
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                company_name: user.name // Compatibilidade com frontend
            },
            token: token
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível realizar o login'
        });
    }
});

// ========================================
// ROTA: VERIFICAR TOKEN
// ========================================
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: 'Token não fornecido',
                message: 'Token é obrigatório'
            });
        }

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

        // Buscar dados do usuário
        const userResult = await pool.query(
            'SELECT id, name, email FROM users WHERE id = $1',
            [tokenResult.rows[0].user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                error: 'Usuário não encontrado',
                message: 'Token válido mas usuário não existe'
            });
        }

        const user = userResult.rows[0];

        res.json({
            success: true,
            message: 'Token válido',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                company_name: user.name // Compatibilidade com frontend
            }
        });

    } catch (error) {
        console.error('Erro na verificação:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível verificar o token'
        });
    }
});

// ========================================
// ROTA: LOGOUT (REMOÇÃO DO TOKEN)
// ========================================
router.post('/logout', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: 'Token não fornecido',
                message: 'Token é obrigatório'
            });
        }

        // Remover token do banco
        await pool.query(
            'DELETE FROM user_tokens WHERE token = $1',
            [token]
        );

        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });

    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível realizar o logout'
        });
    }
});

module.exports = router;
