import { ContentType, Platform, Status } from "@/types/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Video, 
  Image, 
  FileText, 
  Megaphone, 
  Zap,
  Filter,
  RefreshCw,
  Plus,
  Link,
  FileText as FileTextIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useNotes } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";

interface CalendarSidebarProps {
  onFilterChange: (filters: { contentType?: string; platform?: string; status?: string }) => void;
  currentCalendarId?: number;
  companyName?: string;
  tasks?: Array<{ id: string; title: string }>;
}

const contentTypes: { type: ContentType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'video', label: 'Vídeo', icon: <Video className="h-3 w-3" />, color: 'bg-content-video/20 text-content-video' },
  { type: 'image', label: 'Imagem', icon: <Image className="h-3 w-3" />, color: 'bg-content-image/20 text-content-image' },
  { type: 'text', label: 'Texto', icon: <FileText className="h-3 w-3" />, color: 'bg-content-text/20 text-content-text' },
  { type: 'campaign', label: 'Campanha', icon: <Megaphone className="h-3 w-3" />, color: 'bg-content-campaign/20 text-content-campaign' },
  { type: 'ad', label: 'Anúncio', icon: <Zap className="h-3 w-3" />, color: 'bg-content-ad/20 text-content-ad' },
];



export const CalendarSidebar = ({ onFilterChange, currentCalendarId, companyName, tasks }: CalendarSidebarProps) => {
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [showAssociateNoteModal, setShowAssociateNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  
  // Referência para o campo de título
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para controlar se está selecionando texto
  const [isSelectingText, setIsSelectingText] = useState(false);
  
  const { createGeneralNote, createTaskNote, fetchNotes } = useNotes();
  const { toast } = useToast();

  // Focar no campo de título quando o modal abrir
  useEffect(() => {
    if (showCreateNoteModal && titleInputRef.current) {
      // Usar setTimeout para garantir que o modal esteja totalmente renderizado
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [showCreateNoteModal]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCreateNote = async () => {
    if (!noteTitle.trim()) {
      toast({
        title: "⚠️ Atenção",
        description: "O título da nota é obrigatório!",
      });
      return;
    }

    if (!currentCalendarId) {
      toast({
        title: "⚠️ Atenção",
        description: "Calendário não selecionado!",
      });
      return;
    }

    const success = await createGeneralNote(noteTitle.trim(), noteContent.trim(), currentCalendarId);
    if (success) {
      setNoteTitle('');
      setNoteContent('');
      setShowCreateNoteModal(false);
      // Recarregar notas após criar
      fetchNotes({ calendar_id: currentCalendarId });
      
      // Disparar evento para atualizar NotesSection
      window.dispatchEvent(new CustomEvent('reloadNotes', { 
        detail: { calendarId: currentCalendarId } 
      }));
      
      toast({
        title: "✅ Nota criada!",
        description: "Nota foi criada com sucesso!",
      });
    }
  };

  const handleAssociateNote = async () => {
    if (!selectedTaskId) {
      toast({
        title: "⚠️ Atenção",
        description: "Selecionar uma tarefa é obrigatório!",
      });
      return;
    }

    if (!currentCalendarId) {
      toast({
        title: "⚠️ Atenção",
        description: "Calendário não selecionado!",
      });
      return;
    }

    // Buscar o título da tarefa selecionada
    const selectedTask = tasks?.find(task => task.id === selectedTaskId);
    const taskTitle = selectedTask ? selectedTask.title : 'Tarefa selecionada';

    const success = await createTaskNote(
      taskTitle, // Usar o título da tarefa selecionada
      noteContent.trim(), 
      parseInt(selectedTaskId), 
      currentCalendarId
    );

    if (success) {
      setNoteTitle('');
      setNoteContent('');
      setSelectedTaskId('');
      setShowAssociateNoteModal(false);
      // Recarregar notas após associar
      fetchNotes({ calendar_id: currentCalendarId });
      
      // Disparar evento para atualizar NotesSection
      window.dispatchEvent(new CustomEvent('reloadNotes', { 
        detail: { calendarId: currentCalendarId } 
      }));
      
      toast({
        title: "✅ Nota associada!",
        description: "Nota foi associada à tarefa com sucesso!",
      });
    }
  };

  const resetNoteForms = () => {
    setNoteTitle('');
    setNoteContent('');
    setSelectedTaskId('');
  };

  return (
    <div className="w-80 bg-card border-l border-border p-6 space-y-6 overflow-y-auto">
      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Tipo de Conteúdo</Label>
            <Select onValueChange={(value) => onFilterChange({ contentType: value })}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {contentTypes.map(({ type, label }) => (
                  <SelectItem key={type} value={type}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Plataforma</Label>
            <Select onValueChange={(value) => onFilterChange({ platform: value })}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as plataformas</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select onValueChange={(value) => onFilterChange({ status: value })}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="completed">Executado</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão Redefinir */}
          <div className="pt-2">
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              size="sm"
              className="w-full flex items-center gap-2 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
              Redefinir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legenda de Tipos de Conteúdo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tipos de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {contentTypes.map(({ type, label, icon, color }) => (
              <div key={type} className="flex items-center gap-2">
                <Badge variant="outline" className={`${color} flex items-center gap-1 px-2 py-1 text-xs`}>
                  {icon}
                  {label}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seção de Notas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileTextIcon className="h-4 w-4" />
            Notas do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreateNoteModal(true)}
              className="flex-1 bg-[#14225A] hover:bg-[#1a2d6b] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-3 w-3 mr-1" />
              Nova Nota
            </Button>
            <Button
              onClick={() => setShowAssociateNoteModal(true)}
              className="flex-1 bg-[#FE306B] hover:bg-[#e62a5f] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Link className="h-3 w-3 mr-1" />
              Associar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal Criar Nova Nota */}
      {showCreateNoteModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            // Verificar se existe texto selecionado no momento do clique
            const selection = window.getSelection();
            const hasActiveSelection = selection && selection.toString().length > 0;
            
            // Só fechar se não há seleção ativa
            if (!hasActiveSelection) {
              setShowCreateNoteModal(false);
              resetNoteForms();
              setIsSelectingText(false); // Reset do estado
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#14225A]/10 to-[#FE306B]/10 p-4 border-b border-[#FE306B]/20">
              <h3 className="text-lg font-bold text-[#14225A] flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Criar Nova Nota
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  ✏️ Título da Nota
                </label>
                              <Input
                ref={titleInputRef}
                placeholder="Ex: REUNIÃO DE PLANEJAMENTO"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value.toUpperCase())}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.toUpperCase();
                }}
                onMouseUp={() => setIsSelectingText(false)}
                className="border border-blue-200 focus:outline-none focus:ring-0 focus:border-blue-400"
              />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  📄 Conteúdo
                </label>
                              <Textarea
                placeholder="Detalhes da nota..."
                value={noteContent}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length === 1) {
                    // Primeira letra sempre maiúscula
                    setNoteContent(value.toUpperCase());
                  } else if (value.length > 1) {
                    // Para o resto do texto, manter como digitado
                    setNoteContent(value);
                  } else {
                    setNoteContent(value);
                  }
                }}
                onMouseUp={() => setIsSelectingText(false)}
                className="min-h-[100px] border border-blue-200 focus:outline-none focus:ring-0 focus:border-blue-400"
              />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleCreateNote}
                  className="flex-1 bg-transparent border border-[#14225A] hover:bg-[#14225A] hover:border-[#14225A] text-[#14225A] hover:text-white font-bold transition-all duration-300"
                >
                  💾 Salvar Nota
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateNoteModal(false);
                    resetNoteForms();
                  }}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  ❌ Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Associar Nota a Tarefa */}
      {showAssociateNoteModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            // Verificar se existe texto selecionado no momento do clique
            const selection = window.getSelection();
            const hasActiveSelection = selection && selection.toString().length > 0;
            
            // Só fechar se não há seleção ativa
            if (!hasActiveSelection) {
              setShowAssociateNoteModal(false);
              resetNoteForms();
              setIsSelectingText(false); // Reset do estado
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#14225A]/10 to-[#FE306B]/10 p-4 border-b border-[#FE306B]/20">
              <h3 className="text-lg font-bold text-[#14225A] flex items-center gap-2">
                <Link className="h-5 w-5" />
                Associar Nota a Tarefa
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  📋 Selecione a Tarefa
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full p-2 border border-green-200 rounded-lg focus:outline-none focus:ring-0 focus:border-green-400"
                >
                  <option value="">Selecione uma tarefa...</option>
                  {tasks && Array.isArray(tasks) && tasks.length > 0 ? (
                    tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Nenhuma tarefa disponível</option>
                  )}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  📄 Conteúdo da Nota
                </label>
                <Textarea
                  placeholder="Detalhes da nota..."
                  value={noteContent}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length === 1) {
                      // Primeira letra sempre maiúscula
                      setNoteContent(value.toUpperCase());
                    } else if (value.length > 1) {
                      // Para o resto do texto, manter como digitado
                      setNoteContent(value);
                    } else {
                      setNoteContent(value);
                    }
                  }}
                  onMouseUp={() => setIsSelectingText(false)}
                  className="min-h-[100px] border border-green-200 focus:outline-none focus:ring-0 focus:border-green-400"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAssociateNote}
                  className="flex-1 bg-transparent border border-[#14225A] hover:bg-[#14225A] hover:border-[#14225A] text-[#14225A] hover:text-white font-bold transition-all duration-300"
                  disabled={!selectedTaskId}
                >
                  🔗 Associar Nota
                </Button>
                <Button
                  onClick={() => {
                    setShowAssociateNoteModal(false);
                    resetNoteForms();
                  }}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  ❌ Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};