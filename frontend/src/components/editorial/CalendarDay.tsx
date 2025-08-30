import { CalendarTask, ContentType } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TasksDropdown } from "./TasksDropdown";
import { Video, Image, FileText, Megaphone, Zap } from "lucide-react";
import { useDragAndDrop } from "@/contexts/DragAndDropContext";

interface CalendarDayProps {
  date: Date | null;
  tasks: CalendarTask[];
  isToday: boolean;
  isWeekend: boolean;
  highlightedTaskId?: number | null;
  onTaskUpdate: (task: CalendarTask) => void;
  onTaskDelete: (taskId: string) => void;
  onAddTask?: (date: Date) => void;
  onEditTask?: (task: CalendarTask) => void;
  onTaskMove?: (taskId: string, newDate: string) => void;
}

const getContentTypeColor = (type: ContentType) => {
  const colors = {
    video: 'bg-content-video/20 text-content-video border-content-video/30',
    image: 'bg-content-image/20 text-content-image border-content-image/30',
    text: 'bg-content-text/20 text-content-text border-content-text/30',
    campaign: 'bg-content-campaign/20 text-content-campaign border-content-campaign/30',
    ad: 'bg-content-ad/20 text-content-ad border-content-ad/30',
  };
  return colors[type];
};

const getContentTypeIcon = (type: ContentType) => {
  const icons = {
    video: <Video className="h-4 w-4 text-content-video" />,
    image: <Image className="h-4 w-4 text-content-image" />,
    text: <FileText className="h-4 w-4 text-content-text" />,
    campaign: <Megaphone className="h-4 w-4 text-content-campaign" />,
    ad: <Zap className="h-4 w-4 text-content-ad" />,
  };
  return icons[type];
};

export const CalendarDay = ({ 
  date, 
  tasks, 
  isToday, 
  isWeekend, 
  highlightedTaskId,
  onTaskUpdate, 
  onTaskDelete,
  onAddTask,
  onEditTask,
  onTaskMove
}: CalendarDayProps) => {
  const { dragState, canDrop, startDrag, endDrag } = useDragAndDrop();
  const dateString = date ? date.toISOString().split('T')[0] : '';
  const isDropTarget = canDrop(dateString);
  


  if (!date) {
    return <div className="h-32 bg-muted/50 border-r border-b border-border"></div>;
  }

  return (
    <div 
      className={cn(
        "h-32 p-2 border-r border-b border-border transition-colors relative group flex flex-col calendar-day",
        isToday && "bg-calendar-today",
        isWeekend && "bg-calendar-weekend",
        tasks.length === 0 ? "cursor-pointer hover:bg-muted/50" : "cursor-default",
        isDropTarget && "bg-blue-50 border-2 border-blue-300 border-dashed scale-105 transition-transform duration-200"
      )}
      data-date={dateString}
      onClick={(e) => {
        // Se um modal acabou de fechar, absorve o primeiro clique
        if (document.body.classList.contains('modal-just-closed')) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        
        // Comportamento normal: adicionar tarefa se não há tarefas
        if (tasks.length === 0) {
          onAddTask?.(date);
        }
      }}
      onDragOver={(e) => {
        if (canDrop(dateString)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      }}
      onDrop={(e) => {
        if (canDrop(dateString) && onTaskMove && dragState.draggedTask) {
          e.preventDefault();
          
          // Executar movimentação
          onTaskMove(dragState.draggedTask.id, dateString);
          
          // IMPORTANTE: Limpar estado do drag após movimentação
          endDrag();
        }
      }}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={cn(
          "text-xs font-medium",
          isToday && "text-marketing-primary font-bold"
        )}>
          {date.getDate()}
        </span>
        
        {/* Botão de adicionar tarefa - só mostrar quando há tarefas */}
        {onAddTask && tasks.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddTask(date);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 bg-marketing-primary hover:bg-marketing-primary/90 text-white rounded-full flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
            title="Adicionar tarefa"
          >
            +
          </button>
        )}
      </div>
      
      <div className="space-y-1.5 overflow-hidden flex-1">
        {tasks.slice(0, 2).map((task) => {
          // Debug: log para verificar contentType
          console.log('🎨 Renderizando tarefa:', {
            id: task.id,
            title: task.title,
            contentType: task.contentType,
            colors: getContentTypeColor(task.contentType)
          });
          
          const isBeingDragged = dragState.isDragging && dragState.draggedTask?.id === task.id;
          
          return (
            <div key={task.id} className="group/task relative" data-task-id={task.id}>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-2 py-1 h-6 truncate w-full justify-start cursor-grab hover:cursor-grabbing hover:bg-muted/80 transition-all duration-200 relative",
                  getContentTypeColor(task.contentType),
                  isBeingDragged && "opacity-50 scale-95 shadow-lg",
                  // Destaque especial para tarefas vindas do tooltip
                  highlightedTaskId === parseInt(task.id) && "highlighted-task"
                )}
                onClick={() => onEditTask?.(task)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', task.id);
                  e.dataTransfer.setData('application/json', JSON.stringify(task));
                  startDrag(task, dateString);
                }}
                onDragEnd={(e) => {
                  endDrag();
                }}
              >
                              <div className="flex items-center gap-2 w-full">
                {/* Indicador de status integrado */}
                <div className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0",
                  task.status === 'completed' && "bg-green-500",
                  task.status === 'pending' && "bg-yellow-500",
                  task.status === 'overdue' && "bg-red-500"
                )} />
                
                {/* Ícone do tipo de conteúdo - tamanho fixo */}
                <div className="flex-shrink-0">
                  {getContentTypeIcon(task.contentType)}
                </div>
                
                {/* Título da tarefa - se adapta com tooltip */}
                <span 
                  className="truncate flex-1 cursor-help" 
                  title={`${task.title} (${task.contentType}) - ${task.platforms?.join(', ') || 'Sem plataforma'}${task.has_notes ? ' - Tem notas associadas' : ''}`}
                >
                  {task.title}
                </span>
                
                {/* Indicador de notas associadas */}
                {task.has_notes && (
                  <div className="flex-shrink-0" title={`${task.notes_count} nota(s) associada(s)`}>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full border border-blue-200">
                      📝 {task.notes_count}
                    </span>
                  </div>
                )}
                

              </div>
              </Badge>
              
              {/* Botões de ação - sempre visíveis quando há 1-2 tarefas */}
              <div className="absolute -top-1 -right-12 flex gap-1">
                {/* Botão Editar - só mostra se pode editar */}
                {(task.isCalendarOwner || task.calendarPermissions?.can_edit) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTask?.(task);
                    }}
                    className="w-4 h-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs"
                    title="Editar tarefa"
                  >
                    ✏️
                  </button>
                )}
                
                {/* Botão Gerenciar notas - sempre visível */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Aqui você pode adicionar a lógica para abrir o modal de notas
                    // Por enquanto, vou deixar um placeholder
                  }}
                  className="w-4 h-4 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center text-xs"
                  title="Gerenciar notas"
                >
                  📝
                </button>
                
                {/* Botão Excluir - só mostra se pode excluir */}
                {(task.isCalendarOwner || task.calendarPermissions?.can_delete) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                        onTaskDelete(task.id);
                      }
                    }}
                    className="w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                    title="Excluir tarefa"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Mostrar dropdown apenas quando há 3+ tarefas, senão mostrar mensagem */}
        {tasks.length > 0 ? (
          <div className="flex items-center justify-center mt-auto pt-1 border-t border-muted/30">
            {tasks.length > 2 ? (
              <>
                <TasksDropdown 
                  tasks={tasks}
                  onEditTask={onEditTask}
                  onDeleteTask={onTaskDelete}
                  onTaskMove={onTaskMove}
                  currentDate={dateString}
                  highlightedTaskId={highlightedTaskId}
                  autoOpen={highlightedTaskId !== null && tasks.some(task => parseInt(task.id) === highlightedTaskId)}
                />
                <span className="text-xs text-muted-foreground ml-1">
                  +{tasks.length - 2}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        ) : (
          <div 
            className="text-center text-xs text-muted-foreground mt-auto pt-1 border-t border-muted/30 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => onAddTask?.(date)}
          >
            Clique aqui para adicionar tarefa
          </div>
        )}
      </div>
    </div>
  );
};