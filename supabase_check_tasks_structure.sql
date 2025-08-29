-- ========================================
-- VERIFICAR ESTRUTURA DA TABELA TASKS NO SUPABASE
-- ========================================

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tasks'
) as table_exists;

-- 2. Verificar estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tasks'
ORDER BY ordinal_position;

-- 3. Verificar se tem os campos necessários
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'id'
    ) THEN '✅ id' ELSE '❌ id' END as id_field,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'calendar_id'
    ) THEN '✅ calendar_id' ELSE '❌ calendar_id' END as calendar_id_field,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'title'
    ) THEN '✅ title' ELSE '❌ title' END as title_field,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'description'
    ) THEN '✅ description' ELSE '❌ description' END as description_field,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'content_type'
    ) THEN '✅ content_type' ELSE '❌ content_type' END as content_type_field,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'platforms'
    ) THEN '✅ platforms' ELSE '❌ platforms' END as platforms_field,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'status'
    ) THEN '✅ status' ELSE '❌ status' END as status_field,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'scheduled_date'
    ) THEN '✅ scheduled_date' ELSE '❌ scheduled_date' END as scheduled_date_field,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'created_at'
    ) THEN '✅ created_at' ELSE '❌ created_at' END as created_at_field,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'updated_at'
    ) THEN '✅ updated_at' ELSE '❌ updated_at' END as updated_at_field;

-- 4. Verificar campos que NÃO deveriam existir
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'user_id'
    ) THEN '❌ user_id (NÃO DEVERIA EXISTIR)' ELSE '✅ user_id (correto)' END as user_id_check,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'due_date'
    ) THEN '❌ due_date (NÃO DEVERIA EXISTIR)' ELSE '✅ due_date (correto)' END as due_date_check,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'priority'
    ) THEN '❌ priority (NÃO DEVERIA EXISTIR)' ELSE '✅ priority (correto)' END as priority_check;

-- 5. Verificar constraints e foreign keys
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')
    AND tc.table_name = 'tasks';
