-- ========================================
-- ATUALIZAÇÃO DO SUPABASE - ADICIONAR CAMPOS
-- CALENDARIO EDITORIAL
-- ========================================

-- Adicionar campo company_name
ALTER TABLE calendars 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

-- Adicionar campo start_month
ALTER TABLE calendars 
ADD COLUMN IF NOT EXISTS start_month VARCHAR(7);

-- ========================================
-- VERIFICAR ESTRUTURA ATUALIZADA
-- ========================================
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'calendars' 
ORDER BY ordinal_position;
