import { CalendarTask, ContentType, Platform, Status } from "@/types/calendar";

export interface TaskFilters {
  contentType?: string;
  platform?: string;
  status?: string;
}

export function filterTasks(tasks: CalendarTask[], filters: TaskFilters): CalendarTask[] {
  return tasks.filter(task => {
    // Filtro por tipo de conteúdo
    if (filters.contentType && filters.contentType !== 'all') {
      if (task.contentType !== filters.contentType) {
        return false;
      }
    }

    // Filtro por plataforma - agora funciona com múltiplas plataformas
    if (filters.platform && filters.platform !== 'all') {
      if (!task.platforms || !task.platforms.includes(filters.platform as Platform)) {
        return false;
      }
    }

    // Filtro por status
    if (filters.status && filters.status !== 'all') {
      if (task.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
}

// Função para verificar se uma tarefa corresponde aos filtros
export function taskMatchesFilters(task: CalendarTask, filters: TaskFilters): boolean {
  // Filtro por tipo de conteúdo
  if (filters.contentType && filters.contentType !== 'all') {
    if (task.contentType !== filters.contentType) {
      return false;
    }
  }

  // Filtro por plataforma - agora funciona com múltiplas plataformas
  if (filters.platform && filters.platform !== 'all') {
    if (!task.platforms || !task.platforms.includes(filters.platform as Platform)) {
      return false;
    }
  }

  // Filtro por status
  if (filters.status && filters.status !== 'all') {
    if (task.status !== filters.status) {
      return false;
    }
  }

  return true;
}
