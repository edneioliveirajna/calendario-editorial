import { useState, useEffect, useCallback } from 'react';
import { CalendarTask } from '@/types/calendar';
import { apiRequest, API_ROUTES } from '@/config/api';
import { getApiBaseUrl } from '@/config/environment';
import { useToast } from '@/hooks/use-toast';

export const useTasks = (calendarId: number = 1) => {
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar tarefas do backend
  const loadTasks = useCallback(async () => {
    console.log('🔄 useTasks: loadTasks chamado para calendarId:', calendarId);
    setLoading(true);
    setError(null);
    
    try {
      // Usar o endpoint correto para buscar tarefas por calendário
      const url = `${API_ROUTES.TASKS.LIST}?calendar_id=${calendarId}`;
      console.log('🔄 useTasks: Fazendo requisição para:', url);
      
      const response = await apiRequest(url);
      console.log('🔄 useTasks: Resposta recebida:', response);
      
      if (response.success) {
        // Converter datas do backend para objetos Date
        const tasksWithDates = (response.data || []).map((task: any) => {
          // Garantir que a data seja interpretada como local, não UTC
          let localDate: Date;
          
          if (task.date) {
            const [year, month, day] = task.date.split('-');
            localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else if (task.scheduled_date) {
            const [year, month, day] = task.scheduled_date.split('-');
            localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            localDate = new Date(); // Data atual como fallback
          }
          
          // Mapear campos do backend para o formato do frontend
          const mappedTask = {
            ...task,
            contentType: task.content_type || task.contentType,
            platforms: task.platforms || [task.platform] || [],
            status: task.status,
            date: localDate,
            id: task.id.toString(),
            notes_count: task.notes_count || 0,
            has_notes: task.has_notes || false,
            // Usar permissões que vêm do backend
            calendarPermissions: {
              can_edit: task.can_edit || false,
              can_delete: task.can_delete || false,
              can_share: task.can_share || false
            },
            isCalendarOwner: task.is_calendar_owner || false
          };
          
          return mappedTask;
        });
        console.log('🔄 useTasks: Tarefas processadas:', tasksWithDates.length);
        console.log('🔄 useTasks: Primeiras 3 tarefas:', tasksWithDates.slice(0, 3).map(t => ({ id: t.id, title: t.title, date: t.date.toISOString().split('T')[0] })));
        setTasks(tasksWithDates);
      } else {
        console.log('❌ useTasks: Erro na resposta:', response.error);
        setError(response.error || 'Erro ao carregar tarefas');
      }
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      setError('Falha ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [calendarId]);

  // Criar nova tarefa
  const createTask = useCallback(async (taskData: Omit<CalendarTask, 'id'>) => {
    console.log('🚀 TASKS DEBUG: Iniciando criação de tarefa...');
    console.log('📝 TASKS DEBUG: Dados recebidos:', taskData);
    console.log('📅 TASKS DEBUG: Calendar ID:', calendarId);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 TASKS DEBUG: Fazendo requisição para API...');
      console.log('🌐 TASKS DEBUG: URL da requisição:', API_ROUTES.TASKS.CREATE);
      console.log('📝 TASKS DEBUG: Dados sendo enviados:', {
        calendar_id: calendarId,
        title: taskData.title,
        content_type: taskData.contentType,
        platforms: taskData.platforms,
        status: taskData.status,
        date: `${taskData.date.getFullYear()}-${String(taskData.date.getMonth() + 1).padStart(2, '0')}-${String(taskData.date.getDate()).padStart(2, '0')}`,
        description: taskData.description || ''
      });
      
      const response = await apiRequest(API_ROUTES.TASKS.CREATE, {
        method: 'POST',
        body: JSON.stringify({
          calendar_id: calendarId,
          title: taskData.title,
          content_type: taskData.contentType,
          platforms: taskData.platforms,
          status: taskData.status,
          date: `${taskData.date.getFullYear()}-${String(taskData.date.getMonth() + 1).padStart(2, '0')}-${String(taskData.date.getDate()).padStart(2, '0')}`,
          description: taskData.description || ''
        })
      });
      
      console.log('✅ TASKS DEBUG: Resposta da API recebida:', response);
      console.log('🔍 TASKS DEBUG: Tipo da resposta:', typeof response);
      console.log('🔍 TASKS DEBUG: Chaves da resposta:', Object.keys(response));
      
      if (response.success) {
        console.log('🎯 TASKS DEBUG: Resposta de sucesso!');
        console.log('🔍 TASKS DEBUG: response.data:', response.data);
        console.log('🔍 TASKS DEBUG: response.data.id:', response.data?.id);
        console.log('🔍 TASKS DEBUG: response.data.id.toString():', response.data?.id?.toString());
        
        const newTask: CalendarTask = {
          id: response.data.id.toString(),
          title: taskData.title,
          contentType: taskData.contentType,
          platforms: taskData.platforms,
          status: taskData.status,
          date: taskData.date, // Manter o Date original
          description: taskData.description || '',
          notes_count: 0,
          has_notes: false
        };
        
        console.log('📝 TASKS DEBUG: Nova tarefa criada:', newTask);
        setTasks(prev => [...prev, newTask]);
        
        // Não mostrar toast aqui - será mostrado na página Index.tsx
        
        return newTask;
      } else {
        console.log('❌ TASKS DEBUG: Resposta de erro:', response);
        throw new Error(response.error || 'Erro ao criar tarefa');
      }
    } catch (err) {
      console.error('❌ TASKS DEBUG: Erro capturado:', err);
      setError('Falha ao criar tarefa');
      
      toast({
        title: "❌ Erro!",
        description: "Falha ao criar tarefa. Tente novamente.",
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [calendarId, toast]);

  // Atualizar tarefa
  const updateTask = useCallback(async (taskId: string, updates: Partial<CalendarTask>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Preparar dados para envio
      const updateData: any = { id: taskId };
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.contentType !== undefined) updateData.content_type = updates.contentType;
      if (updates.platforms !== undefined) updateData.platforms = updates.platforms;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.date !== undefined) {
        updateData.date = `${updates.date.getFullYear()}-${String(updates.date.getMonth() + 1).padStart(2, '0')}-${String(updates.date.getDate()).padStart(2, '0')}`;
      }
      
        const response = await apiRequest(`${API_ROUTES.TASKS.UPDATE(taskId)}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        });
        
        if (response.success) {
                  setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ));
        
        // Não mostrar toast aqui - será mostrado na página Index.tsx
      } else {
        throw new Error(response.error || 'Erro ao atualizar tarefa');
      }
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      setError('Falha ao atualizar tarefa');
      
      // Verificar se é erro de permissão
      if (err.isPermissionError) {
        toast({
          title: "🚫 Acesso Negado",
          description: err.permissionMessage || "Você não tem permissão para realizar essa ação. Verifique com o administrador do calendário.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Erro!",
          description: "Falha ao atualizar tarefa. Tente novamente.",
          variant: "destructive",
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Deletar tarefa
  const deleteTask = useCallback(async (taskId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Primeiro, excluir a tarefa
        const response = await apiRequest(`${API_ROUTES.TASKS.DELETE(taskId)}`, {
          method: 'DELETE'
        });
        
        if (response.success) {
          // Depois, excluir todas as notas associadas a esta tarefa
        try {
          const notesResponse = await apiRequest(`${getApiBaseUrl()}/notes?task_id=${taskId}`, {
            method: 'GET'
          });
          
          if (notesResponse.success && notesResponse.notes) {
            // Excluir cada nota associada
            for (const note of notesResponse.notes) {
              await apiRequest(`${getApiBaseUrl()}/notes/${note.id}`, {
                method: 'DELETE'
              });
            }
            
            console.log(`🗑️ ${notesResponse.notes.length} nota(s) associada(s) excluída(s) junto com a tarefa`);
          }
        } catch (notesError) {
          // Se falhar ao excluir notas, apenas logar o erro mas não falhar a exclusão da tarefa
          console.warn('Aviso: Não foi possível excluir algumas notas associadas:', notesError);
        }
        
        setTasks(prev => prev.filter(task => task.id !== taskId));
        
        // Não mostrar toast aqui - será mostrado na página Index.tsx
      } else {
        throw new Error(response.error || 'Erro ao deletar tarefa');
      }
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err);
      setError('Falha ao deletar tarefa');
      
      // Verificar se é erro de permissão
      if (err.isPermissionError) {
        toast({
          title: "🚫 Acesso Negado",
          description: err.permissionMessage || "Você não tem permissão para realizar essa ação. Verifique com o administrador do calendário.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Erro!",
          description: "Falha ao deletar tarefa. Tente novamente.",
          variant: "destructive",
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Mover tarefa para nova data
  const moveTask = useCallback(async (taskId: string, newDate: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 TASKS MOVE DEBUG: Iniciando movimentação da tarefa:', taskId, 'para data:', newDate);
      
      const formattedDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
      
      console.log('🔄 TASKS MOVE DEBUG: Data formatada:', formattedDate);
      console.log('🔄 TASKS MOVE DEBUG: URL da requisição:', `/tasks/${taskId}/move`);
      
      const response = await apiRequest(`/tasks/${taskId}/move`, {
        method: 'PUT',
        body: JSON.stringify({ new_date: formattedDate })
      });
      
      console.log('✅ TASKS MOVE DEBUG: Resposta da API:', response);
      
      if (response.success) {
        // Atualizar a tarefa no estado local
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, date: newDate } : task
        ));
        
        // Formatar a data para exibição em português
        const formattedDisplayDate = newDate.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long'
        });
        
        // Não mostrar toast aqui - será mostrado na página Index.tsx se necessário
        
        return response.data;
      } else {
        throw new Error(response.error || 'Erro ao mover tarefa');
      }
    } catch (err) {
      console.error('❌ TASKS MOVE DEBUG: Erro ao mover tarefa:', err);
      setError('Falha ao mover tarefa');
      
      // Verificar se é erro de permissão
      if (err.isPermissionError) {
        toast({
          title: "🚫 Acesso Negado",
          description: err.permissionMessage || "Você não tem permissão para realizar essa ação. Verifique com o administrador do calendário.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Erro!",
          description: "Falha ao mover tarefa. Tente novamente.",
          variant: "destructive",
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar tarefas quando o componente montar ou calendarId mudar
  useEffect(() => {
    if (calendarId) {
      loadTasks();
    }
  }, [calendarId, loadTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    loadTasks,
    setTasks
  };
}; 