# 🚀 Configuração do Frontend no Vercel

## 📋 **Variáveis de Ambiente para o Frontend**

### **Configure estas variáveis no Vercel:**

```
VITE_API_URL=https://api-back-xi.vercel.app
VITE_FRONTEND_URL=https://seu-frontend.vercel.app
VITE_NODE_ENV=production
VITE_APP_NAME=Calendário Editorial
```

## 🔧 **Como Configurar:**

### **1. Acesse o Dashboard do Vercel**
- Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
- Crie um novo projeto para o frontend

### **2. Configure as Variáveis**
- **Settings** → **Environment Variables**
- Adicione cada variável acima
- **IMPORTANTE:** Selecione todos os ambientes

### **3. Faça Deploy**
- Conecte com o GitHub
- Selecione a pasta `frontend`
- Configure o build:
  - **Framework Preset:** Vite
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
  - **Install Command:** `npm install`

## 🧪 **Teste a Comunicação:**

### **1. Frontend funcionando:**
```
https://seu-frontend.vercel.app
```

### **2. Backend funcionando:**
```
https://api-back-xi.vercel.app/status
```

### **3. Comunicação entre eles:**
- O frontend deve conseguir fazer requests para o backend
- CORS configurado para aceitar o frontend
- API endpoints funcionando

## ✅ **Resultado Esperado:**
- **Frontend:** ✅ Deployado no Vercel
- **Backend:** ✅ Conectando com Supabase
- **Comunicação:** ✅ Frontend ↔ Backend funcionando

## 🚨 **Problemas Comuns:**
- **CORS:** Verifique se `CORS_ORIGIN` está configurado no backend
- **URLs:** Certifique-se de que as URLs estão corretas
- **Variáveis:** Verifique se todas as variáveis foram configuradas
