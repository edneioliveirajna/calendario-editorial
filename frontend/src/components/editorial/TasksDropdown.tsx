import { useState, useRef, useEffect } from "react";
import { CalendarTask } from "@/types/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Video, Image, FileText, Megaphone, Zap, Move } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDragAndDrop } from "@/contexts/DragAndDropContext";

interface TasksDropdownProps {
  tasks: CalendarTask[];
  onEditTask: (task: CalendarTask) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskMove?: (taskId: string, newDate: string) => void;
  currentDate: string;
  highlightedTaskId?: number | null;
  autoOpen?: boolean;
}

const getContentTypeColor = (type: string) => {
  const colors = {
    video: 'bg-content-video/20 text-content-video border-content-video/30',
    image: 'bg-content-image/20 text-content-image border-content-image/30',
    text: 'bg-content-text/20 text-content-text border-content-text/30',
    campaign: 'bg-content-campaign/20 text-content-campaign border-content-campaign/30',
    ad: 'bg-content-ad/20 text-content-ad border-content-ad/30',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
};

const getStatusColor = (status: string) => {
  const colors = {
    completed: 'bg-green-500',
    pending: 'bg-yellow-500',
    overdue: 'bg-red-500',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-500';
};

const getContentTypeIcon = (type: string) => {
  const icons = {
    video: <Video className="h-3.5 w-3.5 text-content-video" />,
    image: <Image className="h-3.5 w-3.5 text-content-image" />,
    text: <FileText className="h-3.5 w-3.5 text-content-text" />,
    campaign: <Megaphone className="h-3.5 w-3.5 text-content-campaign" />,
    ad: <Zap className="h-3.5 w-3.5 text-content-ad" />,
  };
  return icons[type as keyof typeof icons] || <FileText className="h-3.5 w-3.5 text-gray-500" />;
};

export const TasksDropdown = ({ tasks, onEditTask, onDeleteTask, onTaskMove, currentDate, highlightedTaskId, autoOpen }: TasksDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDraggingTask, setIsDraggingTask] = useState(false);
  const { dragState, startDrag, endDrag } = useDragAndDrop();
  const modalRef = useRef<HTMLDivElement>(null);

  // Função para iniciar drag
  const handleDragStart = (e: React.DragEvent, task: CalendarTask) => {
    // IMPORTANTE: Prevenir comportamento padrão
    e.stopPropagation();
    
    // Marcar que está arrastando uma tarefa
    setIsDraggingTask(true);
    
    // Usar o contexto global
    startDrag(task, currentDate);
    
    // Configurar dataTransfer com dados completos
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    e.dataTransfer.setData('text/html', `<div class="dragged-task">${task.title}</div>`);
    
    // Adicionar classe ao body para indicar que está arrastando
    document.body.classList.add('dragging-from-modal');
    
    // IMPORTANTE: Fechar modal para permitir drop livre
    setIsOpen(false);
  };

  // Função para finalizar drag
  const handleDragEnd = (e: React.DragEvent) => {
    // Usar o contexto global
    endDrag();
    document.body.classList.remove('dragging-from-modal');
    
    // Marcar que não está mais arrastando
    setIsDraggingTask(false);
  };

  // Função para verificar se a tarefa foi movida e fechar modal
  const checkTaskMoved = (taskId: string) => {
    // Se a tarefa não está mais na lista, ela foi movida
    const taskStillExists = tasks.find(task => task.id === taskId);
  };

  // Monitorar mudanças nas tarefas para verificar se foi movida
  useEffect(() => {
    // Se estava arrastando e agora não está mais, verificar se a tarefa foi movida
    if (!dragState.isDragging && dragState.draggedTask) {
      const taskId = dragState.draggedTask.id;
    }
  }, [dragState.isDragging, dragState.draggedTask, tasks]);

  // Efeito para abertura automática quando há tarefa destacada
  useEffect(() => {
    if (autoOpen && highlightedTaskId && tasks.some(task => parseInt(task.id) === highlightedTaskId)) {
      setIsOpen(true);
      
      // Scroll para o TOPO do modal sempre, independente da posição da tarefa
      setTimeout(() => {
        if (modalRef.current) {
          // Força o scroll para o topo do modal
          modalRef.current.scrollTop = 0;
          
          // Depois de ir para o topo, destaca a tarefa específica
          const highlightedElement = modalRef.current.querySelector(`[data-task-id="${highlightedTaskId}"]`);
          if (highlightedElement) {
            // Aplica destaque visual mais forte
            highlightedElement.classList.add('highlighted-task');
            
            // Remove o destaque após 5 segundos
            setTimeout(() => {
              highlightedElement.classList.remove('highlighted-task');
            }, 5000);
          }
        }
      }, 150);
    }
  }, [autoOpen, highlightedTaskId, tasks]);

  // Efeito para permitir scroll da PÁGINA quando modal é aberto via tooltip
  useEffect(() => {
    if (isOpen && autoOpen) {
      // FORÇA scroll da página principal de forma mais agressiva
      document.body.style.overflow = 'auto !important';
      document.body.style.pointerEvents = 'auto';
      document.documentElement.style.overflow = 'auto !important';
      
      // Remove APENAS bloqueios de scroll, MAS mantém pointerEvents para fechar modal
      const radixPortals = document.querySelectorAll('[data-radix-portal]');
      radixPortals.forEach((portal) => {
        const element = portal as HTMLElement;
        // NÃO remove pointerEvents - apenas overflow
        element.style.overflow = 'visible';
      });
      
      // Mantém pointerEvents no modal para permitir fechar
      const radixOverlays = document.querySelectorAll('[data-radix-dropdown-menu-content]');
      radixOverlays.forEach((overlay) => {
        const element = overlay as HTMLElement;
        element.style.pointerEvents = 'auto';
        element.style.overflow = 'visible';
      });
      
      // Remove atributo data-scroll-locked se existir
      document.body.removeAttribute('data-scroll-locked');
      document.documentElement.removeAttribute('data-scroll-locked');
      
      // Adiciona classe no body para permitir scroll
      document.body.classList.add('modal-tooltip-open');
      
      // Força scroll para funcionar
      setTimeout(() => {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
      }, 50);
      
      // Remove a classe quando o modal fechar
      return () => {
        document.body.classList.remove('modal-tooltip-open');
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        document.documentElement.style.overflow = '';
        
        // Restaura apenas overflow do Radix UI
        radixPortals.forEach((portal) => {
          const element = portal as HTMLElement;
          element.style.overflow = '';
        });
      };
    }
  }, [isOpen, autoOpen]);

  // Remover listeners globais - deixar o CalendarDay lidar com o drop
  useEffect(() => {
    // Apenas limpar a classe do body quando o componente for desmontado
    return () => {
      document.body.classList.remove('dragging-from-modal');
    };
  }, []);

  // Função para controlar abertura/fechamento do modal
  const handleOpenChange = (open: boolean) => {
    // Se está fechando, sempre permite
    if (!open) {
      setIsOpen(false);
      
      // Quando modal fecha, desabilita cliques temporariamente
      document.body.classList.add('modal-just-closed');
      setTimeout(() => {
        document.body.classList.remove('modal-just-closed');
      }, 200); // 200ms para absorver o primeiro clique
      
      return;
    }
    
    // Se está abrindo via tooltip, permite
    if (autoOpen) {
      setIsOpen(true);
      return;
    }
    
    // Se está abrindo manualmente, permite
    setIsOpen(open);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-muted/80 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        ref={modalRef}
        align="end" 
        className={cn(
          "w-72 max-h-80 z-20",
          // Permite scroll quando aberto via tooltip
          autoOpen ? "overflow-y-auto" : "overflow-hidden"
        )}
        onCloseAutoFocus={(e) => e.preventDefault()}
        sideOffset={5}
        alignOffset={-10}
        style={{
          // CSS customizado para o destaque da tarefa
          '--highlight-color': 'rgb(147, 51, 234)',
          // Força scroll quando aberto via tooltip
          ...(autoOpen && {
            overflowY: 'auto',
            pointerEvents: 'auto',
            // Remove bloqueio de scroll do Radix UI
            position: 'relative',
            zIndex: 9999
          })
        } as React.CSSProperties}
      >
        <div className="p-2 border-b">
          <h4 className="text-xs font-medium text-muted-foreground">
            {tasks.length === 0 ? 'Nenhuma tarefa' : 
             tasks.length === 1 ? '1 tarefa' : 
             `${tasks.length} tarefas`} do dia
          </h4>
        </div>
        
        <div className="p-1 space-y-1">
          {tasks.length === 0 ? (
            <div className="text-center py-2 text-muted-foreground">
              <p className="text-xs">Nenhuma tarefa para este dia</p>
              <p className="text-xs mt-1">Clique no + para adicionar</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-1.5 p-1 rounded-lg hover:bg-muted/50 transition-all duration-200 group",
                  dragState.draggedTask?.id === task.id && "bg-blue-50 border border-blue-200"
                )}
              >
                {/* Indicador de status */}
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full flex-shrink-0",
                  getStatusColor(task.status)
                )} />
                
                {/* Badge da tarefa - COMPACTO E PADRONIZADO */}
                <div
                  className={cn(
                    "text-xs px-2 py-1 justify-start cursor-pointer transition-all duration-200 border rounded-full relative w-48",
                    getContentTypeColor(task.contentType),
                    dragState.draggedTask?.id === task.id && "opacity-70 scale-95",
                    // Destaque especial para tarefas vindas do tooltip
                    highlightedTaskId === parseInt(task.id) && "ring-2 ring-purple-500 ring-offset-1 bg-purple-50 border-purple-300 shadow-lg animate-pulse"
                  )}
                  style={{ userSelect: 'none' }}
                  data-task-id={task.id}
                  title={`Clique para editar ${task.title}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditTask(task);
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    {/* Ícone do tipo de conteúdo */}
                    <div className="flex-shrink-0">
                      {getContentTypeIcon(task.contentType)}
                    </div>
                    
                    {/* Título da tarefa - TAMANHO PADRONIZADO */}
                    <span className="truncate text-xs font-medium flex-1" title={task.title}>
                      {task.title.length > 18 ? `${task.title.substring(0, 18)}...` : task.title}
                    </span>
                    
                    {/* Botão de drag dedicado - COMPACTO */}
                    <button
                      className="flex-shrink-0 p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 transition-all duration-200 cursor-grab hover:cursor-grabbing hover:scale-105 hover:shadow-sm"
                      title="🎯 Clique e arraste - modal fechará para permitir drop livre"
                      draggable="true"
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleDragStart(e, task);
                      }}
                      onDragEnd={(e) => {
                        handleDragEnd(e);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <span className="text-xs font-bold">⋮⋮</span>
                    </button>
                  </div>
                </div>
                
                {/* Botões de ação - COMPACTOS (SEM O BOTÃO DE MOVE) */}
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {/* Botão Editar - só mostra se pode editar */}
                  {(task.isCalendarOwner || task.calendarPermissions?.can_edit) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-blue-100 hover:scale-105 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                        setIsOpen(false);
                      }}
                      title="Editar tarefa"
                    >
                      <Edit className="h-2.5 w-2.5 text-blue-600" />
                    </Button>
                  )}
                  
                  {/* Botão Excluir - só mostra se pode excluir */}
                  {(() => {
                    const canDelete = task.isCalendarOwner || task.calendarPermissions?.can_delete;
                    console.log('🔍 DELETE BUTTON DEBUG:', {
                      taskId: task.id,
                      taskTitle: task.title,
                      isCalendarOwner: task.isCalendarOwner,
                      can_delete: task.calendarPermissions?.can_delete,
                      finalCanDelete: canDelete
                    });
                    return canDelete;
                  })() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-100 hover:scale-105 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                          onDeleteTask(task.id);
                          setIsOpen(false);
                        }
                      }}
                      title="Excluir tarefa"
                    >
                      <Trash2 className="h-2.5 w-2.5 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
