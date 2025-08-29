const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://snxccjgkqqniowserwtv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Configurando Supabase Client:');
console.log('URL:', supabaseUrl);
console.log('Key disponível:', !!supabaseKey);

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false
    },
    db: {
        schema: 'public'
    }
});

// Função para testar conexão
const testConnection = async () => {
    try {
        console.log('🧪 Testando conexão com Supabase...');
        
        // Testar conexão fazendo uma query simples
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('❌ Erro no teste de conexão Supabase:', error);
            return { success: false, error: error.message };
        }
        
        console.log('✅ Teste de conexão Supabase bem-sucedido:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Erro no teste de conexão:', error);
        return { success: false, error: error.message };
    }
};

// Função para executar queries SQL customizadas
const executeQuery = async (query, params = []) => {
    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            query_text: query,
            query_params: params
        });
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('❌ Erro na execução da query:', error);
        return { success: false, error: error.message };
    }
};

// Função para fazer login
const loginUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Função para registrar usuário
const registerUser = async (email, password, userData = {}) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    supabase,
    testConnection,
    executeQuery,
    loginUser,
    registerUser
};
