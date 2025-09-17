# 📋 EXEMPLO PRÁTICO DE CONFIGURAÇÃO

## 🎯 **CENÁRIO EXEMPLO:**
- Seu domínio: `meusite.com.br`
- Servidor: `servidor.hostinger.com`
- Banco: PostgreSQL na Hostinger

## ⚙️ **1. CONFIGURAR BACKEND (.env.production):**

```env
# ========================================
# CONFIGURAÇÕES DO BANCO POSTGRESQL - PRODUÇÃO
# ========================================
DB_HOST=servidor.hostinger.com              # ← IP do seu servidor
DB_PORT=5432
DB_NAME=calendario_editorial_prod           # ← Nome do banco
DB_USER=meuusuario                         # ← Seu usuário
DB_PASS=minhasenha123                      # ← Sua senha

# ========================================
# CONFIGURAÇÕES DO SERVIDOR - PRODUÇÃO
# ========================================
PORT=3001
NODE_ENV=production

# ========================================
# CONFIGURAÇÕES DE SEGURANÇA - PRODUÇÃO
# ========================================
JWT_SECRET=minha_chave_super_secreta_2024   # ← Mude para algo único
JWT_EXPIRES_IN=24h

# ========================================
# CONFIGURAÇÕES DE CORS - PRODUÇÃO
# ========================================
CORS_ORIGIN=https://meusite.com.br          # ← Seu domínio
```

## ⚙️ **2. CONFIGURAR FRONTEND (.env.production):**

```env
# ========================================
# CONFIGURAÇÕES DO FRONTEND - PRODUÇÃO
# ========================================
VITE_API_URL=https://api.meusite.com.br     # ← URL da sua API
VITE_APP_ENV=production
VITE_APP_NAME=Calendário Editorial
```

## 🚀 **3. COMANDOS PARA DEPLOY:**

```bash
# 1. Configure os arquivos acima
# 2. Execute o deploy:
node deploy.js

# 3. Resultado: pasta 'deploy/' criada
# 4. Suba a pasta 'deploy/' para seu servidor
# 5. No servidor execute:
cd deploy
node backend/index.js
```

## 📁 **4. ESTRUTURA NO SERVIDOR:**

```
seu-servidor/
└── deploy/                    # ← Pasta que você sobe
    ├── backend/
    │   ├── index.js
    │   ├── .env              # ← Configurações de produção
    │   └── ...
    ├── frontend/
    │   ├── dist/             # ← Arquivos buildados
    │   └── ...
    └── start-production.bat
```

## ✅ **RESUMO:**

1. **Edite:** `backend\.env.production` e `frontend\.env.production`
2. **Execute:** `node deploy.js`
3. **Suba:** pasta `deploy/` para seu servidor
4. **Rode:** `node backend/index.js` no servidor

**Pronto! Produção funcionando! 🎉**
