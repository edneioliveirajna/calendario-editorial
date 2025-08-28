import { CalendarTask } from "@/types/calendar";
import { CalendarDay } from "./CalendarDay";

interface CalendarGridProps {
  tasks: CalendarTask[];
  onTaskUpdate: (task: CalendarTask) => void;
  onTaskDelete: (taskId: string) => void;
  currentDate: Date;
  loading?: boolean;
  onAddTask?: (date: Date) => void;
  onEditTask?: (task: CalendarTask) => void;
  onTaskMove?: (taskId: string, newDate: string) => void;
  highlightedTaskId?: number | null;
}

export const CalendarGrid = ({ tasks, onTaskUpdate, onTaskDelete, currentDate, loading = false, onAddTask, onEditTask, onTaskMove, highlightedTaskId }: CalendarGridProps) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    
    // IMPORTANTE: Mostrar tarefas APENAS do mês atual do calendário
    // Filtrar tarefas por data específica E por mês
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const tasksForDate = tasks.filter(task => {
      // Verificar se a tarefa é da data específica
      const sameDate = task.date.toDateString() === date.toDateString();
      
      // Verificar se a tarefa é do mês atual do calendário
      const sameMonth = task.date.getMonth() === currentMonth;
      const sameYear = task.date.getFullYear() === currentYear;
      
      return sameDate && sameMonth && sameYear;
    });
    
    return tasksForDate;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date: Date | null) => {
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const days = getDaysInMonth(currentDate);
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header with weekdays */}
      <div className="grid grid-cols-7 bg-muted">
        {weekdays.map((day) => (
          <div key={day} className="p-2 text-center font-medium text-muted-foreground border-r border-border last:border-r-0 text-sm">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 auto-rows-fr gap-0">
        {days.map((date, index) => (
          <CalendarDay
            key={index}
            date={date}
            tasks={getTasksForDate(date)}
            isToday={isToday(date)}
            isWeekend={isWeekend(date)}
            highlightedTaskId={highlightedTaskId}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onTaskMove={onTaskMove}
          />
        ))}
      </div>
      
      {/* Indicador de loading */}
      {loading && (
        <div className="p-8 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Carregando tarefas...
          </div>
        </div>
      )}
      

    </div>
  );
};