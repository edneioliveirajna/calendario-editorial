# Frontend React - Planit Glow

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar API
Edite o arquivo `src/config/api.ts` e altere a URL da API:
```typescript
export const API_BASE_URL = 'http://seu-servidor.com/backend';
```

### 3. Executar em Desenvolvimento
```bash
npm run dev
```

### 4. Build para Produção
```bash
npm run build
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── editorial/          # Componentes do calendário
│   │   ├── CalendarDay.tsx
│   │   ├── CalendarGrid.tsx
│   │   ├── CalendarHeader.tsx
│   │   ├── CalendarSidebar.tsx
│   │   ├── CreateCalendarModal.tsx
│   │   └── ReportsModal.tsx
│   └── ui/                # Componentes de interface (shadcn/ui)
├── config/
│   └── api.ts             # Configuração da API
├── hooks/
│   └── use-toast.ts       # Hook para notificações
├── pages/
│   ├── Index.tsx          # Página principal
│   └── NotFound.tsx       # Página 404
├── types/
│   └── calendar.ts        # Tipos TypeScript
├── App.tsx                # Componente principal
└── main.tsx               # Ponto de entrada
```

## 🔧 Tecnologias Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Bundler e dev server
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de interface
- **React Router** - Navegação
- **React Query** - Gerenciamento de estado
- **Radix UI** - Componentes acessíveis

## 🌐 Funcionalidades

- ✅ Calendário visual responsivo
- ✅ Gestão de tarefas por tipo de conteúdo
- ✅ Suporte a múltiplas plataformas sociais
- ✅ Sistema de filtros avançado
- ✅ Modal para criar novos calendários
- ✅ Sistema de relatórios
- ✅ Notas e anotações por data
- ✅ Interface moderna e acessível

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🎨 Personalização

- Tema claro/escuro
- Cores personalizáveis via Tailwind
- Componentes reutilizáveis
- Sistema de design consistente

## 🔗 Integração com Backend

O frontend está configurado para se integrar com:
- APIs PHP REST
- Banco de dados MySQL
- Sistema de autenticação
- CRUD completo de dados

## 🚀 Deploy

Para fazer deploy:
1. Execute `npm run build`
2. Copie a pasta `dist` para seu servidor web
3. Configure o backend PHP + MySQL
4. Atualize a URL da API em produção
