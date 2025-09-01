// Script para testar as rotas de compartilhamento
// Usando fetch nativo do Node.js 18+

const BASE_URL = 'https://api-back-xi.vercel.app';

// Função para fazer requisições
async function makeRequest(url, options = {}) {
    try {
        console.log(`\n🔍 Testando: ${options.method || 'GET'} ${url}`);
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        console.log(`📊 Status: ${response.status}`);
        console.log(`📋 Resposta:`, JSON.stringify(data, null, 2));
        
        return { status: response.status, data };
    } catch (error) {
        console.error(`❌ Erro:`, error.message);
        return { status: 500, error: error.message };
    }
}

// Testes das rotas
async function testRoutes() {
    console.log('🚀 INICIANDO TESTES DAS ROTAS DE COMPARTILHAMENTO\n');
    
    // 1. Testar rota de busca de usuários (sem autenticação - deve falhar)
    console.log('1️⃣ Testando busca de usuários sem autenticação:');
    await makeRequest(`${BASE_URL}/sharing/search-users?query=test`);
    
    // 2. Testar rota de compartilhamentos (sem autenticação - deve falhar)
    console.log('\n2️⃣ Testando compartilhamentos sem autenticação:');
    await makeRequest(`${BASE_URL}/sharing/shared`);
    
    // 3. Testar rota de calendário específico (sem autenticação - deve falhar)
    console.log('\n3️⃣ Testando compartilhamentos de calendário sem autenticação:');
    await makeRequest(`${BASE_URL}/sharing/calendar/1`);
    
    // 4. Testar rota de compartilhamento (sem autenticação - deve falhar)
    console.log('\n4️⃣ Testando criar compartilhamento sem autenticação:');
    await makeRequest(`${BASE_URL}/sharing/share`, {
        method: 'POST',
        body: JSON.stringify({
            item_type: 'calendar',
            item_id: 1,
            shared_with_email: 'test@example.com',
            permissions: 'read'
        })
    });
    
    console.log('\n✅ TESTES CONCLUÍDOS!');
    console.log('\n📝 NOTA: Todas as rotas devem retornar erro 401 (não autorizado)');
    console.log('   pois não estamos enviando token de autenticação.');
    console.log('\n🔧 Para testar com autenticação, você precisa:');
    console.log('   1. Fazer login no frontend');
    console.log('   2. Copiar o token JWT do localStorage');
    console.log('   3. Usar o token no header Authorization: Bearer <token>');
}

// Executar testes
testRoutes().catch(console.error);
