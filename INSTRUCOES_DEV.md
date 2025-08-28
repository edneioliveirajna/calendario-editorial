# 🚀 CALENDARIO - INSTRUÇÕES DE DESENVOLVIMENTO

## ✅ **STATUS ATUAL: SISTEMA 100% FUNCIONAL!**

- **Frontend React** - Porta 8080 ✅
- **Backend Node.js** - Porta 3001 ✅  
- **PostgreSQL** - Banco funcionando ✅
- **CORS** - Configurado corretamente ✅
- **Usuário Admin** - Criado no banco ✅
- **Sistema de Notas** - Implementado completamente ✅
- **Drag & Drop** - Funcionando perfeitamente ✅
- **Isolamento de Usuários** - Implementado ✅

## 🎯 **COMO USAR AGORA:**

### **Opção 1: Inicialização Automática (RECOMENDADO)**
```bash
# Duplo clique no arquivo:
start-dev.bat
```

### **Opção 2: Inicialização Manual**
**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 **URLS DE ACESSO:**

- **Frontend:** http://localhost:8080/
- **Backend:** http://localhost:3001/
- **API Status:** http://localhost:3001/api/status

## 🔑 **CREDENCIAIS DE TESTE:**

- **Email:** `admin@planitglow.com`
- **Senha:** `123456`

## 📊 **ESTRUTURA DO BANCO:**

**Tabelas criadas:**
- ✅ `users` - Usuários do sistema
- ✅ `calendars` - Calendários editoriais  
- ✅ `tasks` - Tarefas e conteúdo
- ✅ `notes` - Sistema completo de anotações
- ✅ `user_tokens` - Tokens de autenticação

**Campos principais da tabela `notes`:**
- `id` - Identificador único
- `title` - Título da nota
- `content` - Conteúdo da nota
- `calendar_id` - Calendário associado
- `task_id` - Tarefa associada (opcional)
- `is_general` - Se é nota geral ou associada
- `date` - Data da nota
- `user_id` - Usuário criador
- `created_at` / `updated_at` - Timestamps

## 🔧 **CONFIGURAÇÕES:**

**Backend (.env):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendario_editorial
DB_USER=postgres
DB_PASS=admin123
PORT=3001
CORS_ORIGIN=http://localhost:8080
JWT_SECRET=calendario_editorial_secret_key_2024
```

**Frontend (vite.config.ts):**
```typescript
server: {
  host: "::",
  port: 8080,
}
```

## 🚨 **SOLUÇÃO DE PROBLEMAS:**

### **Se o frontend não conectar ao backend:**
1. Verificar se ambos estão rodando
2. Verificar se as portas estão corretas (8080 e 3001)
3. Verificar se o CORS está configurado para localhost:8080

### **Se o banco não conectar:**
1. Verificar se PostgreSQL está rodando
2. Verificar credenciais no arquivo .env
3. Executar: `node backend/test-db.js`

### **Se der erro de "Failed to fetch":**
1. Backend não está rodando
2. CORS mal configurado
3. Portas incorretas

## 🎉 **RESULTADO:**

**Sistema completo funcionando com:**
- 🔐 Autenticação JWT
- 📅 Gestão de calendários
- ✅ Sistema de tarefas
- 📝 Sistema completo de notas
- 🎨 Interface moderna e responsiva
- 🗄️ Banco PostgreSQL persistente

## 🆕 **FUNCIONALIDADES IMPLEMENTADAS:**

### **📝 Sistema de Notas Completo:**
- ✅ **Notas Gerais**: Criadas via botão "Nova Nota"
- ✅ **Notas Associadas a Tarefas**: Via botão "Associar a Tarefa"
- ✅ **Lista Unificada**: Todas as notas aparecem na mesma lista
- ✅ **Indicadores Visuais**: Notas associadas mostram " Associada a tarefa"
- ✅ **Isolamento por Usuário**: Cada usuário vê apenas suas notas
- ✅ **Isolamento por Calendário**: Notas filtradas por calendário atual

### **🎯 Drag & Drop de Tarefas:**
- ✅ **Movimento entre dias**: Arrastar e soltar tarefas
- ✅ **Atualização automática**: Estado local sincronizado
- ✅ **Toast personalizado**: Mostra data de destino
- ✅ **Backend integrado**: API PATCH `/api/tasks/:id/move`

### **🔄 Mudança Automática de Calendário:**
- ✅ **Tarefas atualizam automaticamente**: Sem refresh manual
- ✅ **Notas filtradas**: Por calendário selecionado
- ✅ **Estado sincronizado**: Hook `useTasks` reativo

### **📅 Ajuste Automático de Datas:**
- ✅ **Edição de calendário**: Tarefas ajustam para novo mês
- ✅ **Preservação do dia**: Apenas mês/ano mudam
- ✅ **API PUT `/api/calendars/:id`**: Com lógica de ajuste

### **👥 Isolamento de Usuários:**
- ✅ **Calendários**: Usuário vê apenas os seus
- ✅ **Tarefas**: Filtradas por calendário do usuário
- ✅ **Notas**: Isoladas por usuário e calendário
- ✅ **Middleware**: `authenticateToken` em todas as rotas

### **🎨 Melhorias na Interface:**
- ✅ **Modais responsivos**: Sem scrollbar em 100% zoom
- ✅ **Cores vibrantes**: Gradientes e hover effects
- ✅ **Status dinâmico**: Bordas coloridas por status
- ✅ **Validação visual**: Mensagens sem border/background
- ✅ **Focus customizado**: Outlines personalizados

### **🔧 Registração de Usuários:**
- ✅ **Validação de email**: Impede duplicatas
- ✅ **Mensagens específicas**: "Tente com outro usuário ou email"
- ✅ **Campo company_name**: Aceito no backend
- ✅ **Estado vazio**: Tela "Criar Primeiro Calendário"

### **📊 Relatórios por Calendário:**
- ✅ **Filtro automático**: Por calendário selecionado
- ✅ **Dados corretos**: Tasks do calendário atual
- ✅ **Modal responsivo**: Company name dinâmico

### **🔗 Sistema de Navegação via Tooltip:**
- ✅ **Tooltip Inteligente**: Hover em "Associada a tarefa" mostra detalhes
- ✅ **Navegação Direta**: Botão "Ver no Calendário" navega para a tarefa
- ✅ **Scroll Automático**: Rola automaticamente para o calendário
- ✅ **Abertura de Modal**: Abre modal dos "3 pontinhos" se necessário (3+ tarefas)
- ✅ **Destaque Visual**: Tarefa fica com anel roxo pulsante por 5 segundos
- ✅ **Scroll Desbloqueado**: Permite rolar a página mesmo com modal aberto
- ✅ **Funciona para Qualquer Quantidade**: 1, 2, 3+ tarefas por dia
- ✅ **Tooltip Estável**: Não desaparece ao mover mouse para o botão

## 🔌 **APIs IMPLEMENTADAS:**

### **📝 API de Notas (`/api/notes`):**
```javascript
// Listar notas com filtros
GET /api/notes?calendar_id=1&task_id=2&is_general=true

// Criar nova nota
POST /api/notes
Body: {
  title: "Título da nota",
  content: "Conteúdo da nota",
  calendar_id: 1,        // Opcional
  task_id: 2,           // Opcional
  is_general: true,     // true=geral, false=associada
  date: "2024-08-21"    // Opcional
}

// Atualizar nota existente
PUT /api/notes/:id
Body: { title: "Novo título", content: "Novo conteúdo" }

// Buscar nota específica
GET /api/notes/:id

// Deletar nota
DELETE /api/notes/:id
```

### **✅ API de Tarefas (`/api/tasks`):**
```javascript
// Listar tarefas com filtro por calendário
GET /api/tasks?calendar_id=1

// Mover tarefa para nova data
PATCH /api/tasks/:id/move
Body: { new_date: "2024-08-25" }

// Outras operações CRUD
GET /api/tasks/:id
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
```

### **📅 API de Calendários (`/api/calendars`):**
```javascript
// Atualizar calendário (com ajuste automático de tarefas)
PUT /api/calendars/:id
Body: {
  name: "Novo nome",
  start_month: "2024-09",  // Ajusta tarefas automaticamente
  company_name: "Empresa"
}

// Outras operações CRUD
GET /api/calendars
POST /api/calendars
GET /api/calendars/:id
DELETE /api/calendars/:id
```

### **🔐 API de Autenticação (`/api/auth`):**
```javascript
// Registrar usuário
POST /api/auth/register
Body: {
  email: "user@email.com",
  password: "senha123",
  company_name: "Nome da Empresa"
}

// Login
POST /api/auth/login
Body: { email: "user@email.com", password: "senha123" }

// Verificar token
GET /api/auth/verify
Headers: { Authorization: "Bearer <token>" }
```

## ⚛️ **COMPONENTES E HOOKS PRINCIPAIS:**

### **🎣 Hooks Personalizados:**

**`useAuth`**: Gerenciamento de autenticação
- Login/logout/register
- Verificação de token
- Estado do usuário

**`useTasks`**: Gerenciamento de tarefas
- CRUD de tarefas
- Drag & drop
- Filtro por calendário
- Reatividade automática

**`useNotes`**: Gerenciamento de notas
- CRUD de notas
- Filtros avançados
- Notas gerais vs associadas
- Isolamento por usuário/calendário

### **🎨 Componentes Principais:**

**`NotesSection`**: Seção completa de notas
- Lista unificada
- Formulários de criação
- Associação a tarefas
- Indicadores visuais

**`CalendarGrid`**: Grid do calendário
- Drag & drop
- Exibição de tarefas
- Indicadores de notas

**`CreateTaskModal` / `EditTaskModal`**: Modais de tarefas
- Design responsivo
- Validação visual
- Cores dinâmicas

**`CalendarSidebar`**: Menu lateral
- Seleção de calendários
- Mudança automática
- Estado reativo

### **🔄 Fluxo de Dados:**

1. **Login** → `useAuth` → Token salvo
2. **Seleção de Calendário** → `currentCalendarId` → `useTasks` reativo
3. **Criação de Nota** → `useNotes` → Estado atualizado
4. **Drag & Drop** → `moveTask` → Backend → Estado local
5. **Mudança de Calendário** → Todas as listas atualizam automaticamente
6. **Navegação via Tooltip** → Custom Event → Scroll automático + Modal

### **🔗 Implementação Técnica do Sistema de Navegação:**

**1. Tooltip com Navegação (`NotesSection.tsx`):**
```typescript
// Estado para controlar tooltip
const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null);

// Função de navegação
const navigateToTask = (taskId: number) => {
  const task = tasks?.find(t => t.id === taskId.toString());
  
  if (task) {
    // Dispara evento customizado
    const highlightEvent = new CustomEvent('highlightTask', {
      detail: {
        taskId: taskId,
        taskTitle: task.title,
        taskDate: task.date
      }
    });
    
    window.dispatchEvent(highlightEvent);
    setHoveredTaskId(null);
  }
};
```

**2. Escuta do Evento (`Index.tsx`):**
```typescript
useEffect(() => {
  const handleHighlightTask = (event: CustomEvent) => {
    const { taskId, taskTitle, taskDate } = event.detail;
    
    // Define tarefa destacada
    setHighlightedTaskId(taskId);
    
    // Scroll automático para calendário
    setTimeout(() => {
      const calendarSection = document.querySelector('.flex-1.p-6');
      if (calendarSection) {
        calendarSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
      
      // Depois centraliza na tarefa
      setTimeout(() => {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
          taskElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 500);
    }, 200);
  };

  window.addEventListener('highlightTask', handleHighlightTask as EventListener);
  return () => {
    window.removeEventListener('highlightTask', handleHighlightTask as EventListener);
  };
}, [currentDate]);
```

**3. Modal Automático (`TasksDropdown.tsx`):**
```typescript
// Detecção de abertura via tooltip
autoOpen={highlightedTaskId !== null && tasks.some(task => parseInt(task.id) === highlightedTaskId)}

// Desbloqueio de scroll quando aberto via tooltip
useEffect(() => {
  if (isOpen && autoOpen) {
    // Remove bloqueios do Radix UI
    document.body.style.overflow = 'auto !important';
    document.body.classList.add('modal-tooltip-open');
    
    // Cleanup
    return () => {
      document.body.classList.remove('modal-tooltip-open');
      document.body.style.overflow = '';
    };
  }
}, [isOpen, autoOpen]);
```

**4. CSS para Scroll Desbloqueado:**
```css
/* Permite scroll da página quando modal aberto via tooltip */
.modal-tooltip-open {
  overflow: auto !important;
  pointer-events: auto !important;
}

.modal-tooltip-open [data-radix-portal] {
  pointer-events: none !important;
  overflow: visible !important;
}
```

**5. Destaque Visual (`CalendarDay.tsx`):**
```typescript
// Destaque condicional na tarefa
className={cn(
  "badge-base-styles",
  highlightedTaskId === parseInt(task.id) && 
  "ring-2 ring-purple-500 ring-offset-2 bg-purple-50 border-purple-300 shadow-lg scale-105 animate-pulse"
)}
```

## 🐛 **PROBLEMAS RESOLVIDOS:**

### **Navegação via Tooltip - Desafios Superados:**

**1. Problema inicial**: Tooltip desaparecia muito rápido
- ✅ **Solução**: Estado controlado com `onMouseEnter`/`onMouseLeave` + div transparente conectora

**2. Problema**: Modal dos 3 pontinhos não abria automaticamente  
- ✅ **Solução**: Prop `autoOpen` baseada em `highlightedTaskId`

**3. Problema**: Scroll da página bloqueado pelo Radix UI
- ✅ **Solução**: CSS agressivo + remoção de atributos `data-scroll-locked`

**4. Problema**: Scroll não rolava automaticamente para a tarefa
- ✅ **Solução**: `setTimeout` escalonado: calendário (200ms) → tarefa (700ms)

**5. Problema**: Modal interno sem scroll quando aberto via tooltip
- ✅ **Solução**: Detecção de contexto + CSS condicional `modal-tooltip-open`

**6. Problema**: Tarefas não atualizavam ao mudar calendário
- ✅ **Solução**: `useEffect` reativo em `Index.tsx` que chama `loadTasks()`

**7. Problema**: Destaque visual não funcionava em modais
- ✅ **Solução**: Prop `highlightedTaskId` passada até `TasksDropdown`

### **Arquitetura da Solução:**
```
NotesSection (tooltip) 
    ↓ CustomEvent('highlightTask')
Index.tsx (listener)
    ↓ setHighlightedTaskId + scroll automático
CalendarDay (props)
    ↓ highlightedTaskId + autoOpen
TasksDropdown (modal)
    ↓ Destaque visual + scroll desbloqueado
```

## 📞 **SUPORTE:**

Se algo não funcionar, verificar:
1. ✅ Ambos os serviços rodando
2. ✅ Portas corretas (8080 e 3001)
3. ✅ PostgreSQL ativo
4. ✅ Arquivo .env configurado

**O sistema está 100% funcional e pronto para uso!** 🚀

## 🎉 **RECURSOS ÚNICOS IMPLEMENTADOS:**

- 🔗 **Navegação Cross-Component**: Via Custom Events
- 🎯 **Modal Inteligente**: Detecta contexto de abertura
- 📜 **Scroll Condicional**: Desbloqueado apenas quando necessário
- 🎨 **Destaque Temporal**: 5 segundos com animação
- ⚡ **Performance Otimizada**: Timeouts escalonados para UX suave
