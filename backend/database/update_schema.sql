-- ========================================
-- ATUALIZAÇÃO DO SCHEMA - ADICIONAR CAMPOS
-- CALENDARIO EDITORIAL
-- ========================================

-- Conectar ao banco
\c calendario_editorial;

-- ========================================
-- ADICIONAR CAMPOS À TABELA CALENDARS
-- ========================================

-- Adicionar campo company_name
ALTER TABLE calendars 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

-- Adicionar campo start_month
ALTER TABLE calendars 
ADD COLUMN IF NOT EXISTS start_month VARCHAR(7);

-- Adicionar campo is_public (se necessário)
ALTER TABLE calendars 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- ========================================
-- VERIFICAR ESTRUTURA ATUALIZADA
-- ========================================
\d calendars;

-- ========================================
-- ATUALIZAR REGISTROS EXISTENTES (OPCIONAL)
-- ========================================

-- Se houver registros existentes, definir valores padrão
UPDATE calendars 
SET company_name = name 
WHERE company_name IS NULL;

UPDATE calendars 
SET start_month = '2025-01' 
WHERE start_month IS NULL;

UPDATE calendars 
SET is_public = false 
WHERE is_public IS NULL;

-- ========================================
-- VERIFICAR RESULTADO
-- ========================================
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'calendars' 
ORDER BY ordinal_position;
