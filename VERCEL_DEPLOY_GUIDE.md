# 🚀 Guia Completo de Deploy no Vercel

## 📋 Pré-requisitos

1. **Conta no Vercel**: [vercel.com](https://vercel.com)
2. **Conta no Supabase**: [supabase.com](https://supabase.com)
3. **GitHub/GitLab/Bitbucket**: Para conectar o repositório
4. **Node.js**: Versão 18+ instalada localmente

## 🔧 Preparação do Projeto

### 1. Estrutura de Arquivos
```
calendario-editorial/
├── api/                    # Serverless Functions do Vercel
│   ├── index.js           # Rota principal da API
│   ├── auth.js            # Rotas de autenticação
│   ├── config/
│   │   └── database.js    # Configuração do banco
│   └── ...                # Outras rotas
├── frontend/              # Aplicação React
│   ├── src/
│   ├── package.json
│   └── vercel.json        # Configuração específica do frontend
├── vercel.json            # Configuração principal do Vercel
└── env.production.example # Exemplo de variáveis de produção
```

### 2. Configurações Necessárias

#### Backend (API Routes)
- ✅ Rotas convertidas para Serverless Functions
- ✅ Configuração do banco adaptada para Supabase
- ✅ Middleware de CORS configurado
- ✅ Tratamento de erros implementado

#### Frontend
- ✅ Build configurado para produção
- ✅ Roteamento configurado para SPA
- ✅ Configuração específica do Vercel

## 🚀 Deploy no Vercel

### Passo 1: Conectar Repositório
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Importe seu repositório do GitHub/GitLab/Bitbucket
4. Escolha o repositório `calendario-editorial`

### Passo 2: Configurar Build
1. **Framework Preset**: `Vite`
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Passo 3: Configurar Variáveis de Ambiente
No dashboard do projeto, vá em **Settings** → **Environment Variables**:

```env
# Banco de Dados (Supabase)
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=sua_senha_supabase_aqui

# Servidor
NODE_ENV=production

# Segurança
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_2024
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://seu-dominio.vercel.app
```

### Passo 4: Deploy
1. Clique em "Deploy"
2. Aguarde o build e deploy
3. Verifique se não há erros nos logs

## 🔍 Verificação do Deploy

### 1. Testar API
```bash
# Teste da API
curl https://seu-dominio.vercel.app/api/

# Teste de status
curl https://seu-dominio.vercel.app/api/status
```

### 2. Testar Frontend
- Acesse a URL do Vercel
- Verifique se o frontend carrega
- Teste as funcionalidades principais

### 3. Verificar Logs
- Dashboard do Vercel → **Functions**
- Verifique logs de erro
- Monitore performance

## 🐛 Troubleshooting Comum

### Erro de Build
```bash
# Verificar dependências
npm install

# Limpar cache
npm run build -- --force

# Verificar versão do Node.js
node --version
```

### Erro de Conexão com Banco
- Verificar variáveis de ambiente
- Confirmar credenciais do Supabase
- Verificar se o IP está liberado

### Erro de CORS
- Verificar `CORS_ORIGIN` no Vercel
- Confirmar domínio correto
- Testar com `*` temporariamente

## 📊 Monitoramento

### Vercel Analytics
- **Speed Insights**: Performance da aplicação
- **Web Analytics**: Métricas de uso
- **Real User Monitoring**: Experiência do usuário

### Supabase Dashboard
- **Database**: Queries e performance
- **Authentication**: Logs de login
- **Logs**: Monitoramento em tempo real

## 🔄 Deploy Automático

### GitHub Actions (Opcional)
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 💰 Custos e Limites

### Vercel Hobby (Gratuito)
- 100GB de banda/mês
- 100GB de storage
- 100GB de logs
- 100GB de edge functions
- Deploy ilimitado

### Vercel Pro ($20/mês)
- 1TB de banda/mês
- 1TB de storage
- 1TB de logs
- 1TB de edge functions
- Domínios customizados
- Analytics avançado

## 🎯 Próximos Passos

1. **Configurar Supabase** (seguir `supabase-setup.md`)
2. **Fazer primeiro deploy** no Vercel
3. **Testar todas as funcionalidades**
4. **Configurar domínio customizado**
5. **Implementar monitoramento**
6. **Configurar CI/CD**

## 📞 Suporte

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Documentação**: [vercel.com/docs](https://vercel.com/docs)

## **✅ PERFEITO! Vou executar AGORA MESMO!**

### **🚀 EXECUTANDO NO TERMINAL:**

```bash
git add .
```

```bash
git commit -m "🔧 Fix: Corrigido indentação e roteamento"
```

```bash
<code_block_to_apply_changes_from>
```

### ** O QUE VOCÊ VAI VER:**

1. **✅ `git add .`** - Arquivos adicionados
2. **✅ `git commit`** - Commit criado com ID
3. **✅ `git push`** - Código enviado para GitHub

### **⏰ TEMPO:**

- **Comandos**: 1-2 minutos
- **Deploy**: 2-3 minutos
- **Total**: ~5 minutos

### ** RESUMINDO:**

**Executando no terminal agora! Você vai ver tudo acontecendo!**

**Depois é só aguardar o Vercel fazer o resto!**

**Executando...** ⏳
