-- Script para adicionar colunas faltantes na tabela 'notes' no Supabase
-- Este script resolve o erro "Could not find the 'tags' column of 'notes' in the schema cache"

-- Verificar se a tabela notes existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notes') THEN
        RAISE EXCEPTION 'Tabela notes não existe! Crie a tabela primeiro.';
    END IF;
END $$;

-- 1. ADICIONAR COLUNA 'tags' (array de strings)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notes' AND column_name = 'tags') THEN
        ALTER TABLE public.notes ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Coluna tags adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna tags já existe!';
    END IF;
END $$;

-- 2. ADICIONAR COLUNA 'user_id' (referência para usuários)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notes' AND column_name = 'user_id') THEN
        ALTER TABLE public.notes ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Coluna user_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna user_id já existe!';
    END IF;
END $$;

-- 3. ADICIONAR COLUNA 'updated_at' (timestamp)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notes' AND column_name = 'updated_at') THEN
        ALTER TABLE public.notes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna updated_at adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna updated_at já existe!';
    END IF;
END $$;

-- 4. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
-- Índice para user_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'notes' AND indexname = 'idx_notes_user_id') THEN
        CREATE INDEX idx_notes_user_id ON notes(user_id);
        RAISE NOTICE 'Índice idx_notes_user_id criado com sucesso!';
    ELSE
        RAISE NOTICE 'Índice idx_notes_user_id já existe!';
    END IF;
END $$;

-- Índice para tags (GIN para arrays)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'notes' AND indexname = 'idx_notes_tags') THEN
        CREATE INDEX idx_notes_tags ON notes USING GIN (tags);
        RAISE NOTICE 'Índice idx_notes_tags criado com sucesso!';
    ELSE
        RAISE NOTICE 'Índice idx_notes_tags já existe!';
    END IF;
END $$;

-- Índice para calendar_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'notes' AND indexname = 'idx_notes_calendar_id') THEN
        CREATE INDEX idx_notes_calendar_id ON notes(calendar_id);
        RAISE NOTICE 'Índice idx_notes_calendar_id criado com sucesso!';
    ELSE
        RAISE NOTICE 'Índice idx_notes_calendar_id já existe!';
    END IF;
END $$;

-- Índice para task_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'notes' AND indexname = 'idx_notes_task_id') THEN
        CREATE INDEX idx_notes_task_id ON notes(task_id);
        RAISE NOTICE 'Índice idx_notes_task_id criado com sucesso!';
    ELSE
        RAISE NOTICE 'Índice idx_notes_task_id já existe!';
    END IF;
END $$;

-- 5. ADICIONAR COMENTÁRIOS ÀS COLUNAS
COMMENT ON COLUMN notes.tags IS 'Array de tags para categorização das notas';
COMMENT ON COLUMN notes.user_id IS 'ID do usuário que criou a nota';
COMMENT ON COLUMN notes.updated_at IS 'Data/hora da última atualização da nota';

-- 6. VERIFICAR A ESTRUTURA FINAL DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN character_maximum_length IS NOT NULL 
        THEN data_type || '(' || character_maximum_length || ')'
        ELSE data_type
    END as full_data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notes'
ORDER BY ordinal_position;

-- 7. VERIFICAR OS ÍNDICES CRIADOS
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'notes'
ORDER BY indexname;

-- 8. VERIFICAR AS CONSTRAINTS DE CHAVE ESTRANGEIRA
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'notes';
