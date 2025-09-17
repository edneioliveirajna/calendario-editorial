# 🚀 GUIA COMPLETO - DEPLOY NO EASYPANEL

## 🎯 **O QUE VAMOS FAZER:**
1. Configurar PostgreSQL no EasyPanel
2. Configurar Backend (Node.js/Express)
3. Configurar Frontend (React/Vite)
4. Conectar tudo e testar

---

## 📋 **PASSO 1: PREPARAR OS ARQUIVOS**

### **1.1 - Criar Dockerfile para Backend**
Crie este arquivo: `backend/Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install --production

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["node", "index.js"]
```

### **1.2 - Criar Dockerfile para Frontend**
Crie este arquivo: `frontend/Dockerfile`

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código fonte e buildar
COPY . .
RUN npm run build

# Usar nginx para servir arquivos estáticos
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **1.3 - Criar nginx.conf para Frontend**
Crie este arquivo: `frontend/nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Para React Router funcionar
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## 📋 **PASSO 2: CONFIGURAR NO EASYPANEL**

### **2.1 - Criar Projeto**
1. Acesse seu EasyPanel
2. Clique em **"New"** → **"Project"**
3. Nome: `calendario-editorial`
4. Clique **"Create"**

### **2.2 - Configurar PostgreSQL**
1. Dentro do projeto, clique **"+ Service"**
2. Selecione **"Postgres"**
3. Configurações:
   - **Name:** `postgres-db`
   - **Database:** `calendario_editorial`
   - **Username:** `postgres`
   - **Password:** `Calendario2024!@#`
4. Clique **"Create"**

### **2.3 - Configurar Backend**
1. Clique **"+ Service"** → **"App"**
2. **Name:** `backend`
3. **Source:**
   - Tipo: **GitHub Repository**
   - Repository: `seu-usuario/calendario-editorial`
   - Branch: `main`
   - Root Directory: `backend`
4. **Build:**
   - Method: **Dockerfile**
   - Dockerfile Path: `Dockerfile`
5. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   DB_HOST=postgres-db
   DB_PORT=5432
   DB_NAME=calendario_editorial
   DB_USER=postgres
   DB_PASS=sua_senha_segura_123
   JWT_SECRET=calendario_editorial_production_secret_super_secure_2024
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=https://seu-dominio.com
   ```
6. **Domains & Proxy:**
   - Domain: `api.seu-dominio.com`
   - Port: `3001`
7. Clique **"Deploy"**

### **2.4 - Configurar Frontend**
1. Clique **"+ Service"** → **"App"**
2. **Name:** `frontend`
3. **Source:**
   - Tipo: **GitHub Repository**
   - Repository: `seu-usuario/calendario-editorial`
   - Branch: `main`
   - Root Directory: `frontend`
4. **Build:**
   - Method: **Dockerfile**
   - Dockerfile Path: `Dockerfile`
5. **Environment Variables:**
   ```
   VITE_API_URL=https://api.seu-dominio.com
   VITE_APP_ENV=production
   VITE_APP_NAME=Calendário Editorial
   ```
6. **Domains & Proxy:**
   - Domain: `seu-dominio.com`
   - Port: `80`
7. Clique **"Deploy"**

---

## 📋 **PASSO 3: CONFIGURAR BANCO DE DADOS**

### **3.1 - Executar SQL de Criação**
1. No EasyPanel, vá para o serviço **postgres-db**
2. Clique em **"Console"**
3. Execute: `psql -U postgres -d calendario_editorial`
4. Cole e execute o conteúdo do arquivo `calendario editorial sql postgres.sql`

### **3.2 - Criar Usuário Admin**
Execute no console do PostgreSQL:
```sql
INSERT INTO users (email, password, company_name, created_at, updated_at) 
VALUES (
    'admin@planitglow.com', 
    '$2a$10$exemplo_hash_bcrypt', 
    'Admin', 
    NOW(), 
    NOW()
);
```

---

## 📋 **PASSO 4: CONFIGURAÇÕES FINAIS**

### **4.1 - Atualizar Arquivos de Produção**
Edite `backend/.env.production`:
```env
DB_HOST=postgres-db
DB_PORT=5432
DB_NAME=calendario_editorial
DB_USER=postgres
DB_PASS=sua_senha_segura_123
CORS_ORIGIN=https://seu-dominio.com
JWT_SECRET=calendario_editorial_production_secret_super_secure_2024
```

Edite `frontend/.env.production`:
```env
VITE_API_URL=https://api.seu-dominio.com
VITE_APP_ENV=production
```

### **4.2 - Fazer Push para GitHub**
```bash
git add .
git commit -m "Configuração para EasyPanel"
git push origin main
```

### **4.3 - Redesploy no EasyPanel**
1. Vá para cada serviço (backend e frontend)
2. Clique **"Deploy"** para atualizar

---

## 🎯 **RESULTADO FINAL:**

✅ **PostgreSQL:** Rodando no EasyPanel
✅ **Backend:** `https://api.seu-dominio.com`
✅ **Frontend:** `https://seu-dominio.com`
✅ **SSL:** Automático via Let's Encrypt
✅ **Domínios:** Configurados e funcionando

## 🔑 **CREDENCIAIS DE ACESSO:**
- **Email:** `admin@planitglow.com`
- **Senha:** `123456`

## 🚨 **TROUBLESHOOTING:**

### **Se o Backend não conectar ao banco:**
1. Verifique se `DB_HOST=postgres-db` (nome do serviço)
2. Confirme as credenciais do PostgreSQL
3. Verifique os logs do backend no EasyPanel

### **Se o Frontend não conectar ao Backend:**
1. Confirme `VITE_API_URL=https://api.seu-dominio.com`
2. Verifique se o CORS está configurado corretamente
3. Teste a API diretamente: `https://api.seu-dominio.com/api/status`

### **Se der erro de CORS:**
1. Confirme `CORS_ORIGIN=https://seu-dominio.com` no backend
2. Redesploy o backend após mudanças

---

## 📞 **PRÓXIMOS PASSOS:**

1. **Substitua** `seu-dominio.com` pelo seu domínio real
2. **Crie** os Dockerfiles nos diretórios corretos
3. **Faça push** para o GitHub
4. **Configure** no EasyPanel seguindo os passos
5. **Teste** tudo funcionando!

**Pronto para produção! 🚀**
