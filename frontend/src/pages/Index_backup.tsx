import { useEffect, useState, useCallback } from "react";
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
import { DragAndDropProvider } from "@/contexts/DragAndDropContext";
import { CalendarTask, CalendarSettings, Platform } from "@/types/calendar";
import { useTasks } from "@/hooks/use-tasks";
import { useNotes } from "@/hooks/use-notes";
import { apiRequest, API_ENDPOINTS } from "@/config/api";
import { getApiBaseUrl } from "@/config/environment";
import { toast } from "@/hooks/use-toast";

// Tipo para calendário
interface Calendar {
  id: number;
  name: string;
  company_name: string;
  start_month: string;
  description?: string;
  color?: string;
  unique_url?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: number;
  is_owner?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
  can_share?: boolean;
}

export default function Index() {
  // Estados para calendários
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);
  const [currentCalendarId, setCurrentCalendarId] = useState<number | null>(null);
  const [hasCalendars, setHasCalendars] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Estados para modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditCalendarModal, setShowEditCalendarModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);

  // Estados para tarefas
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<number | null>(null);

  // Estados para filtros
  const [filters, setFilters] = useState({
    contentType: 'all',
    platform: 'all',
    status: 'all'
  });

  // Estados para calendário
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [companyName, setCompanyName] = useState<string>('');
  const [startMonth, setStartMonth] = useState<string>('');

  // Hook para tarefas
  const {
    tasks,
    loading: tasksLoading,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    loadTasks
  } = useTasks();

  // Hook para notas
  const {
    notes: notesData,
    loading: notesLoading,
    fetchGeneralNotes
  } = useNotes();

  // Calcular displayMonth sempre que startMonth mudar
  const [displayMonth, setDisplayMonth] = useState<string>('agosto 2025');

  const handleTaskUpdate = async (updatedTask: CalendarTask) => {
    try {
      await updateTask(updatedTask.id, updatedTask);
      
      // ✅ NOVO: Disparar evento para atualizar automaticamente o modal de relatório
      console.log(`🚀 Disparando evento taskUpdated: ${updatedTask.id}`);
      window.dispatchEvent(new CustomEvent('taskUpdated', {
        detail: {
          calendarId: currentCalendarId,
          taskId: updatedTask.id,
          type: 'updated',
          updatedTask: updatedTask
        }
      }));
      
      // Recarregar tarefas para atualizar o relatório automaticamente
      await loadTasks();
      
      toast({
        title: "✅ Tarefa atualizada!",
        description: `Tarefa "${updatedTask.title}" foi atualizada com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "❌ Erro!",
        description: "Falha ao atualizar tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      
      // Recarregar tarefas para atualizar o relatório automaticamente
      await loadTasks();
      
      // Recarregar notas para remover notas associadas que foram excluídas automaticamente
      if (currentCalendarId) {
        setTimeout(async () => {
          window.dispatchEvent(new CustomEvent('reloadNotes', {
            detail: { calendarId: currentCalendarId }
          }));
        }, 500);
      }
      
      toast({
        title: "✅ Tarefa excluída!",
        description: "Tarefa e notas associadas foram excluídas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      toast({
        title: "❌ Erro!",
        description: "Falha ao excluir tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para mover tarefa entre dias
  const handleTaskMove = async (taskId: string, newDate: string) => {
    try {
      const [year, month, day] = newDate.split('-').map(Number);
      const newDateObj = new Date(year, month - 1, day);
      
      // Buscar a tarefa atual para obter a data antiga
      const currentTask = tasks.find(task => task.id === taskId);
      const oldDate = currentTask ? currentTask.date.toISOString().split('T')[0] : null;
      
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
      
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      toast({
        title: "❌ Erro!",
        description: "Falha ao mover tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCalendar = async (settings: CalendarSettings) => {
    try {
      if (settings.calendarId) {
        setCurrentCalendarId(settings.calendarId);
        localStorage.setItem('selectedCalendarId', settings.calendarId.toString());
        setHasCalendars(true);
        await loadCalendarData();
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
  };

  // Função para buscar dados do calendário atual
  const loadCalendarData = async () => {
    try {
      const response = await apiRequest(`${API_ENDPOINTS.CALENDARS.READ}/${currentCalendarId}`);
      if (response.success && response.calendar) {
        setCompanyName(response.calendar.company_name || '');
        setStartMonth(response.calendar.start_month || '');
        
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

  // Função para carregar calendários
  const loadCalendars = useCallback(async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.CALENDARS.LIST);
      if (response.success && response.calendars) {
        setCalendars(response.calendars);
        setHasCalendars(response.calendars.length > 0);
      }
    } catch (error) {
      console.error('Erro ao carregar calendários:', error);
    }
  }, []);

  // Função para carregar primeiro calendário disponível
  const loadFirstAvailableCalendar = useCallback(async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.CALENDARS.LIST);
      if (response.success && response.calendars && response.calendars.length > 0) {
        const firstCalendar = response.calendars[0];
        setCurrentCalendarId(firstCalendar.id);
        setHasCalendars(true);
        setShowCalendar(true);
        setCompanyName(firstCalendar.company_name);
        setStartMonth(firstCalendar.start_month);
        setSelectedCalendar(firstCalendar);
        localStorage.setItem('selectedCalendarId', firstCalendar.id.toString());
        
        if (firstCalendar.start_month) {
          const [year, month] = firstCalendar.start_month.split('-');
          const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
          setCurrentDate(newDate);
        }
      } else {
        setHasCalendars(false);
        setShowCalendar(false);
        setCurrentCalendarId(null);
        setCompanyName('');
        setStartMonth('');
        localStorage.removeItem('selectedCalendarId');
      }
    } catch (error) {
      console.error('Erro ao carregar primeiro calendário:', error);
      setCalendars([]);
      setHasCalendars(false);
      setCurrentCalendarId(null);
      setCompanyName('');
      setStartMonth('');
      localStorage.removeItem('selectedCalendarId');
    }
  }, []);

  // Carregar dados iniciais quando o componente montar
  useEffect(() => {
    const savedCalendarId = localStorage.getItem('selectedCalendarId');
    
    if (savedCalendarId) {
      const loadSavedCalendar = async () => {
        try {
          const response = await apiRequest(`${API_ENDPOINTS.CALENDARS.READ}/${savedCalendarId}`);
          if (response.success && response.calendar) {
            setCurrentCalendarId(parseInt(savedCalendarId));
            setHasCalendars(true);
            setShowCalendar(true);
            setCompanyName(response.calendar.company_name || '');
            setStartMonth(response.calendar.start_month || '');
            setSelectedCalendar(response.calendar);
            
            if (response.calendar.start_month) {
              const [year, month] = response.calendar.start_month.split('-');
              const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
              setCurrentDate(newDate);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar calendário salvo:', error);
          loadFirstAvailableCalendar();
        }
      };
      
      loadSavedCalendar();
    } else {
      loadFirstAvailableCalendar();
    }
  }, [loadFirstAvailableCalendar]);

  // Recarregar tarefas quando o calendário mudar
  useEffect(() => {
    if (currentCalendarId) {
      loadTasks();
    }
  }, [currentCalendarId, loadTasks]);

  // Efeito para capturar eventos de destaque de tarefas vindas do tooltip
  useEffect(() => {
    const handleHighlightTask = (event: CustomEvent) => {
      const { taskId, taskTitle, taskDate } = event.detail;
      
      setHighlightedTaskId(taskId);
      
      if (taskDate) {
        const taskDateObj = new Date(taskDate);
        if (taskDateObj.getMonth() !== currentDate.getMonth() || taskDateObj.getFullYear() !== currentDate.getFullYear()) {
          setCurrentDate(taskDateObj);
        }
      }
      
      setTimeout(() => {
        setHighlightedTaskId(null);
      }, 5000);
      
      setTimeout(() => {
        const calendarSection = document.querySelector('.flex-1.p-6');
        if (calendarSection) {
          calendarSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
        
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

  // Aplicar filtros às tarefas
  const filteredTasks = tasks.filter(task => {
    if (filters.contentType && filters.contentType !== 'all' && task.contentType !== filters.contentType) {
      return false;
    }
    
    if (filters.platform && filters.platform !== 'all' && (!task.platforms || !task.platforms.includes(filters.platform as Platform))) {
      return false;
    }
    
    if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    
    return true;
  });

  // Funções para gerenciar calendários
  const handleCalendarChange = (calendarId: number) => {
    setCurrentCalendarId(calendarId);
    const calendar = calendars.find(c => c.id === calendarId);
    if (calendar) {
      setSelectedCalendar(calendar);
      setCompanyName(calendar.company_name);
      setStartMonth(calendar.start_month);
      localStorage.setItem('selectedCalendarId', calendarId.toString());
    }
  };

  const handleEditCalendar = (calendar: Calendar) => {
    setSelectedCalendar(calendar);
    setShowEditCalendarModal(true);
  };

  const handleDeleteCalendar = async (calendarId: number) => {
    try {
      await apiRequest(`${API_ENDPOINTS.CALENDARS.DELETE}/${calendarId}`, {
        method: 'DELETE'
      });
      
      await loadCalendars();
      
      if (currentCalendarId === calendarId) {
        await loadFirstAvailableCalendar();
      }
      
      toast({
        title: "✅ Calendário excluído!",
        description: "Calendário foi excluído com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir calendário:', error);
      toast({
        title: "❌ Erro!",
        description: "Falha ao excluir calendário.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateCalendar = async (calendar: Calendar) => {
    try {
      const duplicateData = {
        name: `${calendar.name} (Cópia)`,
        company_name: `${calendar.company_name} (Cópia)`,
        start_month: calendar.start_month,
        description: calendar.description,
        color: calendar.color
      };

      const response = await apiRequest(API_ENDPOINTS.CALENDARS.CREATE, {
        method: 'POST',
        body: JSON.stringify(duplicateData)
      });

      if (response.success && response.calendar) {
        const newCalendar = response.calendar;
        
        // Duplicar tarefas
        const tasksResponse = await apiRequest(`${getApiBaseUrl()}/tasks?calendar_id=${calendar.id}`);
        
        if (tasksResponse.success && tasksResponse.tasks) {
          console.log('   Total de tarefas para duplicar:', tasksResponse.tasks.length);
          
          for (const task of tasksResponse.tasks) {
            const taskData = {
              calendar_id: newCalendar.id,
              title: task.title,
              description: task.description,
              content_type: task.contentType,
              platforms: task.platforms,
              status: task.status,
              date: task.date.toISOString().split('T')[0]
            };
            
            await apiRequest(`${getApiBaseUrl()}/tasks`, {
              method: 'POST',
              body: JSON.stringify(taskData)
            });
          }
        }

        // Duplicar notas
        const notesResponse = await apiRequest(`${getApiBaseUrl()}/notes?calendar_id=${calendar.id}`);
        
        if (notesResponse.success && notesResponse.notes) {
          for (const note of notesResponse.notes) {
            const noteData = {
              calendar_id: newCalendar.id,
              title: note.title,
              content: note.content,
              is_general: note.is_general,
              date: note.date ? new Date(note.date).toISOString().split('T')[0] : null
            };
            
            await apiRequest(`${getApiBaseUrl()}/notes`, {
              method: 'POST',
              body: JSON.stringify(noteData)
            });
          }
        }

        await loadCalendars();
        
        toast({
          title: "✅ Calendário duplicado!",
          description: `Calendário "${calendar.company_name}" foi duplicado com sucesso!`,
        });
      }
    } catch (error) {
      console.error('Erro ao duplicar calendário:', error);
      toast({
        title: "❌ Erro!",
        description: "Falha ao duplicar calendário.",
        variant: "destructive",
      });
    }
  };

  const handleShareCalendar = (calendar: Calendar) => {
    setSelectedCalendar(calendar);
    setShowShareModal(true);
  };

  const handleDropdownClose = () => {
    // Disparar evento para recarregar as notas no NotesSection
    window.dispatchEvent(new CustomEvent('reloadNotes', {
      detail: { calendarId: currentCalendarId }
    }));
  };

  // Carregar calendários na inicialização
  useEffect(() => {
    loadCalendars();
  }, [loadCalendars]);

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
              
              <NotesSection 
                currentCalendarId={currentCalendarId}
                companyName={companyName}
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
            
            setCompanyName(updatedCalendar.company_name);
            setStartMonth(updatedCalendar.start_month);
            
            setShowEditCalendarModal(false);
            console.log('✅ DEBUG: Atualizando selectedCalendar:', updatedCalendar);
            setSelectedCalendar(updatedCalendar);
            
            if (updatedCalendar.start_month) {
              const [year, month] = updatedCalendar.start_month.split('-');
              const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
              setCurrentDate(newDate);
            }
            
            const [year, month] = updatedCalendar.start_month.split('-');
            const monthString = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            });
            setDisplayMonth(monthString);
            
            toast({
              title: "✅ Calendário atualizado!",
              description: `Calendário "${updatedCalendar.company_name}" atualizado. As tarefas foram automaticamente ajustadas para o novo mês de início (${monthString}).`,
            });
            
            setTimeout(() => {
              loadTasks();
            }, 1000);
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
}