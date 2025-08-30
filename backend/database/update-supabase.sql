-- ========================================
-- ATUALIZAR TABELA CALENDARS NO SUPABASE
-- ========================================

-- Adicionar campos que faltam na tabela calendars
ALTER TABLE calendars 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS start_month VARCHAR(7),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Verificar se os campos foram adicionados
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'calendars' 
ORDER BY ordinal_position;

-- Atualizar registros existentes (se houver)
UPDATE calendars 
SET company_name = name 
WHERE company_name IS NULL;

UPDATE calendars 
SET start_month = TO_CHAR(created_at, 'YYYY-MM') 
WHERE start_month IS NULL;

-- Verificar estrutura final
\d calendars
