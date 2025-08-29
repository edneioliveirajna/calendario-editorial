-- ========================================
-- ATUALIZAÇÃO SUPABASE - APENAS CAMPOS FALTANTES
-- CALENDARIO EDITORIAL
-- ========================================
-- ⚠️  ATENÇÃO: Este script SÓ ADICIONA campos, NÃO remove nada!

-- ========================================
-- VERIFICAR ESTRUTURA ATUAL (ANTES)
-- ========================================

-- Listar colunas atuais da tabela calendars
SELECT 'ESTRUTURA ATUAL:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'calendars' 
ORDER BY ordinal_position;

-- ========================================
-- ADICIONAR APENAS CAMPOS FALTANTES
-- ========================================

-- Adicionar company_name (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendars' AND column_name = 'company_name'
    ) THEN
        ALTER TABLE calendars ADD COLUMN company_name VARCHAR(255);
        RAISE NOTICE '✅ Campo company_name ADICIONADO';
    ELSE
        RAISE NOTICE 'ℹ️ Campo company_name JÁ EXISTE';
    END IF;
END $$;

-- Adicionar start_month (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendars' AND column_name = 'start_month'
    ) THEN
        ALTER TABLE calendars ADD COLUMN start_month VARCHAR(7);
        RAISE NOTICE '✅ Campo start_month ADICIONADO';
    ELSE
        RAISE NOTICE 'ℹ️ Campo start_month JÁ EXISTE';
    END IF;
END $$;

-- ========================================
-- VERIFICAR ESTRUTURA FINAL (DEPOIS)
-- ========================================

-- Aguardar um pouco para garantir que as alterações foram aplicadas
SELECT pg_sleep(1);

-- Listar colunas finais da tabela calendars
SELECT 'ESTRUTURA FINAL:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'calendars' 
ORDER BY ordinal_position;

-- ========================================
-- RESUMO DAS ALTERAÇÕES
-- ========================================

SELECT 'RESUMO DAS ALTERAÇÕES:' as info;

-- Verificar status final de cada campo
SELECT 
    'company_name' as campo,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'calendars' AND column_name = 'company_name'
        ) THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status
UNION ALL
SELECT 
    'start_month' as campo,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'calendars' AND column_name = 'start_month'
        ) THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status;

-- ========================================
-- TESTE SIMPLES (OPCIONAL)
-- ========================================

-- Verificar se conseguimos fazer um SELECT com os novos campos
SELECT 'TESTE DE SELECT:' as info;
SELECT 
    COUNT(*) as total_calendarios,
    COUNT(company_name) as com_company_name,
    COUNT(start_month) as com_start_month
FROM calendars;
