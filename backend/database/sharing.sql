-- ========================================
-- SISTEMA DE COMPARTILHAMENTO DE CALENDÁRIOS
-- ========================================

-- Tabela para gerenciar compartilhamentos de calendários
CREATE TABLE IF NOT EXISTS calendar_shares (
    id SERIAL PRIMARY KEY,
    calendar_id INTEGER NOT NULL,
    owner_id INTEGER NOT NULL, -- Usuário que criou o calendário
    shared_with_id INTEGER NOT NULL, -- Usuário com quem foi compartilhado
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    can_edit BOOLEAN DEFAULT TRUE, -- Permissão para editar
    can_delete BOOLEAN DEFAULT TRUE, -- Permissão para deletar
    can_share BOOLEAN DEFAULT FALSE, -- Permissão para compartilhar com outros
    
    -- Constraints
    FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Um usuário só pode ter um compartilhamento por calendário
    UNIQUE(calendar_id, shared_with_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_calendar_shares_calendar_id ON calendar_shares(calendar_id);
CREATE INDEX IF NOT EXISTS idx_calendar_shares_owner_id ON calendar_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_calendar_shares_shared_with_id ON calendar_shares(shared_with_id);

-- Comentários
COMMENT ON TABLE calendar_shares IS 'Tabela para gerenciar compartilhamentos de calendários entre usuários';
COMMENT ON COLUMN calendar_shares.owner_id IS 'ID do usuário que criou o calendário (proprietário)';
COMMENT ON COLUMN calendar_shares.shared_with_id IS 'ID do usuário com quem o calendário foi compartilhado';
COMMENT ON COLUMN calendar_shares.can_edit IS 'Se o usuário compartilhado pode editar o calendário';
COMMENT ON COLUMN calendar_shares.can_delete IS 'Se o usuário compartilhado pode deletar o calendário';
COMMENT ON COLUMN calendar_shares.can_share IS 'Se o usuário compartilhado pode compartilhar com outros usuários';
