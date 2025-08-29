-- ========================================
-- VERIFICAÇÃO DA TABELA TASKS NO SUPABASE
-- CALENDARIO EDITORIAL
-- ========================================
-- ⚠️  ATENÇÃO: Este script VERIFICA a estrutura da tabela tasks

-- ========================================
-- VERIFICAR SE A TABELA TASKS EXISTE
-- ========================================

-- Verificar se a tabela tasks existe
SELECT 'VERIFICAÇÃO DA TABELA TASKS:' as info;

SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status
FROM information_schema.tables 
WHERE table_name = 'tasks';

-- ========================================
-- VERIFICAR ESTRUTURA DA TABELA TASKS (SE EXISTIR)
-- ========================================

-- Se a tabela existir, mostrar sua estrutura
SELECT 'ESTRUTURA DA TABELA TASKS:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- ========================================
-- VERIFICAR TABELAS RELACIONADAS
-- ========================================

-- Verificar se existem outras tabelas relacionadas
SELECT 'TABELAS RELACIONADAS:' as info;
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('calendars', 'users', 'notes') THEN '✅ TABELA PRINCIPAL'
        WHEN table_name LIKE '%task%' THEN '🔍 POSSÍVEL TABELA DE TAREFAS'
        ELSE 'ℹ️ OUTRA TABELA'
    END as tipo
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ========================================
-- VERIFICAR SE EXISTEM CONSTRAINTS/FOREIGN KEYS
-- ========================================

-- Verificar constraints da tabela tasks (se existir)
SELECT 'CONSTRAINTS DA TABELA TASKS:' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'tasks';

-- ========================================
-- TESTE DE INSERÇÃO SIMPLES (SE A TABELA EXISTIR)
-- ========================================

-- Tentar fazer um SELECT simples na tabela tasks
SELECT 'TESTE DE SELECT NA TABELA TASKS:' as info;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tasks'
    ) THEN
        -- A tabela existe, fazer teste de SELECT
        PERFORM COUNT(*) FROM tasks;
        RAISE NOTICE '✅ SELECT na tabela tasks funcionou!';
    ELSE
        RAISE NOTICE '❌ Tabela tasks não existe!';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao fazer SELECT na tabela tasks: %', SQLERRM;
END $$;

-- ========================================
-- RESUMO FINAL
-- ========================================

SELECT 'RESUMO FINAL:' as info;

-- Contar total de tabelas
SELECT 
    COUNT(*) as total_tabelas,
    COUNT(CASE WHEN table_name = 'tasks' THEN 1 END) as tasks_existe,
    COUNT(CASE WHEN table_name = 'calendars' THEN 1 END) as calendars_existe,
    COUNT(CASE WHEN table_name = 'users' THEN 1 END) as users_existe
FROM information_schema.tables 
WHERE table_schema = 'public';
