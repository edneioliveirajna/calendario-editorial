# 🚀 GUIA DE DEPLOY - AMBIENTES SEPARADOS

## 🎯 **PROBLEMA RESOLVIDO**

Agora você pode trabalhar em **ambiente local** sem afetar a **produção** e vice-versa!

## 📁 **ESTRUTURA CRIADA**

```
CALENDARIO/
├── backend/
│   ├── .env                    # Ambiente atual (não mexer)
│   ├── .env.development        # ✅ Configurações LOCAL
│   ├── .env.production         # ✅ Configurações PRODUÇÃO
│   └── config/environment.js   # ✅ Sistema inteligente de config
├── frontend/
│   ├── .env.development        # ✅ Frontend LOCAL
│   └── .env.production         # ✅ Frontend PRODUÇÃO
├── start-dev-local.bat         # ✅ Inicia ambiente LOCAL
├── start-prod.bat              # ✅ Inicia ambiente PRODUÇÃO
└── deploy.js                   # ✅ Deploy automático
```

## 🔧 **COMO USAR**

### **1. 🏠 AMBIENTE LOCAL (Desenvolvimento)**
```bash
# Duplo clique no arquivo:
start-dev-local.bat

# Ou manualmente:
cd backend && npm run start:dev
cd frontend && npm run dev
```

**URLs LOCAL:**
- Frontend: http://localhost:8080
- Backend: http://localhost:3001

### **2. 🌐 AMBIENTE PRODUÇÃO (Teste local da produção)**
```bash
# Duplo clique no arquivo:
start-prod.bat

# Ou manualmente:
cd backend && npm run start:prod
cd frontend && npm run dev:prod
```

### **3. 🚀 DEPLOY AUTOMÁTICO**
```bash
# Cria versão completa para produção:
node deploy.js

# Depois de executar, terá uma pasta 'deploy/' com tudo pronto!
```

## ⚙️ **CONFIGURAÇÕES**

### **🏠 LOCAL (.env.development)**
```env
# Backend
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendario_editorial
CORS_ORIGIN=http://localhost:8080

# Frontend  
VITE_API_URL=http://localhost:3001
VITE_APP_ENV=development
```

### **🌐 PRODUÇÃO (.env.production)**
```env
# Backend
DB_HOST=seu-servidor-postgres.com
DB_NAME=calendario_editorial_prod
CORS_ORIGIN=https://seu-dominio-producao.com

# Frontend
VITE_API_URL=https://api.seu-dominio-producao.com
VITE_APP_ENV=production
```

## 🎯 **VANTAGENS**

✅ **Ambiente local sempre funciona** - Nunca mais quebra!
✅ **Produção separada** - Configurações independentes
✅ **Deploy automático** - Um comando e está pronto
✅ **Sem conflitos** - Cada ambiente tem suas configs
✅ **Fácil manutenção** - Scripts prontos para usar

## 🔄 **FLUXO DE TRABALHO**

1. **Desenvolva local**: Use `start-dev-local.bat`
2. **Teste produção**: Use `start-prod.bat` 
3. **Deploy real**: Execute `node deploy.js`
4. **Suba para servidor**: Copie a pasta `deploy/`

## 🛠️ **PERSONALIZAÇÃO**

### **Para mudar configurações de PRODUÇÃO:**
1. Edite `backend/.env.production`
2. Edite `frontend/.env.production`
3. Execute `node deploy.js`

### **Para mudar configurações LOCAL:**
1. Edite `backend/.env.development`
2. Edite `frontend/.env.development`
3. Reinicie com `start-dev-local.bat`

## 🚨 **IMPORTANTE**

- ❌ **NÃO MEXA** no arquivo `.env` original
- ✅ **USE SEMPRE** os arquivos `.env.development` e `.env.production`
- ✅ **TESTE SEMPRE** com `start-prod.bat` antes do deploy real
- ✅ **MANTENHA** as credenciais de produção seguras

## 🎉 **RESULTADO**

Agora você tem:
- 🏠 **Ambiente local** que nunca quebra
- 🌐 **Ambiente de produção** separado
- 🚀 **Deploy automático** sem dor de cabeça
- ⚙️ **Configurações independentes** para cada ambiente

**Problema resolvido! 🎯**
