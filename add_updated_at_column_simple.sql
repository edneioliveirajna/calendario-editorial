-- ========================================
-- ADICIONAR COLUNA updated_at NA TABELA calendar_shares (VERSÃO SIMPLES)
-- ========================================

-- 1. Adicionar coluna updated_at
ALTER TABLE calendar_shares 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Atualizar registros existentes
UPDATE calendar_shares 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- 3. Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'calendar_shares' 
AND column_name = 'updated_at';
