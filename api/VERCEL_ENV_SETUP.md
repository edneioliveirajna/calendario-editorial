# 🚀 Configuração das Variáveis de Ambiente no Vercel

## 📋 **Variáveis Obrigatórias para o Backend**

### **1. Configurações do Supabase Client (RECOMENDADO)**
```
SUPABASE_URL=https://snxccjgkqqniowserwtv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNueGNjamdrcXFuaW93c2Vyd3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNDU3NTUsImV4cCI6MjA3MTkyMTc1NX0.GVVqWPVt_GuWrXhdkztjHv5uWYUDVPuQlZSBhRyOa28
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNueGNjamdrcXFuaW93c2Vyd3R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM0NTc1NSwiZXhwIjoyMDcxOTIxNzU1fQ.LnxWPTbiD0JQiNh5i5qMyq2AHGkSkQV0yZYaPnz31rE
```

### **2. Configurações JWT**
```
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h
```

### **3. Configurações CORS**
```
CORS_ORIGIN=https://seu-frontend.vercel.app
```

### **4. Configurações do Banco (PostgreSQL direto - OPCIONAL)**
```
DB_HOST=db.snxccjgkqqniowserwtv.supabase.co
DB_NAME=postgres
DB_USER=postgres
DB_PASS=Calendario2024!@#
DB_PORT=5432
```

## 🔧 **Como Configurar no Vercel:**

### **1. Acesse o Dashboard do Vercel**
- Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
- Selecione seu projeto backend

### **2. Configure as Variáveis**
- Clique em **Settings** → **Environment Variables**
- Adicione cada variável acima
- **IMPORTANTE:** Selecione todos os ambientes (Production, Preview, Development)

### **3. Faça Deploy**
- Após configurar, faça um novo deploy
- As variáveis estarão disponíveis na API

## 🧪 **Teste a Configuração:**

### **1. Endpoint de Status:**
```
GET https://api-back-xi.vercel.app/status
```

### **2. Teste Supabase Client:**
```
GET https://api-back-xi.vercel.app/test-supabase-client
```

### **3. Teste de Conectividade:**
```
GET https://api-back-xi.vercel.app/test-connectivity
```

## ✅ **Resultado Esperado:**
- **Supabase Client:** ✅ Conectado
- **Banco de Dados:** ✅ Acessível
- **API:** ✅ Funcionando

## 🚨 **Problemas Comuns:**
- **Variáveis não configuradas:** Verifique se todas foram adicionadas
- **Deploy antigo:** Faça um novo deploy após configurar
- **Ambientes:** Certifique-se de selecionar todos os ambientes
