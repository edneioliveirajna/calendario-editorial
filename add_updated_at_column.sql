-- ========================================
-- ADICIONAR COLUNA updated_at NA TABELA calendar_shares
-- ========================================

-- Verificar se a coluna já existe antes de criar
DO $$ 
BEGIN
    -- Adicionar coluna updated_at se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'calendar_shares' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE calendar_shares 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Atualizar registros existentes com a data atual
        UPDATE calendar_shares 
        SET updated_at = NOW() 
        WHERE updated_at IS NULL;
        
        -- Criar trigger para atualizar automaticamente
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;

        -- Aplicar trigger na tabela
        DROP TRIGGER IF EXISTS update_calendar_shares_updated_at ON calendar_shares;
        CREATE TRIGGER update_calendar_shares_updated_at
            BEFORE UPDATE ON calendar_shares
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
            
        RAISE NOTICE 'Coluna updated_at adicionada com sucesso na tabela calendar_shares!';
    ELSE
        RAISE NOTICE 'Coluna updated_at já existe na tabela calendar_shares.';
    END IF;
END $$;

-- Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'calendar_shares' 
ORDER BY ordinal_position;
