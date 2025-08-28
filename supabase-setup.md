# 🚀 Configuração do Supabase para o Calendário Editorial

## 📋 Passos para Configurar o Supabase

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login/cadastro
3. Clique em "New Project"
4. Escolha sua organização
5. Digite o nome: `calendario-editorial`
6. Escolha uma senha forte para o banco
7. Escolha a região mais próxima (São Paulo)
8. Clique em "Create new project"

### 2. Obter Credenciais de Conexão
Após a criação do projeto, vá em:
- **Settings** → **Database**
- Copie as seguintes informações:
  - Host: `db.xxxxxxxxxxxxx.supabase.co`
  - Database name: `postgres`
  - Port: `5432`
  - User: `postgres`
  - Password: (a senha que você definiu)

### 3. Configurar Variáveis de Ambiente no Vercel
No dashboard do Vercel, vá em:
- **Settings** → **Environment Variables**
- Adicione as seguintes variáveis:

```env
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=sua_senha_supabase_aqui
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_2024
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://seu-dominio.vercel.app
```

### 4. Migrar o Schema do Banco
1. No Supabase, vá em **SQL Editor**
2. Cole o conteúdo do arquivo `calendario editorial sql postgres.sql`
3. Execute o script para criar as tabelas

### 5. Configurar RLS (Row Level Security)
No Supabase, configure as políticas de segurança para cada tabela.

## 🔒 Configurações de Segurança

### JWT Secret
- Gere uma chave JWT forte: `openssl rand -base64 32`
- Use no Vercel como `JWT_SECRET`

### CORS
- Configure `CORS_ORIGIN` com o domínio do Vercel
- Exemplo: `https://calendario-editorial.vercel.app`

## 📊 Monitoramento
- Use o dashboard do Supabase para monitorar queries
- Configure alertas para uso de recursos
- Monitore logs de autenticação

## 💰 Custos
- Plano gratuito: 500MB de banco, 2GB de transferência
- Plano Pro: $25/mês para mais recursos
- Escale conforme necessário
