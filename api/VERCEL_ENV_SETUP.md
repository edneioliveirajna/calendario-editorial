# 🚀 Configuração das Variáveis de Ambiente no Vercel

## 📋 Variáveis Necessárias

Configure estas variáveis no seu projeto Vercel `api-back-rosy`:

### 🔐 Banco de Dados (Supabase)
```
DB_HOST=db.snxccjgkqqniowserwtv.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=Calendario2024!@#
```

### 🔑 Autenticação
```
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h
```

### 🌐 Configurações
```
CORS_ORIGIN=https://seu-frontend.vercel.app
NODE_ENV=production
```

## ⚡ Como Configurar (Método Rápido)

### 1. Vá para o Dashboard do Vercel
- Acesse: https://vercel.com/dashboard
- Selecione o projeto: `api-back-rosy`

### 2. Configure as Variáveis
- Clique em **Settings**
- Vá para **Environment Variables**
- Clique em **Add New**

### 3. Adicione Cada Variável
Para cada variável acima:
- **Name**: `DB_HOST` (exemplo)
- **Value**: `db.snxccjgkqqniowserwtv.supabase.co` (exemplo)
- **Environment**: ✅ Production
- Clique em **Save**

### 4. Faça um Novo Deploy
- Vá para **Deployments**
- Clique em **Redeploy** no último deploy

## 🧪 Teste Após Configuração

1. **Teste básico**: `https://api-back-rosy.vercel.app/`
2. **Teste banco**: `https://api-back-rosy.vercel.app/test-db`

## ❌ Problemas Comuns

- **Erro 500**: Variáveis não configuradas
- **Conexão recusada**: Credenciais do banco incorretas
- **CORS**: `CORS_ORIGIN` não configurado

## 🔗 Links Úteis

- [Dashboard Vercel](https://vercel.com/dashboard)
- [Documentação Vercel](https://vercel.com/docs)
- [Supabase Dashboard](https://supabase.com/dashboard)
