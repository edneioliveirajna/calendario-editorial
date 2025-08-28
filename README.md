# 🚀 CALENDÁRIO EDITORIAL - Sistema Completo

## 📋 Descrição
Sistema completo de Calendário Editorial para gestão de conteúdo digital, com autenticação JWT, calendários compartilháveis, tarefas organizadas por data, sistema de notas e interface moderna.

## ✨ Funcionalidades Principais

### 🔐 **Autenticação & Usuários**
- ✅ Registro e login de usuários
- ✅ Autenticação JWT segura
- ✅ Isolamento de dados por usuário
- ✅ Sistema de permissões

### 📅 **Gestão de Calendários**
- ✅ Criação de calendários editoriais
- ✅ Múltiplos calendários por usuário
- ✅ Sistema de compartilhamento com permissões
- ✅ Edição automática de tarefas ao alterar mês de início

### ✅ **Sistema de Tarefas**
- ✅ Criação e edição de tarefas
- ✅ Drag & Drop entre datas
- ✅ Filtros por calendário
- ✅ Status e tipos de conteúdo
- ✅ Plataformas de publicação

### 📝 **Sistema de Notas**
- ✅ Notas gerais e associadas a tarefas
- ✅ Navegação inteligente via tooltip
- ✅ Filtros avançados
- ✅ Isolamento por usuário e calendário

### 🔗 **Compartilhamento**
- ✅ Compartilhar calendários com outros usuários
- ✅ Controle granular de permissões (editar, deletar, compartilhar)
- ✅ Sistema de convites por email

## 🛠️ Tecnologias

### **Backend**
- **Node.js** + **Express**
- **PostgreSQL** + **pg** (driver)
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **CORS** configurado

### **Frontend**
- **React 18** + **TypeScript**
- **Vite** para build
- **Tailwind CSS** para estilização
- **Shadcn/ui** para componentes
- **Lucide React** para ícones

### **Banco de Dados**
- **PostgreSQL** com schema completo
- **Tabelas:** users, calendars, tasks, notes, calendar_shares, user_tokens

## 🚀 Instalação e Execução

### **1. Pré-requisitos**
- Node.js 16+
- PostgreSQL 12+
- Git

### **2. Clone o repositório**
```bash
git clone <url-do-repositorio>
cd CALENDARIO
```

### **3. Configurar Backend**
```bash
cd backend
npm install
cp env.example .env
# Editar .env com suas configurações
```

### **4. Configurar Frontend**
```bash
cd frontend
npm install
```

### **5. Executar (Opção Simples)**
```bash
# Na raiz do projeto
start-dev.bat
```

### **6. Executar Manualmente**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🌐 URLs de Acesso

- **Frontend:** http://localhost:8080
- **Backend:** http://localhost:3000
- **API:** http://localhost:3000/api

## 🔑 Credenciais de Teste

- **Email:** `admin@planitglow.com`
- **Senha:** `123456`

## 📁 Estrutura do Projeto

```
CALENDARIO/
├── backend/                 # Servidor Node.js
│   ├── routes/             # Rotas da API
│   ├── config/             # Configurações
│   ├── database/           # Schema do banco
│   └── index.js            # Servidor principal
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── hooks/          # Hooks customizados
│   │   ├── pages/          # Páginas principais
│   │   └── types/          # Tipos TypeScript
│   └── package.json
├── start-dev.bat           # Script de inicialização
├── API_DOCUMENTATION.md    # Documentação completa da API
├── INSTRUCOES_DEV.md       # Instruções detalhadas
└── README.md               # Este arquivo
```

## 📚 Documentação

### **📖 Documentação da API**
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Documentação completa de todas as rotas

### **🔧 Instruções de Desenvolvimento**
- [INSTRUCOES_DEV.md](INSTRUCOES_DEV.md) - Guia detalhado para desenvolvedores

### **🔗 Sistema de Compartilhamento**
- [SISTEMA_COMPARTILHAMENTO.md](SISTEMA_COMPARTILHAMENTO.md) - Detalhes do sistema de compartilhamento

## 🎯 Funcionalidades Implementadas

### **✅ Sistema de Notas Completo**
- Notas gerais e associadas a tarefas
- Lista unificada com indicadores visuais
- Navegação inteligente via tooltip
- Isolamento por usuário e calendário

### **✅ Drag & Drop de Tarefas**
- Movimento entre dias
- Atualização automática do estado
- Toast personalizado
- Backend integrado

### **✅ Mudança Automática de Calendário**
- Tarefas atualizam automaticamente
- Notas filtradas por calendário
- Estado sincronizado

### **✅ Ajuste Automático de Datas**
- Edição de calendário ajusta tarefas
- Preservação do dia
- API integrada

### **✅ Interface Moderna**
- Modais responsivos
- Cores vibrantes e gradientes
- Status dinâmico
- Validação visual

## 🔌 APIs Implementadas

### **Endpoints Principais**
- **`/api/auth`** - Registro, login, verificação
- **`/api/calendars`** - CRUD de calendários
- **`/api/tasks`** - CRUD de tarefas + move
- **`/api/notes`** - CRUD de notas
- **`/api/sharing`** - Sistema de compartilhamento

### **Recursos Especiais**
- **Autenticação JWT** em todas as rotas
- **Isolamento de usuários** automático
- **Sistema de permissões** granular
- **Validação de dados** completa
- **Tratamento de erros** padronizado

## 🚨 Solução de Problemas

### **Problemas Comuns**
1. **Frontend não conecta ao backend**
   - Verificar se ambos estão rodando
   - Verificar portas (8080 e 3000)
   - Verificar CORS

2. **Banco não conecta**
   - Verificar se PostgreSQL está rodando
   - Verificar credenciais no .env
   - Verificar se o banco existe

3. **Erro "Failed to fetch"**
   - Backend não está rodando
   - CORS mal configurado
   - Portas incorretas

## 🎉 Status do Projeto

**✅ SISTEMA 100% FUNCIONAL!**

- 🔐 Autenticação JWT funcionando
- 📅 Gestão de calendários completa
- ✅ Sistema de tarefas operacional
- 📝 Sistema de notas implementado
- 🔗 Compartilhamento funcionando
- 🎨 Interface moderna e responsiva
- 🗄️ Banco PostgreSQL persistente

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do servidor
2. Verificar configurações do banco
3. Verificar variáveis de ambiente
4. Verificar dependências instaladas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para gestão eficiente de conteúdo editorial!** 🚀
