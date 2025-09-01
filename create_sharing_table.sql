-- Script para criar a tabela 'sharing' no Supabase
-- Esta tabela é necessária para funcionalidades de compartilhamento

-- Verificar se a tabela já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sharing') THEN
        -- Criar tabela sharing
        CREATE TABLE public.sharing (
            id SERIAL PRIMARY KEY,
            item_type VARCHAR(50) NOT NULL, -- 'calendar', 'task', 'note'
            item_id INTEGER NOT NULL,
            shared_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            shared_with_email VARCHAR(255) NOT NULL,
            permissions TEXT[] DEFAULT ARRAY['read'], -- ['read', 'write', 'delete', 'share']
            status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            accepted_at TIMESTAMP WITH TIME ZONE,
            declined_at TIMESTAMP WITH TIME ZONE
        );

        -- Criar índices para melhor performance
        CREATE INDEX idx_sharing_item_type_item_id ON sharing(item_type, item_id);
        CREATE INDEX idx_sharing_shared_by_user_id ON sharing(shared_by_user_id);
        CREATE INDEX idx_sharing_shared_with_email ON sharing(shared_with_email);
        CREATE INDEX idx_sharing_status ON sharing(status);

        -- Adicionar comentários
        COMMENT ON TABLE sharing IS 'Tabela para gerenciar compartilhamentos de itens entre usuários';
        COMMENT ON COLUMN sharing.item_type IS 'Tipo do item compartilhado (calendar, task, note)';
        COMMENT ON COLUMN sharing.item_id IS 'ID do item compartilhado';
        COMMENT ON COLUMN sharing.shared_by_user_id IS 'ID do usuário que compartilhou';
        COMMENT ON COLUMN sharing.shared_with_email IS 'Email do usuário com quem foi compartilhado';
        COMMENT ON COLUMN sharing.permissions IS 'Array de permissões concedidas (read, write, delete, share)';
        COMMENT ON COLUMN sharing.status IS 'Status do compartilhamento (pending, accepted, declined)';

        RAISE NOTICE 'Tabela sharing criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela sharing já existe!';
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
AND table_name = 'sharing'
ORDER BY ordinal_position;

-- Verificar se os índices foram criados
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'sharing';
