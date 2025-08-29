const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase-client');

// TESTE - Verificar estrutura da tabela (PUBLICA - sem autenticação)
router.get('/test-table', async (req, res) => {
    try {
        console.log('🔍 API DEBUG: Testando estrutura da tabela calendars');
        
        // Tentar fazer um select simples para ver a estrutura
        const { data, error } = await supabase
            .from('calendars')
            .select('*')
            .limit(1);
        
        console.log('🔍 API DEBUG: Teste de select - data:', data);
        console.log('🔍 API DEBUG: Teste de select - error:', error);
        
        if (error) {
            console.error('❌ API ERROR: Erro ao testar tabela:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao testar tabela',
                error: error.message
            });
        }
        
        // Teste adicional: tentar inserir um registro de teste (será revertido)
        console.log('🔍 API DEBUG: Testando inserção de teste...');
        
        const testData = {
            name: 'TESTE_TEMPORARIO',
            company_name: 'TESTE_TEMPORARIO',
            start_month: '2025-01',
            description: 'Teste de estrutura da tabela',
            color: '#FF0000',
            is_public: false,
            user_id: 1, // ID de teste
            unique_url: 'teste-temporario-' + Date.now(),
            created_at: new Date().toISOString()
        };
        
        console.log('🔍 API DEBUG: Dados de teste para inserção:', testData);
        
        const { data: insertData, error: insertError } = await supabase
            .from('calendars')
            .insert([testData])
            .select();
        
        console.log('🔍 API DEBUG: Teste de inserção - data:', insertData);
        console.log('🔍 API DEBUG: Teste de inserção - error:', insertError);
        
        // Se a inserção funcionou, deletar o registro de teste
        if (insertData && insertData.length > 0) {
            console.log('🔍 API DEBUG: Inserção de teste funcionou, deletando...');
            
            const { error: deleteError } = await supabase
                .from('calendars')
                .delete()
                .eq('id', insertData[0].id);
            
            console.log('🔍 API DEBUG: Deleção de teste - error:', deleteError);
        }
        
        res.json({
            success: true,
            message: 'Teste da tabela concluído',
            table_test: {
                select_works: !error,
                data_returned: data,
                insert_test: {
                    works: !insertError,
                    data: insertData,
                    error: insertError
                }
            }
        });
        
    } catch (error) {
        console.error('❌ API ERROR: Erro no teste da tabela:', error);
        res.status(500).json({
            success: false,
            message: 'Erro no teste da tabela',
            error: error.message
        });
    }
});

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
        
        console.log('🔍 API DEBUG: Iniciando criação de calendário');
        console.log('🔍 API DEBUG: Dados recebidos:', { company_name, start_month, name, description, color, is_public });
        console.log('🔍 API DEBUG: User ID:', user_id);
        
        // Usar company_name se fornecido, senão usar name
        const calendarName = company_name || name;
        
        if (!calendarName) {
            console.log('❌ API DEBUG: Nome do calendário não fornecido');
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
        
        console.log('🔍 API DEBUG: Dados para inserção:', {
            company_name: calendarName,
            start_month: start_month || null,
            name: calendarName,
            description: description || '',
            color: color || '#3B82F6',
            is_public: is_public || false,
            user_id,
            unique_url: uniqueUrl,
            created_at: new Date().toISOString()
        });
        
        console.log('🔍 API DEBUG: Chamando Supabase insert...');
        
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
        
        console.log('🔍 API DEBUG: Resposta do Supabase - data:', data);
        console.log('🔍 API DEBUG: Resposta do Supabase - error:', error);
        console.log('🔍 API DEBUG: Tipo de data:', typeof data);
        console.log('🔍 API DEBUG: Data é array?', Array.isArray(data));
        console.log('🔍 API DEBUG: Tamanho de data:', data ? data.length : 'undefined');
        
        if (error) {
            console.error('❌ API ERROR: Erro do Supabase:', error);
            throw error;
        }
        
        if (!data || data.length === 0) {
            console.error('❌ API ERROR: Supabase retornou dados vazios após inserção');
            return res.status(500).json({
                success: false,
                message: 'Erro: Calendário não foi criado no banco de dados'
            });
        }
        
        console.log('✅ API DEBUG: Calendário criado com sucesso no banco');
        console.log('✅ API DEBUG: Dados retornados:', data[0]);
        
        res.status(201).json({
            success: true,
            message: 'Calendário criado com sucesso!',
            calendar: data[0]  // Retornar 'calendar' em vez de 'data'
        });
        
    } catch (error) {
        console.error('❌ API ERROR: Erro ao criar calendário:', error);
        console.error('❌ API ERROR: Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar calendário',
            error: error.message
        });
    }
});

// Rota de teste removida (movida para cima, antes do middleware)

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
