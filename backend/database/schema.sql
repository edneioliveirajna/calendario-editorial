-- ========================================
-- SCHEMA DO BANCO POSTGRESQL
-- CALENDARIO EDITORIAL
-- ========================================

-- Criar banco de dados (execute separadamente se necessário)
-- CREATE DATABASE calendario_editorial;

-- Conectar ao banco
\c calendario_editorial;

-- ========================================
-- TABELA: USERS
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA: USER_TOKENS
-- ========================================
CREATE TABLE IF NOT EXISTS user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA: CALENDARS
-- ========================================
CREATE TABLE IF NOT EXISTS calendars (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    unique_url VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA: TASKS
-- ========================================
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    calendar_id INTEGER NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) DEFAULT 'post',
    platforms JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'pending',
    scheduled_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA: NOTES
-- ========================================
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_token ON user_tokens(token);
CREATE INDEX IF NOT EXISTS idx_calendars_user_id ON calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_calendar_id ON tasks(calendar_id);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- ========================================
-- TRIGGER PARA ATUALIZAR UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendars_updated_at BEFORE UPDATE ON calendars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INSERIR USUÁRIO ADMIN PARA TESTE
-- ========================================
INSERT INTO users (name, email, password_hash) VALUES 
('Admin', 'admin@planitglow.com', '$2b$10$rQJ8N5vK8N5vK8N5vK8N5uK8N5vK8N5vK8N5vK8N5vK8N5vK8N5vK8N5')
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- VERIFICAR TABELAS CRIADAS
-- ========================================
\dt

-- ========================================
-- VERIFICAR ESTRUTURA DAS TABELAS
-- ========================================
\d users
\d calendars
\d tasks
\d notes
