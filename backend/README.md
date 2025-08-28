# 🚀 Backend Node.js - Calendário Editorial

## 📋 Descrição
Backend completo em Node.js com Express e PostgreSQL para o sistema de Calendário Editorial.

## 🛠️ Tecnologias
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **CORS** - Cross-origin resource sharing

## 📁 Estrutura do Projeto
```
backend/
├── config/
│   └── database.js      # Configuração do banco
├── routes/
│   ├── auth.js          # Rotas de autenticação
│   ├── calendars.js     # Rotas de calendários
│   ├── tasks.js         # Rotas de tarefas
│   └── notes.js         # Rotas de notas
├── database/
│   └── schema.sql       # Schema do banco
├── index.js             # Servidor principal
├── package.json         # Dependências
├── env.example          # Variáveis de ambiente
├── test-api.js          # Script de teste
└── README.md            # Este arquivo
```

## 🚀 Instalação

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar .env com suas configurações
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendario_editorial
DB_USER=postgres
DB_PASS=sua_senha
JWT_SECRET=sua_chave_secreta
```

### 3. Configurar banco PostgreSQL
```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE calendario_editorial;

# Conectar ao banco
\c calendario_editorial

# Executar schema
\i database/schema.sql
```

## 🏃‍♂️ Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Logout

### Calendários
- `GET /api/calendars` - Listar calendários
- `POST /api/calendars` - Criar calendário
- `GET /api/calendars/:id` - Buscar calendário
- `PUT /api/calendars/:id` - Atualizar calendário
- `DELETE /api/calendars/:id` - Excluir calendário

### Tarefas
- `GET /api/tasks` - Listar todas as tarefas
- `GET /api/tasks/calendar/:id` - Listar tarefas de um calendário
- `POST /api/tasks` - Criar tarefa
- `GET /api/tasks/:id` - Buscar tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `DELETE /api/tasks/:id` - Excluir tarefa
- `PATCH /api/tasks/:id/move` - Mover tarefa (mudar status)

### Notas
- `GET /api/notes` - Listar notas
- `POST /api/notes` - Criar nota
- `GET /api/notes/:id` - Buscar nota
- `PUT /api/notes/:id` - Atualizar nota
- `DELETE /api/notes/:id` - Excluir nota

## 🧪 Testar API

### Executar testes
```bash
node test-api.js
```

### Testar manualmente
```bash
# Status da API
curl http://localhost:3001/api/status

# Rota raiz
curl http://localhost:3001/
```

## 🔐 Autenticação

Todas as rotas (exceto auth) requerem token JWT no header:
```
Authorization: Bearer seu_token_aqui
```

## 📊 Banco de Dados

### Tabelas
- **users** - Usuários do sistema
- **user_tokens** - Tokens de autenticação
- **calendars** - Calendários dos usuários
- **tasks** - Tarefas dos calendários
- **notes** - Notas dos usuários

### Relacionamentos
- Usuário → Calendários (1:N)
- Calendário → Tarefas (1:N)
- Usuário → Notas (1:N)

## 🚨 Tratamento de Erros

- **400** - Dados inválidos
- **401** - Não autenticado
- **404** - Recurso não encontrado
- **500** - Erro interno do servidor

## 🔧 Configurações

### Porta
Padrão: 3001
Configurável via variável `PORT`

### CORS
Origem padrão: `http://localhost:5173`
Configurável via variável `CORS_ORIGIN`

### JWT
Expiração padrão: 24 horas
Configurável via variável `JWT_EXPIRES_IN`

## 📝 Logs

O servidor registra todas as requisições no console:
```
2024-12-19T15:30:00.000Z - POST /api/auth/login
2024-12-19T15:30:01.000Z - GET /api/calendars
```

## 🆘 Solução de Problemas

### Erro de conexão com banco
- Verificar se PostgreSQL está rodando
- Verificar credenciais no arquivo `.env`
- Verificar se o banco existe

### Erro de porta em uso
- Mudar porta no arquivo `.env`
- Verificar se não há outro processo usando a porta

### Erro de dependências
- Executar `npm install` novamente
- Verificar versão do Node.js (recomendado: 16+)

## 📞 Suporte

Para dúvidas ou problemas, verificar:
1. Logs do servidor
2. Configurações do banco
3. Variáveis de ambiente
4. Dependências instaladas
