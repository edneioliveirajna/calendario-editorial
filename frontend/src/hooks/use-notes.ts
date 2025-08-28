import { useState, useCallback } from 'react';
import { apiRequest } from '../config/api';
import { getApiBaseUrl } from '../config/environment';
import { useToast } from './use-toast';

export interface Note {
  id: number;
  title: string;
  content: string;
  calendar_id?: number;
  task_id?: number;
  date?: string;
  is_general: boolean;
  created_at: string;
  updated_at: string;
  calendar_name?: string;
  task_title?: string;
  // Permissões do calendário compartilhado
  can_access?: boolean;
  is_calendar_owner?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
  can_share?: boolean;
}

export interface CreateNoteData {
  title: string;
  content: string;
  calendar_id?: number;
  task_id?: number;
  date?: string;
  is_general?: boolean;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  calendar_id?: number;
  task_id?: number;
  date?: string;
  is_general?: boolean;
}

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar todas as notas do usuário
  const fetchNotes = useCallback(async (filters?: {
    calendar_id?: number;
    task_id?: number;
    is_general?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      if (filters?.calendar_id) queryParams.append('calendar_id', filters.calendar_id.toString());
      if (filters?.task_id) queryParams.append('task_id', filters.task_id.toString());
      if (filters?.is_general !== undefined) queryParams.append('is_general', filters.is_general.toString());

      const response = await apiRequest(`${getApiBaseUrl()}/notes?${queryParams.toString()}`);
      
      if (response.success) {
        setNotes(response.notes);
        return response.notes;
      } else {
        throw new Error(response.message || 'Erro ao buscar notas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "❌ Erro",
        description: `Não foi possível buscar as notas: ${errorMessage}`,
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar notas gerais (não associadas a tarefas)
  const fetchGeneralNotes = useCallback(async () => {
    return fetchNotes({ is_general: true });
  }, [fetchNotes]);

  // Buscar notas de um calendário específico
  const fetchCalendarNotes = useCallback(async (calendarId: number) => {
    return fetchNotes({ calendar_id: calendarId });
  }, [fetchNotes]);

  // Buscar notas de uma tarefa específica
  const fetchTaskNotes = useCallback(async (taskId: number) => {
    return fetchNotes({ task_id: taskId });
  }, [fetchNotes]);

  // Criar nova nota
  const createNote = useCallback(async (noteData: CreateNoteData): Promise<Note | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(`${getApiBaseUrl()}/notes`, {
        method: 'POST',
        body: JSON.stringify(noteData),
      });
      
      if (response.success) {
        const newNote = response.note;
        setNotes(prev => [newNote, ...prev]);
        
        toast({
          title: "✅ Sucesso!",
          description: "Nota criada com sucesso!",
        });
        
        return newNote;
      } else {
        throw new Error(response.message || 'Erro ao criar nota');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "❌ Erro",
        description: `Não foi possível criar a nota: ${errorMessage}`,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Atualizar nota existente
  const updateNote = useCallback(async (noteId: number, updateData: UpdateNoteData): Promise<Note | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(`${getApiBaseUrl()}/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      if (response.success) {
        const updatedNote = response.note;
        setNotes(prev => prev.map(note => 
          note.id === noteId ? updatedNote : note
        ));
        
        toast({
          title: "✅ Sucesso!",
          description: "Nota atualizada com sucesso!",
        });
        
        return updatedNote;
      } else {
        throw new Error(response.message || 'Erro ao atualizar nota');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "❌ Erro",
        description: `Não foi possível atualizar a nota: ${errorMessage}`,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Excluir nota
  const deleteNote = useCallback(async (noteId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(`${getApiBaseUrl()}/notes/${noteId}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        
        toast({
          title: "✅ Sucesso!",
          description: "Nota excluída com sucesso!",
        });
        
        return true;
      } else {
        throw new Error(response.message || 'Erro ao excluir nota');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "❌ Erro",
        description: `Não foi possível excluir a nota: ${errorMessage}`,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Criar nota geral (sem associação)
  const createGeneralNote = useCallback(async (title: string, content: string, calendarId?: number): Promise<Note | null> => {
    return createNote({
      title,
      content,
      calendar_id: calendarId,
      is_general: true,
    });
  }, [createNote]);

  // Criar nota associada a tarefa
  const createTaskNote = useCallback(async (title: string, content: string, taskId: number, calendarId: number): Promise<Note | null> => {
    return createNote({
      title,
      content,
      task_id: taskId,
      calendar_id: calendarId,
      is_general: false,
    });
  }, [createNote]);

  // Criar nota associada a calendário
  const createCalendarNote = useCallback(async (title: string, content: string, calendarId: number): Promise<Note | null> => {
    return createNote({
      title,
      content,
      calendar_id: calendarId,
      is_general: false,
    });
  }, [createNote]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    fetchGeneralNotes,
    fetchCalendarNotes,
    fetchTaskNotes,
    createNote,
    createGeneralNote,
    createTaskNote,
    createCalendarNote,
    updateNote,
    deleteNote,
  };
}; 