import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarTask, ContentType, Platform, Status } from "@/types/calendar";
import { Calendar, Video, Image, FileText, Megaphone, Zap, Instagram, Youtube, User, Facebook, Linkedin } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated: (task: CalendarTask) => void;
  selectedDate: Date;
  calendarId: number;
  createTask: (taskData: Omit<CalendarTask, 'id'>) => Promise<CalendarTask>;
}

export const CreateTaskModal = ({ open, onClose, onTaskCreated, selectedDate, calendarId, createTask }: CreateTaskModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    contentType: 'image' as ContentType,
    platforms: ['instagram'] as Platform[],
    status: 'pending' as Status,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (taskData.title && taskData.contentType && taskData.platforms.length > 0) {
      setIsLoading(true);
      
      try {
        // Usar o hook createTask que atualiza o estado automaticamente
        const newTask = await createTask({
          title: taskData.title,
          contentType: taskData.contentType,
          platforms: taskData.platforms,
          status: taskData.status,
          date: selectedDate,
          description: taskData.description
        });
        
        onTaskCreated(newTask);
        onClose();
        
        // Reset form
        setTaskData({
          title: '',
          contentType: 'image',
          platforms: ['instagram'],
          status: 'pending',
          description: ''
        });
      } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        toast({
          title: "❌ Erro!",
          description: "Falha ao criar tarefa. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const contentTypes: { value: ContentType; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'video', label: 'Vídeo', icon: <Video className="h-4 w-4" />, color: 'bg-content-video/20 text-content-video' },
    { value: 'image', label: 'Imagem', icon: <Image className="h-4 w-4" />, color: 'bg-content-image/20 text-content-image' },
    { value: 'text', label: 'Texto', icon: <FileText className="h-4 w-4" />, color: 'bg-content-text/20 text-content-text' },
    { value: 'campaign', label: 'Campanha', icon: <Megaphone className="h-4 w-4" />, color: 'bg-content-campaign/20 text-content-campaign' },
    { value: 'ad', label: 'Anúncio', icon: <Zap className="h-4 w-4" />, color: 'bg-content-ad/20 text-content-ad' },
  ];

  const platforms: { value: Platform; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'instagram', label: 'Instagram', icon: <Instagram className="h-4 w-4" />, color: 'bg-platform-instagram/20 text-platform-instagram' },
    { value: 'youtube', label: 'YouTube', icon: <Youtube className="h-4 w-4" />, color: 'bg-platform-youtube/20 text-platform-youtube' },
    { value: 'tiktok', label: 'TikTok', icon: <User className="h-4 w-4" />, color: 'bg-platform-tiktok/20 text-platform-tiktok' },
    { value: 'facebook', label: 'Facebook', icon: <Facebook className="h-4 w-4" />, color: 'bg-platform-facebook/20 text-platform-facebook' },
    { value: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-4 w-4" />, color: 'bg-platform-linkedin/20 text-platform-linkedin' },
  ];

  const selectedDateFormatted = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border border-blue-200/50 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-[#14225A]/10 to-[#FE306B]/10 -m-6 mb-3 p-4 rounded-t-lg border-b border-[#FE306B]/20">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#14225A]">
                          <div className="p-1.5 bg-[#14225A]/20 rounded-full">
                <Calendar className="h-5 w-5 text-[#14225A]" />
              </div>
            Criar Nova Tarefa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Data Selecionada */}
          <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
            <Label className="text-sm font-bold text-blue-800 mb-1 block">📅 Data Selecionada</Label>
            <p className="text-base font-semibold text-blue-900">{selectedDateFormatted}</p>
          </div>

          {/* Primeira linha: Título e Tipo de Conteúdo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Título - Mais espaço */}
            <div className="md:col-span-2 space-y-1 group">
              <Label htmlFor="title" className="text-sm font-bold text-blue-800 flex items-center gap-1">
                ✏️ Título da Tarefa
              </Label>
              <Input
                id="title"
                placeholder="Ex: Post Instagram Stories"
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value.toUpperCase() })}
                className="h-10 border border-blue-200 rounded-lg focus:outline-none focus:ring-0 transition-all duration-300 hover:border-blue-300 hover:shadow-md"
                required
              />
            </div>

            {/* Tipo de Conteúdo - Menos espaço */}
            <div className="space-y-1 group">
              <Label className="text-sm font-bold text-purple-800 flex items-center gap-1">
                🎨 Tipo de Conteúdo
              </Label>
              <Select 
                value={taskData.contentType} 
                onValueChange={(value: ContentType) => setTaskData({ ...taskData, contentType: value })}
              >
                <SelectTrigger className="h-10 border border-purple-200 rounded-lg focus:outline-none focus:ring-0 transition-all duration-300 hover:border-purple-300 hover:shadow-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map(({ value, label, icon, color }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        {icon}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Segunda linha: Status */}
          <div className="space-y-1 group">
            <Label className="text-sm font-bold text-green-800 flex items-center gap-1">
              🚦 Status
            </Label>
            <Select 
              value={taskData.status} 
              onValueChange={(value: Status) => setTaskData({ ...taskData, status: value })}
            >
              <SelectTrigger 
                className={`h-10 border rounded-lg transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-0 ${
                  taskData.status === 'pending' 
                    ? 'border-yellow-400 hover:border-yellow-500' 
                    : taskData.status === 'completed' 
                    ? 'border-green-400 hover:border-green-500' 
                    : 'border-red-400 hover:border-red-500'
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="completed">Executado</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plataformas */}
          <div className="space-y-1">
            <Label className="text-sm font-bold text-pink-600 flex items-center gap-1">
              🌐 Plataformas
            </Label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 p-2 bg-gradient-to-br from-pink-25 to-rose-25 rounded-lg border border-pink-100 shadow-md hover:shadow-lg transition-all duration-300">
              {platforms.map(({ value, label, icon, color }) => (
                <label key={value} className="flex items-center space-x-1 cursor-pointer p-1.5 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300 hover:scale-105 border border-transparent hover:border-pink-200">
                  <input
                    type="checkbox"
                    checked={taskData.platforms.includes(value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTaskData({ ...taskData, platforms: [...taskData.platforms, value] });
                      } else {
                        setTaskData({ ...taskData, platforms: taskData.platforms.filter(p => p !== value) });
                      }
                    }}
                    className="rounded border border-pink-200 w-4 h-4 checked:bg-pink-400 checked:border-pink-400 transition-all duration-200"
                  />
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  {icon}
                  <span className="text-xs font-bold text-pink-600">{label}</span>
                </label>
              ))}
            </div>
            {taskData.platforms.length === 0 && (
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Selecione pelo menos uma plataforma
              </p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-1 group">
            <Label htmlFor="description" className="text-sm font-bold text-indigo-800 flex items-center gap-1">
              📝 Descrição (opcional)
            </Label>
                          <Textarea
                id="description"
                placeholder="Detalhes da tarefa..."
                value={taskData.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length === 1) {
                    // Primeira letra sempre maiúscula
                    setTaskData({ ...taskData, description: value.toUpperCase() });
                  } else if (value.length > 1) {
                    // Para o resto do texto, manter como digitado
                    setTaskData({ ...taskData, description: value });
                  } else {
                    setTaskData({ ...taskData, description: value });
                  }
                }}
                className="min-h-[50px] resize-none border border-indigo-200 rounded-lg focus:outline-none focus:ring-0 transition-all duration-300 hover:border-indigo-300 hover:shadow-md"
              />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2 border-t-2 border-gradient-to-r from-blue-200 to-purple-200">
            <Button 
              type="submit" 
              className="flex-1 h-10 bg-blue-100 hover:bg-blue-200 text-[#14225A] transition-all duration-300 font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-105" 
              disabled={isLoading}
            >
              {isLoading ? "⏳ Criando..." : "✨ Criar Tarefa"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-10 border border-red-300 text-red-600 hover:bg-red-50 transition-all duration-300 font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-105" 
              disabled={isLoading}
            >
              ❌ Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 