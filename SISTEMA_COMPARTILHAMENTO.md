# 🔗 SISTEMA DE COMPARTILHAMENTO DE CALENDÁRIOS

## 📋 Visão Geral

O sistema de compartilhamento permite que usuários compartilhem seus calendários com outros usuários do sistema, concedendo permissões específicas para edição, exclusão e compartilhamento.

## 🏗️ Arquitetura

### Backend
- **Tabela**: `calendar_shares` - Gerencia todos os compartilhamentos
- **Rotas**: `/api/sharing/*` - Endpoints para gerenciar compartilhamentos
- **Autenticação**: JWT para verificar permissões

### Frontend
- **Componente**: `ShareCalendarModal.tsx` - Interface para gerenciar compartilhamentos
- **Integração**: Botões de compartilhamento nos modais de calendário

## 🗄️ Estrutura do Banco

```sql
CREATE TABLE calendar_shares (
    id SERIAL PRIMARY KEY,
    calendar_id INTEGER NOT NULL,           -- ID do calendário compartilhado
    owner_id INTEGER NOT NULL,              -- Usuário que criou o calendário
    shared_with_id INTEGER NOT NULL,        -- Usuário com quem foi compartilhado
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    can_edit BOOLEAN DEFAULT TRUE,          -- Pode editar tarefas e notas
    can_delete BOOLEAN DEFAULT TRUE,        -- Pode deletar tarefas e notas
    can_share BOOLEAN DEFAULT FALSE,        -- Pode compartilhar com outros
    FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(calendar_id, shared_with_id)     -- Um usuário só pode ter um compartilhamento por calendário
);
```

## 🔐 Permissões

### Níveis de Acesso
1. **can_edit**: Permite editar tarefas e notas do calendário
2. **can_delete**: Permite deletar tarefas e notas do calendário  
3. **can_share**: Permite compartilhar o calendário com outros usuários

### Configuração Padrão
- **Edição**: ✅ Habilitada por padrão
- **Exclusão**: ✅ Habilitada por padrão
- **Compartilhamento**: ❌ Desabilitado por padrão

## 🚀 Como Usar

### 1. Compartilhar um Calendário

#### No Modal de Edição:
1. Clique no botão "✏️ Editar Calendário"
2. Clique no botão "Compartilhar" (azul) no cabeçalho
3. Digite o nome ou email do usuário para compartilhar
4. Configure as permissões desejadas
5. Clique em "Compartilhar Calendário"

#### Após Criar um Calendário:
1. Crie um novo calendário
2. O modal de compartilhamento abrirá automaticamente
3. Configure o compartilhamento conforme necessário

### 2. Gerenciar Compartilhamentos

#### Visualizar Usuários com Acesso:
- Lista todos os usuários que têm acesso ao calendário
- Mostra permissões ativas para cada usuário
- Exibe data e hora do compartilhamento

#### Remover Acesso:
- Clique no ícone de lixeira (🗑️) ao lado do usuário
- Confirme a remoção do compartilhamento

### 3. Buscar Usuários

- Digite pelo menos 2 caracteres no campo de busca
- Busca por nome ou email
- Exclui o usuário atual da lista
- Limite de 10 resultados

## 🔧 Funcionalidades Técnicas

### Validações
- ✅ Usuário não pode compartilhar consigo mesmo
- ✅ Não permite compartilhamentos duplicados
- ✅ Verifica se o calendário pertence ao usuário
- ✅ Valida se o usuário alvo existe no sistema

### Segurança
- 🔒 Autenticação JWT obrigatória
- 🔒 Verificação de propriedade do calendário
- 🔒 Controle de permissões por usuário
- 🔒 Cascade delete em compartilhamentos

### Performance
- ⚡ Índices nas colunas principais
- ⚡ Busca otimizada de usuários
- ⚡ Lazy loading de compartilhamentos

## 📱 Interface do Usuário

### Modal de Compartilhamento
- **Cabeçalho**: Nome do calendário e botão de fechar
- **Busca**: Campo para encontrar usuários
- **Seleção**: Lista de usuários encontrados
- **Permissões**: Checkboxes para configurar acesso
- **Lista**: Usuários com acesso atual e opções de remoção

### Estados Visuais
- 🟢 **Verde**: Usuário selecionado para compartilhamento
- 🔵 **Azul**: Informações do calendário
- 🟡 **Amarelo**: Aviso quando calendário não está selecionado
- 🔴 **Vermelho**: Botão de remoção de compartilhamento

## 🚨 Tratamento de Erros

### Cenários Comuns
- **Usuário não encontrado**: Mensagem clara de erro
- **Calendário já compartilhado**: Aviso de duplicação
- **Permissão negada**: Erro de acesso
- **Falha na API**: Mensagem de erro com sugestões

### Recuperação
- ✅ Tentativas automáticas de reconexão
- ✅ Validação em tempo real
- ✅ Feedback visual para todas as ações
- ✅ Logs detalhados no console

## 🔄 Fluxo de Dados

```
1. Usuário clica em "Compartilhar"
2. Modal abre e carrega compartilhamentos existentes
3. Usuário busca por outro usuário
4. Seleciona usuário e configura permissões
5. Sistema valida dados e cria compartilhamento
6. Modal atualiza lista de compartilhamentos
7. Usuário pode remover compartilhamentos se necessário
```

## 🧪 Testando o Sistema

### Pré-requisitos
- ✅ Banco de dados configurado
- ✅ Tabela `calendar_shares` criada
- ✅ Backend rodando na porta 3001
- ✅ Frontend rodando na porta 8080
- ✅ Usuários cadastrados no sistema

### Cenários de Teste
1. **Compartilhamento básico**: Compartilhar com permissões padrão
2. **Permissões customizadas**: Configurar diferentes níveis de acesso
3. **Remoção de acesso**: Remover usuário compartilhado
4. **Validações**: Tentar compartilhar com usuário inexistente
5. **Segurança**: Tentar compartilhar calendário de outro usuário

## 📝 Logs e Debug

### Console do Navegador
- Busca de usuários
- Criação de compartilhamentos
- Erros de API
- Estados dos componentes

### Backend
- Operações de banco de dados
- Validações de permissão
- Erros de autenticação
- Performance das consultas

## 🔮 Próximas Funcionalidades

### Planejadas
- 📧 Notificações por email
- 🔔 Alertas em tempo real
- 📊 Relatórios de compartilhamento
- 🔐 Permissões mais granulares

### Melhorias
- 🎨 Interface mais intuitiva
- 📱 Responsividade mobile
- ⚡ Performance otimizada
- 🌐 Suporte a múltiplos idiomas

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs no console do navegador
2. Confirme se o backend está rodando
3. Verifique a conexão com o banco de dados
4. Teste as rotas da API diretamente

---

**Desenvolvido para o Sistema de Gestão de Calendários Editoriais** 📅✨
