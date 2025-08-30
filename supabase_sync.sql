-- ========================================
-- SINCRONIZAÇÃO SUPABASE COM BANCO LOCAL
-- CALENDARIO EDITORIAL
-- ========================================

-- ========================================
-- ATUALIZAR TABELA CALENDARS
-- ========================================

-- Adicionar campo company_name (se não existir)
ALTER TABLE calendars 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

-- Adicionar campo start_month (se não existir)
ALTER TABLE calendars 
ADD COLUMN IF NOT EXISTS start_month VARCHAR(7);

-- ========================================
-- VERIFICAR ESTRUTURA FINAL
-- ========================================

-- Listar todas as colunas da tabela calendars
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'calendars' 
ORDER BY ordinal_position;

-- ========================================
-- VERIFICAR SE OS CAMPOS FORAM ADICIONADOS
-- ========================================

-- Verificar se company_name existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'calendars' AND column_name = 'company_name'
        ) THEN '✅ company_name EXISTE'
        ELSE '❌ company_name NÃO EXISTE'
    END as status_company_name;

-- Verificar se start_month existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'calendars' AND column_name = 'start_month'
        ) THEN '✅ start_month EXISTE'
        ELSE '❌ start_month NÃO EXISTE'
    END as status_start_month;

-- ========================================
-- TESTE DE INSERÇÃO (OPCIONAL)
-- ========================================

-- Testar inserção com os novos campos
INSERT INTO calendars (
    user_id, 
    name, 
    description, 
    color, 
    unique_url, 
    company_name, 
    start_month
) VALUES (
    1, 
    'TESTE_SINCRONIZACAO', 
    'Teste após sincronização', 
    '#00FF00', 
    'teste-sync-' || EXTRACT(EPOCH FROM NOW())::bigint,
    'Empresa Teste',
    '2025-01'
) ON CONFLICT (unique_url) DO NOTHING;

-- Verificar se a inserção funcionou
SELECT 
    id, 
    name, 
    company_name, 
    start_month, 
    created_at 
FROM calendars 
WHERE name = 'TESTE_SINCRONIZACAO';

-- Limpar teste (opcional)
-- DELETE FROM calendars WHERE name = 'TESTE_SINCRONIZACAO';
