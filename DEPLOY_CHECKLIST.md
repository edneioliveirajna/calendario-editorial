# ✅ Checklist de Deploy - Calendário Editorial

## 🎯 **OBJETIVO**
Deploy do sistema Calendário Editorial no Vercel com banco Supabase

## 📋 **CHECKLIST PRÉ-DEPLOY**

### 1. **Configuração do Supabase** ✅
- [ ] Criar projeto no [supabase.com](https://supabase.com)
- [ ] Obter credenciais de conexão (DB_HOST, DB_USER, DB_PASS)
- [ ] Executar script SQL para criar tabelas
- [ ] Configurar políticas de segurança (RLS)

### 2. **Preparação do Código** ✅
- [ ] Estrutura de API routes criada (`/api/`)
- [ ] Configuração do banco adaptada para Supabase
- [ ] Variáveis de ambiente configuradas
- [ ] Arquivos de configuração do Vercel criados

### 3. **Configuração do Vercel** ⏳
- [ ] Criar conta no [vercel.com](https://vercel.com)
- [ ] Conectar repositório GitHub/GitLab/Bitbucket
- [ ] Configurar variáveis de ambiente
- [ ] Configurar build settings

## 🚀 **PASSOS PARA DEPLOY**

### **PASSO 1: Supabase**
```bash
# 1. Acessar supabase.com
# 2. Criar projeto: calendario-editorial
# 3. Copiar credenciais do banco
# 4. Executar script SQL
```

### **PASSO 2: Vercel Dashboard**
```bash
# 1. Acessar vercel.com/dashboard
# 2. New Project → Import Git Repository
# 3. Escolher repositório: calendario-editorial
# 4. Configurar build settings
```

### **PASSO 3: Variáveis de Ambiente**
```env
# No Vercel Dashboard → Settings → Environment Variables
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

### **PASSO 4: Configuração de Build**
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### **PASSO 5: Deploy**
```bash
# 1. Clicar em "Deploy"
# 2. Aguardar build e deploy
# 3. Verificar logs de erro
# 4. Testar funcionalidades
```

## 🔍 **VERIFICAÇÃO PÓS-DEPLOY**

### **Teste da API**
```bash
# Teste básico
curl https://seu-dominio.vercel.app/api/

# Teste de status
curl https://seu-dominio.vercel.app/api/status

# Teste de autenticação
curl -X POST https://seu-dominio.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### **Teste do Frontend**
- [ ] Página carrega sem erros
- [ ] Login/registro funcionam
- [ ] Calendário carrega
- [ ] Tarefas podem ser criadas/editadas
- [ ] Compartilhamento funciona

### **Verificação de Logs**
- [ ] Dashboard Vercel → Functions
- [ ] Verificar logs de erro
- [ ] Monitorar performance
- [ ] Verificar conexão com Supabase

## 🐛 **TROUBLESHOOTING COMUM**

### **Erro de Build**
```bash
# Solução: Verificar dependências
npm install
npm run build -- --force
```

### **Erro de Conexão com Banco**
```bash
# Solução: Verificar variáveis de ambiente
# Confirmar credenciais do Supabase
# Verificar se IP está liberado
```

### **Erro de CORS**
```bash
# Solução: Verificar CORS_ORIGIN
# Testar com * temporariamente
# Confirmar domínio correto
```

## 📊 **MONITORAMENTO**

### **Vercel Analytics**
- [ ] Speed Insights ativado
- [ ] Web Analytics configurado
- [ ] Real User Monitoring ativo

### **Supabase Dashboard**
- [ ] Database monitorado
- [ ] Authentication logs ativos
- [ ] Logs em tempo real

## 💰 **CUSTOS ESTIMADOS**

### **Vercel Hobby (Gratuito)**
- ✅ 100GB banda/mês
- ✅ 100GB storage
- ✅ Deploy ilimitado

### **Supabase Hobby (Gratuito)**
- ✅ 500MB banco
- ✅ 2GB transferência
- ✅ 50MB storage

## 🎯 **PRÓXIMOS PASSOS**

1. **Configurar Supabase** (seguir `supabase-setup.md`)
2. **Fazer primeiro deploy** no Vercel
3. **Testar todas as funcionalidades**
4. **Configurar domínio customizado**
5. **Implementar monitoramento**
6. **Configurar CI/CD automático**

## 📞 **SUPORTE**

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Documentação**: [vercel.com/docs](https://vercel.com/docs)

---

## 🏆 **STATUS ATUAL**
- ✅ **Código preparado**: 100%
- ⏳ **Supabase**: Pendente
- ⏳ **Vercel**: Pendente
- ⏳ **Deploy**: Pendente
- ⏳ **Testes**: Pendente

**Próxima ação**: Configurar Supabase e fazer deploy no Vercel
