const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('./config/supabase-client');

const router = express.Router();

// Rota GET para teste
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: '✅ Rota de auth funcionando!',
        timestamp: new Date().toISOString(),
        routes: ['/register', '/login', '/verify', '/logout']
    });
});

// Rota de registro
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, company_name } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Dados incompletos',
                message: 'Email e senha são obrigatórios'
            });
        }

        const finalName = company_name || name || email.split('@')[0];

        // Verificar se usuário já existe
        const { data: existingUser, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser && !userCheckError) {
            return res.status(400).json({
                success: false,
                error: 'Usuário já existe',
                message: 'Este email já está cadastrado'
            });
        }

        // Hash da senha
        const passwordHash = await bcrypt.hash(password, 10);

        // Criar usuário
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
                name: finalName,
                email: email,
                password_hash: passwordHash,
                created_at: new Date().toISOString()
            }])
            .select('id, name, email, created_at')
            .single();

        if (createError) throw createError;

        // Gerar token JWT
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                company_name: newUser.name
            },
            token: token
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: 'Não foi possível criar o usuário'
        });
    }
});

// Rota de login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Dados incompletos',
                message: 'Email e senha são obrigatórios'
            });
        }

        // Buscar usuário
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, name, email, password_hash')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            });
        }

        // Verificar senha
        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                company_name: user.name
            },
            token: token
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: 'Não foi possível realizar o login'
        });
    }
});

// Rota de verificação
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token não fornecido',
                message: 'Token de autenticação é obrigatório'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', decoded.userId)
            .single();

        if (userError || !user) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não encontrado',
                message: 'Token inválido'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                company_name: user.name
            }
        });

    } catch (error) {
        console.error('Erro na verificação:', error);
        res.status(401).json({
            success: false,
            error: 'Token inválido',
            message: 'Token expirado ou inválido'
        });
    }
});

module.exports = router;
