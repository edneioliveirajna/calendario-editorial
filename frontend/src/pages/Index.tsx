import { useState, useEffect } from "react";
import { Calendar, Plus, BarChart3 } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { CalendarHeader } from "@/components/editorial/CalendarHeader";
import { CalendarGrid } from "@/components/editorial/CalendarGrid";
import { CalendarSidebar } from "@/components/editorial/CalendarSidebar";
import { CreateCalendarModal } from "@/components/editorial/CreateCalendarModal";
import { CreateTaskModal } from "@/components/editorial/CreateTaskModal";
import { EditTaskModal } from "@/components/editorial/EditTaskModal";
import { EditCalendarModal } from "@/components/editorial/EditCalendarModal";
import { ShareCalendarModal } from "@/components/editorial/ShareCalendarModal";
import { ReportsModal } from "@/components/editorial/ReportsModal";
import { NotesSection } from "@/components/editorial/NotesSection";
import { CalendarTask, CalendarSettings, ContentType, Platform, Status } from "@/types/calendar";
import { useToast } from "@/hooks/use-toast";
import { useTasks } from "@/hooks/use-tasks";
import { useNotes } from "@/hooks/use-notes";
import { DragAndDropProvider } from "@/contexts/DragAndDropContext";
import { getApiBaseUrl } from "@/config/environment";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, API_ROUTES, buildApiUrl } from "@/config/api";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(() => {
    // Mostrar agosto de 2025 onde estão as tarefas do calendário EFROL
    return new Date(2025, 7, 1); // Agosto = mês 7 (0-indexed)
  });
  const [currentCalendarId, setCurrentCalendarId] = useState(() => {
    const saved = localStorage.getItem('selectedCalendarId');
    return saved ? parseInt(saved) : null; // Inicializar como null para carregar automaticamente
  });
  
  // Hooks para integração com backend
  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError,
    createTask, 
    updateTask, 
    deleteTask, 
    loadTasks, 
    moveTask 
  } = useTasks(currentCalendarId);
  
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const { 
    notes: notesData, 
    loading: notesLoading,
    fetchGeneralNotes 
  } = useNotes();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showEditCalendarModal, setShowEditCalendarModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<any>(null);
  const [filters, setFilters] = useState<{ contentType?: string; platform?: string; status?: string }>({});
  const [companyName, setCompanyName] = useState<string>(''); // Inicializar vazio
  const [startMonth, setStartMonth] = useState<string>(''); // Inicializar vazio
  const [hasCalendars, setHasCalendars] = useState<boolean>(false); // Controlar se tem calendários
  const [calendars, setCalendars] = useState<any[]>([]); // Lista de calendários
  const [showCalendar, setShowCalendar] = useState<boolean>(false); // Flag específica para mostrar calendário
  const [highlightedTaskId, setHighlightedTaskId] = useState<number | null>(null); // Tarefa destacada do tooltip

  
  // Função para trocar de calendário
  const handleCalendarChange = async (newCalendarId: number) => {
    try {
      // Fechar modal de relatórios se estiver aberto
      if (showReportsModal) {
        setShowReportsModal(false);
      }
      
      // Salvar seleção no localStorage
      localStorage.setItem('selectedCalendarId', newCalendarId.toString());
      
      // Atualizar o estado do calendário selecionado
      setCurrentCalendarId(newCalendarId);
      
      // Buscar dados do novo calendário
      const calendarsResponse = await apiRequest(API_ROUTES.CALENDARS.LIST);
      if (calendarsResponse.success && calendarsResponse.data) {
        const selectedCalendar = calendarsResponse.data.find(c => c.id === newCalendarId);
        if (selectedCalendar) {
          setCompanyName(selectedCalendar.company_name);
          setStartMonth(selectedCalendar.start_month);
          
          // Atualizar currentDate para o mês do novo calendário
          if (selectedCalendar.start_month) {
            const [year, month] = selectedCalendar.start_month.split('-');
            const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            setCurrentDate(newDate);
          }
          
          toast({
            title: "🔄 Calendário alterado!",
            description: `Agora exibindo: ${selectedCalendar.company_name}`,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao trocar calendário:', error);
      toast({
        title: "❌ Erro!",
        description: "Falha ao trocar calendário.",
        variant: "destructive",
      });
    }
  };

  // Função para ajustar datas das tarefas quando o mês de início do calendário muda
  const adjustTasksToNewMonth = async (newStartMonth: string) => {
    try {
      console.log('🔄 DEBUG: Ajustando tarefas para o novo mês:', newStartMonth);
      
      // Buscar todas as tarefas do calendário atual
      const response = await apiRequest(`${API_ROUTES.TASKS.LIST}?calendar_id=${currentCalendarId}`);
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('📋 DEBUG: Encontradas tarefas para ajustar:', response.data.length);
        
        // Calcular a diferença de meses
        const [newYear, newMonth] = newStartMonth.split('-');
        const [oldYear, oldMonth] = startMonth.split('-');
        
        const newDate = new Date(parseInt(newYear), parseInt(newMonth) - 1, 1);
        const oldDate = new Date(parseInt(oldYear), parseInt(oldMonth) - 1, 1);
        
        const monthDifference = (newDate.getFullYear() - oldDate.getFullYear()) * 12 + (newDate.getMonth() - oldDate.getMonth());
        
        console.log('📅 DEBUG: Diferença de meses:', monthDifference);
        
        // Ajustar cada tarefa
        for (const task of response.data) {
          if (task.scheduled_date) {
            const taskDate = new Date(task.scheduled_date);
            const newTaskDate = new Date(taskDate.getFullYear(), taskDate.getMonth() + monthDifference, taskDate.getDate());
            
            console.log('🔄 DEBUG: Ajustando tarefa:', task.title, 'de', task.scheduled_date, 'para', newTaskDate.toISOString().split('T')[0]);
            
            // Atualizar a tarefa no backend
            await apiRequest(API_ROUTES.TASKS.UPDATE(task.id), {
              method: 'PUT',
              body: JSON.stringify({
                scheduled_date: newTaskDate.toISOString().split('T')[0]
              })
            });
          }
        }
        
        console.log('✅ DEBUG: Todas as tarefas foram ajustadas para o novo mês');
        
        // Recarregar as tarefas para mostrar as mudanças
        loadTasks();
        
      } else {
        console.log('ℹ️ DEBUG: Nenhuma tarefa encontrada para ajustar');
      }
      
    } catch (error) {
      console.error('❌ DEBUG: Erro ao ajustar tarefas:', error);
    }
  };

  // Função para editar calendário
  const handleEditCalendar = (calendar: any) => {
    console.log('🔄 DEBUG: handleEditCalendar chamado com:', calendar);
    console.log('🔄 DEBUG: calendar.id:', calendar?.id);
    console.log('🔄 DEBUG: calendar.company_name:', calendar?.company_name);
    console.log('🔄 DEBUG: calendar.start_month:', calendar?.start_month);
    
    // Abrir modal de edição
    console.log('🔄 DEBUG: Definindo selectedCalendar...');
    setSelectedCalendar(calendar);
    console.log('🔄 DEBUG: Definindo showEditCalendarModal como true...');
    setShowEditCalendarModal(true);
    console.log('✅ DEBUG: Modal de edição aberto');
  };

  // Função para excluir calendário
  const handleDeleteCalendar = async (calendarId: number) => {
    console.log('🗑️ DEBUG: handleDeleteCalendar chamado com ID:', calendarId);
    
    if (confirm('Tem certeza que deseja excluir este calendário? Todas as tarefas serão perdidas!')) {
      try {
        console.log('🔐 DEBUG: Usuário confirmou exclusão, fazendo requisição...');
        console.log('   URL:', API_ROUTES.CALENDARS.DELETE(calendarId));
        console.log('   Método: DELETE');
        
        const response = await apiRequest(API_ROUTES.CALENDARS.DELETE(calendarId), {
          method: 'DELETE',
          body: JSON.stringify({ id: calendarId })
        });
        
        console.log('📥 DEBUG: Resposta da API recebida:', response);
        
        if (response.success) {
          console.log('✅ DEBUG: Calendário excluído com sucesso!');
          toast({
            title: "🗑️ Calendário excluído!",
            description: "Calendário foi removido com sucesso.",
          });
          
          // Se o calendário excluído era o atual, verificar se ainda há calendários
          if (calendarId === currentCalendarId) {
            try {
              // Buscar lista de calendários disponíveis
              const calendarsResponse = await apiRequest(API_ROUTES.CALENDARS.LIST);
              if (calendarsResponse.success && calendarsResponse.data && calendarsResponse.data.length > 0) {
                // Ainda há calendários - selecionar o primeiro
                const firstCalendar = calendarsResponse.data[0];
                setCurrentCalendarId(firstCalendar.id);
                localStorage.setItem('selectedCalendarId', firstCalendar.id.toString());
                
                toast({
                  title: "🔄 Calendário alterado!",
                  description: `Agora exibindo: ${firstCalendar.company_name}`,
                });
              } else {
                // Era o último calendário - voltar para estado vazio
                setHasCalendars(false);
                toast({
                  title: "📝 Último calendário excluído!",
                  description: "Crie um novo calendário para continuar.",
                });
              }
            } catch (error) {
              console.error('Erro ao buscar calendários disponíveis:', error);
            }
          }
          
          // Recarregar dados sem fazer reload da página
          await loadFirstAvailableCalendar();
        }
      } catch (error) {
        console.error('❌ DEBUG: Erro ao excluir calendário:', error);
        toast({
          title: "❌ Erro!",
          description: "Falha ao excluir calendário.",
          variant: "destructive",
        });
      }
    }
  };

  // Função para fechar o dropdown do seletor de calendários
  const handleDropdownClose = () => {
    // Esta função será passada para o CalendarSelector
    // e chamada quando necessário
  };

  // Função para duplicar calendário
  const handleDuplicateCalendar = async (calendar: any) => {
    console.log('📋 DEBUG: handleDuplicateCalendar chamado com:', calendar);
    
    try {
      console.log('🔐 DEBUG: Passo 1: Criando novo calendário...');
      
      // 1. Criar novo calendário com dados do existente
      const newCalendarResponse = await apiRequest(API_ROUTES.CALENDARS.CREATE, {
        method: 'POST',
        body: JSON.stringify({
          company_name: `${calendar.company_name} - Cópia`,
          start_month: calendar.start_month
        })
      });
      
      console.log('📥 DEBUG: Resposta da criação do calendário:', newCalendarResponse);
      
      if (!newCalendarResponse.success) {
        console.log('❌ DEBUG: Falha ao criar calendário duplicado');
        throw new Error('Falha ao criar calendário duplicado');
      }
      
      console.log('✅ DEBUG: Calendário criado com sucesso, ID:', newCalendarResponse.calendar.id);
      const newCalendarId = newCalendarResponse.calendar.id;
      
      console.log('🔐 DEBUG: Passo 2: Buscando tarefas do calendário original...');
      
      // 2. Buscar todas as tarefas do calendário original
      const tasksResponse = await apiRequest(API_ROUTES.TASKS.READ);
      
      console.log('📥 DEBUG: Resposta da busca de tarefas:', tasksResponse);
      
      if (tasksResponse.success && tasksResponse.tasks) {
        console.log('🔐 DEBUG: Passo 3: Duplicando tarefas...');
        console.log('   Total de tarefas para duplicar:', tasksResponse.tasks.length);
        
        // 3. Duplicar cada tarefa para o novo calendário
        for (const task of tasksResponse.tasks) {
          if (task.calendar_id === calendar.id) {
            console.log('   📝 Duplicando tarefa:', task.title);
            await apiRequest(API_ROUTES.TASKS.CREATE, {
              method: 'POST',
              body: JSON.stringify({
                calendar_id: newCalendarId,
                title: task.title,
                content_type: task.content_type,
                platforms: task.platforms,
                status: task.status,
                date: task.date || task.scheduled_date,
                description: task.description || ''
              })
            });
          }
        }
      }
      
      console.log('✅ DEBUG: Todas as tarefas foram duplicadas com sucesso!');
      
      console.log('🔐 DEBUG: Passo 4: Buscando e duplicando notas...');
      
      // 4. Buscar todas as notas do calendário original
      const notesResponse = await apiRequest(`${getApiBaseUrl()}/notes?calendar_id=${calendar.id}`);
      
      if (notesResponse.success && notesResponse.notes) {
        console.log('🔐 DEBUG: Passo 5: Duplicando notas...');
        console.log('   Total de notas para duplicar:', notesResponse.notes.length);
        
        // Mapear IDs antigos das tarefas para os novos IDs
        const taskIdMapping = new Map();
        
        // Primeiro, buscar as tarefas duplicadas para criar o mapeamento
        const duplicatedTasksResponse = await apiRequest(API_ROUTES.TASKS.READ);
        if (duplicatedTasksResponse.success && duplicatedTasksResponse.tasks) {
          const originalTasks = tasksResponse.tasks.filter(task => task.calendar_id === calendar.id);
          const newTasks = duplicatedTasksResponse.tasks.filter(task => task.calendar_id === newCalendarId);
          
          // Mapear IDs antigos para novos baseado no título e conteúdo
          for (const originalTask of originalTasks) {
            const newTask = newTasks.find(nt => 
              nt.title === originalTask.title && 
              nt.content_type === originalTask.content_type &&
              nt.date === originalTask.date
            );
            if (newTask) {
              taskIdMapping.set(originalTask.id, newTask.id);
            }
          }
        }
        
        // 5. Duplicar cada nota para o novo calendário
        for (const note of notesResponse.notes) {
          console.log('   📝 Duplicando nota:', note.title || 'Sem título');
          
          if (note.is_general) {
            // Nota simples - duplicar para o novo calendário
            await apiRequest(`${getApiBaseUrl()}/notes`, {
              method: 'POST',
              body: JSON.stringify({
                title: note.title,
                content: note.content,
                calendar_id: newCalendarId,
                is_general: true
              })
            });
          } else if (note.task_id && taskIdMapping.has(note.task_id)) {
            // Nota associada a tarefa - duplicar e linkar à nova tarefa
            const newTaskId = taskIdMapping.get(note.task_id);
            await apiRequest(`${getApiBaseUrl()}/notes`, {
              method: 'POST',
              body: JSON.stringify({
                title: note.title,
                content: note.content,
                calendar_id: newCalendarId,
                task_id: newTaskId,
                is_general: false
              })
            });
          }
        }
        
        console.log('✅ DEBUG: Todas as notas foram duplicadas com sucesso!');
      }
      
      toast({
        title: "✅ Calendário duplicado!",
        description: `Calendário "${calendar.company_name}" foi duplicado com sucesso! Tarefas e notas foram copiadas.`,
      });
      
      // 6. Selecionar o novo calendário automaticamente
      setCurrentCalendarId(newCalendarId);
      localStorage.setItem('selectedCalendarId', newCalendarId.toString());
      
      // Recarregar dados sem fazer reload da página
      await loadFirstAvailableCalendar();
      
    } catch (error) {
      console.error('❌ DEBUG: Erro ao duplicar calendário:', error);
      toast({
        title: "❌ Erro!",
        description: `Falha ao duplicar calendário: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Esta função será passada para o CalendarSelector
  const handleShareCalendar = (calendar: any) => {
    console.log('🔗 DEBUG: handleShareCalendar chamado com:', calendar);
    setSelectedCalendar(calendar);
    setShowShareModal(true);
    console.log('✅ DEBUG: Modal de compartilhamento aberto');
  };

  const [displayMonth, setDisplayMonth] = useState<string>('agosto 2025'); // Inicializar com agosto 2025

  const handleTaskUpdate = async (updatedTask: CalendarTask) => {
    try {
      await updateTask(updatedTask.id, updatedTask);
      
      // Mostrar mensagem de sucesso IMEDIATAMENTE
      toast({
        title: "✅ Tarefa atualizada!",
        description: `Tarefa "${updatedTask.title}" foi atualizada com sucesso!`,
      });
      
      // Recarregar tarefas para atualizar o relatório automaticamente (em background)
      loadTasks();
      
      // O modal de relatório se atualizará automaticamente através das props
      // já que o hook useTasks atualiza o estado local
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      
      // Verificar se é erro de permissão
      if (error.isPermissionError) {
        toast({
          title: "🚫 Acesso Negado",
          description: error.permissionMessage || "Você não tem permissão para editar esta tarefa. Verifique com o administrador do calendário.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Erro!",
          description: "Falha ao atualizar tarefa. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      
      // Mostrar mensagem de sucesso IMEDIATAMENTE
      toast({
        title: "✅ Tarefa excluída!",
        description: "Tarefa e notas associadas foram excluídas com sucesso!",
      });
      
      // Recarregar tarefas para atualizar o relatório automaticamente (em background)
      loadTasks();
      
      // O modal de relatório se atualizará automaticamente através das props
      // já que o hook useTasks atualiza o estado local
      
      // Recarregar notas para remover notas associadas que foram excluídas automaticamente
      if (currentCalendarId) {
        // Aguardar um pouco para o backend processar a exclusão das notas
        setTimeout(async () => {
          // Disparar evento para recarregar as notas no NotesSection
          window.dispatchEvent(new CustomEvent('reloadNotes', {
            detail: { calendarId: currentCalendarId }
          }));
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      
      // Verificar se é erro de permissão
      if (error.isPermissionError) {
        toast({
          title: "🚫 Acesso Negado",
          description: error.permissionMessage || "Você não tem permissão para excluir esta tarefa. Verifique com o administrador do calendário.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Erro!",
          description: "Falha ao excluir tarefa. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  // Função para mover tarefa entre dias
  const handleTaskMove = async (taskId: string, newDate: string) => {
    try {
      // Converter a string da data para um objeto Date
      const [year, month, day] = newDate.split('-').map(Number);
      const newDateObj = new Date(year, month - 1, day);
      
      // Buscar a tarefa atual para obter a data antiga
      const currentTask = tasks.find(task => task.id === taskId);
      const oldDate = currentTask ? currentTask.date.toISOString().split('T')[0] : null;
      
      // Usar a função moveTask do hook useTasks que atualiza o estado local
      await moveTask(taskId, newDateObj);
      
      // ✅ NOVO: Disparar evento para atualizar automaticamente o modal de relatório
      if (oldDate) {
        console.log(`🚀 Disparando evento taskMoved: ${taskId} de ${oldDate} para ${newDate}`);
        window.dispatchEvent(new CustomEvent('taskMoved', {
          detail: {
            calendarId: currentCalendarId,
            taskId: taskId,
            oldDate: oldDate,
            newDate: newDate
          }
        }));
      }
      
      // O modal de relatório se atualizará automaticamente através das props
      // já que o hook useTasks atualiza o estado local
      
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      
      // Verificar se é erro de permissão
      if (error.isPermissionError) {
        toast({
          title: "🚫 Acesso Negado",
          description: error.permissionMessage || "Você não tem permissão para mover esta tarefa. Verifique com o administrador do calendário.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Erro!",
          description: "Falha ao mover tarefa.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateCalendar = async (settings: CalendarSettings) => {
    try {
      // Se temos o ID do calendário criado, usar diretamente
      if (settings.calendarId) {
        setCurrentCalendarId(settings.calendarId);
        localStorage.setItem('selectedCalendarId', settings.calendarId.toString());
        
        // Marcar que agora temos calendários
        setHasCalendars(true);
        
        // Recarregar dados do calendário
        await loadCalendarData();
        
        // Recarregar calendários para atualizar a lista
        // Não fazer reload da página, apenas recarregar os dados
        await loadFirstAvailableCalendar();
      }
      
      toast({
        title: "✅ Calendário criado com sucesso!",
        description: `Calendário "${settings.companyName}" foi criado e selecionado automaticamente!`,
      });
    } catch (error) {
      console.error('Erro ao selecionar calendário criado:', error);
    }
  };

  const handleFilterChange = (newFilters: { contentType?: string; platform?: string; status?: string }) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  const handleAddTask = (date: Date) => {
    setSelectedDate(date);
    setShowCreateTaskModal(true);
  };

  const handleEditTask = (task: CalendarTask) => {
    setSelectedTask(task);
    setShowEditTaskModal(true);
  };

  const handleTaskCreated = (newTask: CalendarTask) => {
    toast({
      title: "✅ Tarefa criada!",
      description: `Tarefa "${newTask.title}" criada para ${newTask.date.toLocaleDateString('pt-BR')}`,
    });
    
    // O modal de relatório se atualizará automaticamente através das props
    // já que o hook useTasks atualiza o estado local e as props são passadas
  };

  // Função para buscar dados do calendário atual
  const loadCalendarData = async () => {
    try {
              const response = await apiRequest(API_ROUTES.CALENDARS.READ(currentCalendarId));
      if (response.success && response.calendar) {
        setCompanyName(response.calendar.company_name || '');
        setStartMonth(response.calendar.start_month || '');
        
        // IMPORTANTE: Atualizar currentDate apenas se não houver tarefas carregadas
        // Isso evita que o mês mude e as tarefas sumam
        if (response.calendar.start_month && tasks.length === 0) {
          const [year, month] = response.calendar.start_month.split('-');
          const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
          setCurrentDate(newDate);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do calendário:', error);
    }
  };

  // Calcular displayMonth sempre que startMonth mudar
  useEffect(() => {
    if (startMonth) {
      const [year, month] = startMonth.split('-');
      const monthString = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      });
      setDisplayMonth(monthString);
    }
  }, [startMonth]);



  // Função para carregar o primeiro calendário disponível do usuário
  const loadFirstAvailableCalendar = async () => {
    console.log('🚀 INDEX: loadFirstAvailableCalendar executando...');
    try {
      console.log('📡 INDEX: Fazendo requisição para listar calendários...');
      const response = await apiRequest(API_ROUTES.CALENDARS.LIST);
      console.log('✅ INDEX: Resposta da API para listar calendários:', response);
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('🎯 INDEX: Há calendários disponíveis!');
        // Há calendários - mostrar calendário
        setCalendars(response.data);
        setHasCalendars(true);
        setShowCalendar(true); // ATIVAR FLAG DO CALENDÁRIO
        console.log('✅ INDEX: showCalendar definido como TRUE em loadFirstAvailableCalendar');
        
        // Verificar se há um calendário salvo no localStorage
        const savedCalendarId = localStorage.getItem('selectedCalendarId');
        let calendarToSelect = response.data[0]; // Padrão: primeiro calendário
        
        if (savedCalendarId) {
          // Tentar encontrar o calendário salvo na lista
          const savedCalendar = response.data.find(c => c.id === parseInt(savedCalendarId));
          if (savedCalendar) {
            console.log('✅ INDEX: Calendário salvo encontrado na lista, mantendo seleção:', savedCalendar.company_name);
            calendarToSelect = savedCalendar;
          } else {
            console.log('⚠️ INDEX: Calendário salvo não encontrado na lista, usando primeiro disponível');
            // Limpar localStorage se o calendário salvo não existe mais
            localStorage.removeItem('selectedCalendarId');
          }
        }
        
        console.log('📅 INDEX: Calendário selecionado:', calendarToSelect.company_name);
        
        setCurrentCalendarId(calendarToSelect.id);
        setCompanyName(calendarToSelect.company_name);
        setStartMonth(calendarToSelect.start_month);
        setSelectedCalendar(calendarToSelect); // ✅ CRÍTICO: Definir o calendário completo
        localStorage.setItem('selectedCalendarId', calendarToSelect.id.toString());
        
        // Atualizar currentDate para o mês do calendário
        if (calendarToSelect.start_month) {
          const [year, month] = calendarToSelect.start_month.split('-');
          const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
          setCurrentDate(newDate);
        }
      } else {
        console.log('❌ INDEX: Nenhum calendário encontrado');
        // Nenhum calendário encontrado - mostrar estado vazio
        setCalendars([]);
        setHasCalendars(false);
        setShowCalendar(false); // DESATIVAR FLAG DO CALENDÁRIO
        setCurrentCalendarId(null);
        setCompanyName('');
        setStartMonth('');
        localStorage.removeItem('selectedCalendarId');
      }
    } catch (error) {
      console.error('❌ INDEX: Erro ao carregar primeiro calendário:', error);
      // Em caso de erro, mostrar estado vazio
      setCalendars([]);
      setHasCalendars(false);
      setCurrentCalendarId(null);
      setCompanyName('');
      setStartMonth('');
      localStorage.removeItem('selectedCalendarId');
    }
  };



  // Carregar dados iniciais quando o componente montar
  useEffect(() => {
    console.log('🚀 INDEX: useEffect inicial executando...');
    const savedCalendarId = localStorage.getItem('selectedCalendarId');
    console.log('🔍 INDEX: Calendar ID salvo:', savedCalendarId);
    
    if (savedCalendarId) {
      console.log('📂 INDEX: Carregando calendário salvo...');
      // Há calendário salvo - carregar dados completos de uma vez
      const loadSavedCalendar = async () => {
        try {
          console.log('📡 INDEX: Fazendo requisição para calendário salvo...');
          const response = await apiRequest(API_ROUTES.CALENDARS.READ(savedCalendarId));
          console.log('✅ INDEX: Resposta da API para calendário salvo:', response);
          
          if (response.success && response.data) {
            console.log('🎯 INDEX: Calendário salvo carregado com sucesso!');
            setCurrentCalendarId(parseInt(savedCalendarId));
            setHasCalendars(true);
            setShowCalendar(true); // ATIVAR FLAG DO CALENDÁRIO
            console.log('✅ INDEX: showCalendar definido como TRUE');
            setCompanyName(response.data.company_name || '');
            setStartMonth(response.data.start_month || '');
            setSelectedCalendar(response.data); // ✅ CRÍTICO: Definir o calendário completo
            
            if (response.data.start_month) {
              const [year, month] = response.data.start_month.split('-');
              const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
              setCurrentDate(newDate);
            }
          }
        } catch (error) {
          console.error('❌ INDEX: Erro ao carregar calendário salvo:', error);
          // Em caso de erro, verificar se o calendário ainda existe na lista
          console.log('🔄 INDEX: Verificando se calendário salvo ainda existe...');
          const checkCalendarExists = async () => {
            try {
              const listResponse = await apiRequest(API_ROUTES.CALENDARS.LIST);
              if (listResponse.success && listResponse.data) {
                const calendarExists = listResponse.data.find(c => c.id === parseInt(savedCalendarId));
                if (calendarExists) {
                  console.log('✅ INDEX: Calendário salvo ainda existe, carregando...');
                  // Calendário ainda existe, carregar normalmente
                  setCurrentCalendarId(parseInt(savedCalendarId));
                  setHasCalendars(true);
                  setShowCalendar(true);
                  setCompanyName(calendarExists.company_name || '');
                  setStartMonth(calendarExists.start_month || '');
                  setSelectedCalendar(calendarExists);
                  
                  if (calendarExists.start_month) {
                    const [year, month] = calendarExists.start_month.split('-');
                    const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                    setCurrentDate(newDate);
                  }
                } else {
                  console.log('❌ INDEX: Calendário salvo não existe mais, carregando primeiro disponível...');
                  // Calendário não existe mais, carregar primeiro disponível
                  loadFirstAvailableCalendar();
                }
              } else {
                console.log('❌ INDEX: Erro ao listar calendários, carregando primeiro disponível...');
                loadFirstAvailableCalendar();
              }
            } catch (listError) {
              console.error('❌ INDEX: Erro ao verificar calendários:', listError);
              loadFirstAvailableCalendar();
            }
          };
          checkCalendarExists();
        }
      };
      
      loadSavedCalendar();
    } else {
      console.log('🔄 INDEX: Nenhum calendário salvo, chamando loadFirstAvailableCalendar...');
      // Não há calendário salvo - verificar se existem calendários
      loadFirstAvailableCalendar();
    }
  }, []); // Executar apenas uma vez quando o componente montar

  // Recarregar tarefas quando o calendário mudar
  useEffect(() => {
    if (currentCalendarId) {
      // Recarregar tarefas quando o calendário selecionado mudar
      loadTasks();
    }
  }, [currentCalendarId, loadTasks]);

  // Efeito para capturar eventos de destaque de tarefas vindas do tooltip
  useEffect(() => {
    const handleHighlightTask = (event: CustomEvent) => {
      const { taskId, taskTitle, taskDate } = event.detail;
      
      // Definir a tarefa destacada
      setHighlightedTaskId(taskId);
      
      // Navegar para a data da tarefa se necessário
      if (taskDate) {
        const taskDateObj = new Date(taskDate);
        if (taskDateObj.getMonth() !== currentDate.getMonth() || taskDateObj.getFullYear() !== currentDate.getFullYear()) {
          setCurrentDate(taskDateObj);
        }
      }
      
      // Remover o destaque após 5 segundos
      setTimeout(() => {
        setHighlightedTaskId(null);
      }, 5000);
      
      // Scroll para o calendário primeiro
      setTimeout(() => {
        // Scroll para a seção do calendário
        const calendarSection = document.querySelector('.flex-1.p-6');
        if (calendarSection) {
          calendarSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
        
        // Depois procura pela tarefa específica
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

    // Adicionar listener para o evento customizado
    window.addEventListener('highlightTask', handleHighlightTask as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('highlightTask', handleHighlightTask as EventListener);
    };
  }, [currentDate]);

  // Aplicar filtros às tarefas
  // IMPORTANTE: O hook useTasks já filtra por calendário atual
  // Aqui só aplicamos filtros de conteúdo, plataforma e status
  const filteredTasks = tasks.filter(task => {
    // Filtro por tipo de conteúdo
    if (filters.contentType && filters.contentType !== 'all' && task.contentType !== filters.contentType) {
      return false;
    }
    
    // Filtro por plataforma
    if (filters.platform && filters.platform !== 'all' && (!task.platforms || !task.platforms.includes(filters.platform as Platform))) {
      return false;
    }
    
    // Filtro por status
    if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    
    return true;
  });
  


  // Lógica de renderização simplificada
  // hasCalendars = false: mostra mensagem de estado vazio
  // hasCalendars = true: mostra calendário

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <CalendarHeader 
        currentMonth={displayMonth.charAt(0).toUpperCase() + displayMonth.slice(1)}
        companyName={companyName}
        currentCalendarId={currentCalendarId}
        onCreateCalendar={() => setShowCreateModal(true)}
        onShowReports={() => setShowReportsModal(true)}
        onCalendarChange={handleCalendarChange}
        onEditCalendar={handleEditCalendar}
        onDeleteCalendar={handleDeleteCalendar}
        onDuplicateCalendar={handleDuplicateCalendar}
        onShareCalendar={handleShareCalendar}
        currentCalendar={selectedCalendar}
        onDropdownClose={handleDropdownClose}
      />
      
      <div className="flex">
        <div className="flex-1 p-6">
          {/* APENAS CALENDÁRIO - Sem tela de estado vazio */}
          {showCalendar && (
            <>

              
              <DragAndDropProvider>
                <CalendarGrid 
                  tasks={filteredTasks}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskDelete={handleTaskDelete}
                  currentDate={currentDate}
                  loading={tasksLoading}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onTaskMove={handleTaskMove}
                  highlightedTaskId={highlightedTaskId}
                />
              </DragAndDropProvider>
              
              {/* Seção de Notas */}
              <NotesSection 
                currentCalendarId={currentCalendarId}
                companyName={companyName}
                displayMonth={displayMonth}
                tasks={filteredTasks}
              />
            </>
          )}
        </div>
        
        <CalendarSidebar 
          onFilterChange={handleFilterChange}
          currentCalendarId={currentCalendarId}
          companyName={companyName}
          tasks={filteredTasks}
        />
      </div>

      <CreateCalendarModal 
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateCalendar={handleCreateCalendar}
      />

              <CreateTaskModal
          open={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          onTaskCreated={handleTaskCreated}
          selectedDate={selectedDate}
          calendarId={currentCalendarId}
          createTask={createTask}
        />

        <EditTaskModal
          open={showEditTaskModal}
          onClose={() => {
            setShowEditTaskModal(false);
            setSelectedTask(null);
          }}
          onTaskUpdated={handleTaskUpdate}
          onTaskDeleted={handleTaskDelete}
          task={selectedTask}
          updateTask={updateTask}
        />

        {selectedCalendar && (
          <EditCalendarModal
            isOpen={showEditCalendarModal}
            onClose={() => {
              setShowEditCalendarModal(false);
              setSelectedCalendar(null);
            }}
            calendar={selectedCalendar}
            onDropdownClose={handleDropdownClose}
            onCalendarUpdated={(updatedCalendar) => {
              console.log('🔄 DEBUG: onCalendarUpdated chamado com:', updatedCalendar);
              
              // Atualizar o estado local
              setCompanyName(updatedCalendar.company_name);
              setStartMonth(updatedCalendar.start_month);
              
              // Fechar modal
              setShowEditCalendarModal(false);
              // Manter o calendário selecionado para atualizar o dropdown
              console.log('✅ DEBUG: Atualizando selectedCalendar:', updatedCalendar);
              setSelectedCalendar(updatedCalendar);
              
              // IMPORTANTE: Atualizar currentDate para o novo mês
              if (updatedCalendar.start_month) {
                const [year, month] = updatedCalendar.start_month.split('-');
                const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                setCurrentDate(newDate);
                
                // ✅ NOVO: Ajustar datas das tarefas para o novo mês
                console.log('🔄 DEBUG: Ajustando datas das tarefas para o novo mês...');
                adjustTasksToNewMonth(updatedCalendar.start_month);
              }
              
              // Forçar atualização do displayMonth
              const [year, month] = updatedCalendar.start_month.split('-');
              const monthString = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('pt-BR', { 
                month: 'long', 
                year: 'numeric' 
              });
              setDisplayMonth(monthString);
              
              // Mostrar mensagem de sucesso com informação sobre ajuste automático das tarefas
              toast({
                title: "✅ Calendário atualizado!",
                description: `Calendário "${updatedCalendar.company_name}" atualizado. As tarefas foram automaticamente ajustadas para o novo mês de início (${monthString}).`,
              });
              
              // CRÍTICO: Recarregar as tarefas após atualização no banco
              // Aguardar um pouco para o banco processar, depois recarregar
              setTimeout(() => {
                loadTasks();
              }, 1000); // Aumentei para 1 segundo para dar tempo do banco processar
            }}
          />
        )}

      <ShareCalendarModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        calendarId={selectedCalendar?.id || 0}
        calendarName={selectedCalendar?.company_name || ''}
      />

      <ReportsModal 
        key={`reports-${currentCalendarId}-${tasks.length}`}
        open={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        tasks={tasks}
        currentCalendarId={currentCalendarId}
        companyName={companyName}
        calendarMonth={displayMonth}
      />
    </div>
  );
};

export default Index;
