-- Script para criar a tabela 'shares' no Supabase
-- Esta tabela é necessária para funcionalidades de compartilhamento

-- Verificar se a tabela já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shares') THEN
        -- Criar tabela shares
        CREATE TABLE public.shares (
            id SERIAL PRIMARY KEY,
            item_type VARCHAR(50) NOT NULL, -- 'calendar', 'task', 'note'
            item_id INTEGER NOT NULL,
            shared_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            shared_with INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            permissions VARCHAR(20) DEFAULT 'read', -- 'read', 'write', 'admin'
            status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices para melhor performance
        CREATE INDEX idx_shares_item_type_item_id ON shares(item_type, item_id);
        CREATE INDEX idx_shares_shared_by ON shares(shared_by);
        CREATE INDEX idx_shares_shared_with ON shares(shared_with);
        CREATE INDEX idx_shares_status ON shares(status);
        
        -- Adicionar comentários
        COMMENT ON TABLE shares IS 'Tabela para gerenciar compartilhamentos de itens entre usuários';
        COMMENT ON COLUMN shares.item_type IS 'Tipo do item compartilhado (calendar, task, note)';
        COMMENT ON COLUMN shares.item_id IS 'ID do item compartilhado';
        COMMENT ON COLUMN shares.shared_by IS 'ID do usuário que compartilhou';
        COMMENT ON COLUMN shares.shared_with IS 'ID do usuário com quem foi compartilhado';
        COMMENT ON COLUMN shares.permissions IS 'Permissões concedidas (read, write, admin)';
        COMMENT ON COLUMN shares.status IS 'Status do compartilhamento (pending, accepted, declined)';
        
        RAISE NOTICE 'Tabela shares criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela shares já existe!';
    END IF;
END $$;

-- Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'shares'
ORDER BY ordinal_position;

-- Verificar se os índices foram criados
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'shares';
