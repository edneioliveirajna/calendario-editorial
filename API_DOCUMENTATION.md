# 🚀 API DOCUMENTATION - CALENDÁRIO EDITORIAL

## 📋 Visão Geral
API completa para sistema de Calendário Editorial com autenticação JWT, gestão de calendários, tarefas, notas e sistema de compartilhamento.

## 🌐 Base URL
```
http://localhost:3000/api
```

## 🔐 Autenticação
Todas as rotas (exceto `/auth/*`) requerem token JWT no header:
```
Authorization: Bearer <seu_token_aqui>
```

---

## 🔑 AUTENTICAÇÃO (`/api/auth`)

### POST `/api/auth/register`
**Registrar novo usuário**

**Body:**
```json
{
  "email": "user@email.com",
  "password": "senha123",
  "company_name": "Nome da Empresa" // Opcional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 1,
    "name": "Nome da Empresa",
    "email": "user@email.com",
    "company_name": "Nome da Empresa"
  },
  "token": "jwt_token_aqui"
}
```

### POST `/api/auth/login`
**Login de usuário**

**Body:**
```json
{
  "email": "user@email.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "name": "Nome da Empresa",
    "email": "user@email.com"
  },
  "token": "jwt_token_aqui"
}
```

### POST `/api/auth/verify`
**Verificar token válido**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Token válido",
  "user": {
    "id": 1,
    "name": "Nome da Empresa",
    "email": "user@email.com"
  }
}
```

---

## 📅 CALENDÁRIOS (`/api/calendars`)

### GET `/api/calendars`
**Listar calendários do usuário**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "calendars": [
    {
      "id": 1,
      "name": "Nome do Calendário",
      "company_name": "EFROL",
      "start_month": "2025-09",
      "description": "Descrição do calendário",
      "color": "#3B82F6",
      "unique_url": "uuid-aqui",
      "created_at": "2025-08-23T10:00:00Z",
      "is_owner": true,
      "can_edit": true,
      "can_delete": true,
      "can_share": true
    }
  ]
}
```

### POST `/api/calendars`
**Criar novo calendário**

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Nome do Calendário",
  "company_name": "EFROL",
  "start_month": "2025-09",
  "description": "Descrição opcional",
  "color": "#3B82F6"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Calendário criado com sucesso",
  "calendar": {
    "id": 1,
    "name": "Nome do Calendário",
    "company_name": "EFROL",
    "start_month": "2025-09",
    "description": "Descrição opcional",
    "color": "#3B82F6",
    "unique_url": "uuid-aqui",
    "created_at": "2025-08-23T10:00:00Z"
  }
}
```

### GET `/api/calendars/:id`
**Buscar calendário específico**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "calendar": {
    "id": 1,
    "name": "Nome do Calendário",
    "company_name": "EFROL",
    "start_month": "2025-09",
    "description": "Descrição",
    "color": "#3B82F6",
    "unique_url": "uuid-aqui",
    "created_at": "2025-08-23T10:00:00Z",
    "is_owner": true,
    "can_edit": true,
    "can_delete": true,
    "can_share": true
  }
}
```

### PUT `/api/calendars/:id`
**Atualizar calendário**

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Novo Nome",
  "company_name": "NOVA EMPRESA",
  "start_month": "2025-10"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Calendário atualizado com sucesso",
  "calendar": {
    "id": 1,
    "name": "Novo Nome",
    "company_name": "NOVA EMPRESA",
    "start_month": "2025-10"
  }
}
```

**⚠️ Importante:** Ao alterar `start_month`, todas as tarefas são automaticamente ajustadas para o novo mês.

### DELETE `/api/calendars/:id`
**Excluir calendário**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Calendário excluído com sucesso"
}
```

---

## ✅ TAREFAS (`/api/tasks`)

### GET `/api/tasks`
**Listar tarefas do usuário**

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `calendar_id` (opcional): Filtrar por calendário específico

**Response (200):**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "123",
      "calendar_id": 1,
      "title": "Título da Tarefa",
      "description": "Descrição da tarefa",
      "content_type": "image",
      "platforms": ["instagram", "facebook"],
      "status": "pending",
      "date": "2025-09-15",
      "created_at": "2025-08-23T10:00:00Z"
    }
  ]
}
```

### POST `/api/tasks`
**Criar nova tarefa**

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "calendar_id": 1,
  "title": "Título da Tarefa",
  "description": "Descrição opcional",
  "content_type": "image",
  "platforms": ["instagram", "facebook"],
  "status": "pending",
  "date": "2025-09-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tarefa criada com sucesso",
  "task": {
    "id": "123",
    "calendar_id": 1,
    "title": "Título da Tarefa",
    "description": "Descrição opcional",
    "content_type": "image",
    "platforms": ["instagram", "facebook"],
    "status": "pending",
    "date": "2025-09-15",
    "created_at": "2025-08-23T10:00:00Z"
  }
}
```

### GET `/api/tasks/:id`
**Buscar tarefa específica**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "task": {
    "id": "123",
    "calendar_id": 1,
    "title": "Título da Tarefa",
    "description": "Descrição",
    "content_type": "image",
    "platforms": ["instagram", "facebook"],
    "status": "pending",
    "date": "2025-09-15",
    "created_at": "2025-08-23T10:00:00Z"
  }
}
```

### PUT `/api/tasks/:id`
**Atualizar tarefa**

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "Novo Título",
  "description": "Nova descrição",
  "content_type": "video",
  "platforms": ["youtube"],
  "status": "completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Tarefa atualizada com sucesso",
  "task": {
    "id": "123",
    "title": "Novo Título",
    "description": "Nova descrição",
    "content_type": "video",
    "platforms": ["youtube"],
    "status": "completed"
  }
}
```

### DELETE `/api/tasks/:id`
**Excluir tarefa**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Tarefa excluída com sucesso"
}
```

### PATCH `/api/tasks/:id/move`
**Mover tarefa para nova data**

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "new_date": "2025-09-20"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Tarefa movida com sucesso",
  "task": {
    "id": "123",
    "date": "2025-09-20"
  }
}
```

---

## 📝 NOTAS (`/api/notes`)

### GET `/api/notes`
**Listar notas do usuário**

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `calendar_id` (opcional): Filtrar por calendário
- `task_id` (opcional): Filtrar por tarefa
- `is_general` (opcional): Filtrar por tipo (true=geral, false=associada)

**Response (200):**
```json
{
  "success": true,
  "notes": [
    {
      "id": 1,
      "title": "Título da Nota",
      "content": "Conteúdo da nota",
      "calendar_id": 1,
      "task_id": null,
      "is_general": true,
      "date": "2025-09-15",
      "created_at": "2025-08-23T10:00:00Z"
    }
  ]
}
```

### POST `/api/notes`
**Criar nova nota**

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "Título da Nota",
  "content": "Conteúdo da nota",
  "calendar_id": 1,        // Opcional
  "task_id": "123",        // Opcional
  "is_general": true,      // true=geral, false=associada
  "date": "2025-09-15"    // Opcional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Nota criada com sucesso",
  "note": {
    "id": 1,
    "title": "Título da Nota",
    "content": "Conteúdo da nota",
    "calendar_id": 1,
    "task_id": null,
    "is_general": true,
    "date": "2025-09-15",
    "created_at": "2025-08-23T10:00:00Z"
  }
}
```

### GET `/api/notes/:id`
**Buscar nota específica**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "note": {
    "id": 1,
    "title": "Título da Nota",
    "content": "Conteúdo da nota",
    "calendar_id": 1,
    "task_id": null,
    "is_general": true,
    "date": "2025-09-15",
    "created_at": "2025-08-23T10:00:00Z"
  }
}
```

### PUT `/api/notes/:id`
**Atualizar nota**

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "Novo Título",
  "content": "Novo conteúdo"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Nota atualizada com sucesso",
  "note": {
    "id": 1,
    "title": "Novo Título",
    "content": "Novo conteúdo"
  }
}
```

### DELETE `/api/notes/:id`
**Excluir nota**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Nota excluída com sucesso"
}
```

---

## 🔗 COMPARTILHAMENTO (`/api/sharing`)

### POST `/api/sharing/share`
**Compartilhar calendário**

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "calendarId": 1,
  "userEmail": "usuario@email.com",
  "permissions": {
    "can_edit": true,
    "can_delete": false,
    "can_share": true
  }
}
```

**Response (201):**
```json
{
  "message": "Calendário compartilhado com sucesso",
  "share": {
    "id": 1,
    "calendar_id": 1,
    "owner_id": 1,
    "shared_with_id": 2,
    "can_edit": true,
    "can_delete": false,
    "can_share": true,
    "created_at": "2025-08-23T10:00:00Z"
  },
  "sharedWith": {
    "id": 2,
    "email": "usuario@email.com",
    "name": "Nome do Usuário"
  }
}
```

### GET `/api/sharing/calendars/:calendarId`
**Listar compartilhamentos de um calendário**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "shares": [
    {
      "id": 1,
      "shared_with": {
        "id": 2,
        "email": "usuario@email.com",
        "name": "Nome do Usuário"
      },
      "permissions": {
        "can_edit": true,
        "can_delete": false,
        "can_share": true
      },
      "created_at": "2025-08-23T10:00:00Z"
    }
  ]
}
```

### DELETE `/api/sharing/:shareId`
**Remover compartilhamento**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Compartilhamento removido com sucesso"
}
```

---

## 📊 TIPOS DE DADOS

### Content Types
- `image` - Imagem
- `video` - Vídeo
- `text` - Texto
- `campaign` - Campanha

### Platforms
- `instagram` - Instagram
- `facebook` - Facebook
- `youtube` - YouTube
- `linkedin` - LinkedIn
- `tiktok` - TikTok

### Status
- `pending` - Pendente
- `in_progress` - Em andamento
- `completed` - Concluída
- `cancelled` - Cancelada

---

## 🚨 CÓDIGOS DE ERRO

- **400** - Dados inválidos ou incompletos
- **401** - Token não fornecido ou inválido
- **403** - Sem permissão para acessar o recurso
- **404** - Recurso não encontrado
- **500** - Erro interno do servidor

---

## 🔧 CONFIGURAÇÃO

### Variáveis de Ambiente (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendario_editorial
DB_USER=postgres
DB_PASS=admin123
PORT=3000
CORS_ORIGIN=http://localhost:8080
JWT_SECRET=calendario_editorial_secret_key_2024
JWT_EXPIRES_IN=24h
```

### CORS
- **Origem padrão:** `http://localhost:8080`
- **Métodos:** GET, POST, PUT, DELETE, PATCH
- **Headers:** Authorization, Content-Type

---

## 📝 EXEMPLOS DE USO

### Fluxo Completo de Criação
1. **Registrar usuário:** `POST /api/auth/register`
2. **Login:** `POST /api/auth/login`
3. **Criar calendário:** `POST /api/calendars`
4. **Criar tarefa:** `POST /api/tasks`
5. **Criar nota:** `POST /api/notes`

### Autenticação em Todas as Requisições
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

fetch('/api/calendars', { headers })
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## 🆘 SUPORTE

Para dúvidas ou problemas:
1. Verificar logs do servidor
2. Verificar configurações do banco
3. Verificar variáveis de ambiente
4. Verificar dependências instaladas

**Sistema 100% funcional e documentado!** 🚀
