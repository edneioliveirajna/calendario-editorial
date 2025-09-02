import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, Plus, Copy, Edit, Trash2, Share2 } from "lucide-react";
import { useCalendarShares } from '../../hooks/useCalendarShares';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, API_ROUTES } from "@/config/api";

interface Calendar {
  id: number;
  company_name: string;
  start_month: string;
  unique_url: string;
  created_at: string;
  // Permissões do calendário compartilhado
  is_owner?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
  can_share?: boolean;
}

interface CalendarSelectorProps {
  currentCalendarId: number | null;
  onCalendarChange: (calendarId: number) => void;
  onCreateNew: () => void;
  onDuplicateCalendar?: (calendar: Calendar) => void;
  onEditCalendar?: (calendar: Calendar) => void;
  onDeleteCalendar?: (calendarId: number) => void;
  onShareCalendar?: (calendar: Calendar) => void;
  currentCalendar?: Calendar | null;
  onDropdownClose?: () => void;
}

export const CalendarSelector = ({ 
  currentCalendarId, 
  onCalendarChange, 
  onCreateNew,
  onEditCalendar,
  onDeleteCalendar,
  onDuplicateCalendar,
  onShareCalendar,
  currentCalendar: propCurrentCalendar,
  onDropdownClose
}: CalendarSelectorProps) => {
  
  // ✅ DEBUG: Verificar props recebidas
  console.log('🔍 DEBUG: CalendarSelector props recebidas:');
  console.log('   onEditCalendar existe:', !!onEditCalendar);
  console.log('   onDeleteCalendar existe:', !!onDeleteCalendar);
  console.log('   onDuplicateCalendar existe:', !!onDuplicateCalendar);
  console.log('   onShareCalendar existe:', !!onShareCalendar);
  console.log('   onEditCalendar tipo:', typeof onEditCalendar);
  console.log('   onDeleteCalendar tipo:', typeof onDeleteCalendar);
  

  
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentCalendar, setCurrentCalendar] = useState<Calendar | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Carregar calendários do usuário
  const loadCalendars = async () => {
    console.log('🚀 CALENDAR SELECTOR: Iniciando carregamento de calendários...');
    console.log('🔑 CALENDAR SELECTOR: Token atual:', localStorage.getItem('authToken'));
    console.log('👤 CALENDAR SELECTOR: Usuário atual:', localStorage.getItem('authUser'));
    console.log('🌐 CALENDAR SELECTOR: URL da API:', API_ROUTES.CALENDARS.LIST);
    
    setLoading(true);
    try {
      console.log('📡 CALENDAR SELECTOR: Fazendo requisição para API...');
      const response = await apiRequest(API_ROUTES.CALENDARS.LIST);
      console.log('✅ CALENDAR SELECTOR: Resposta da API recebida:', response);
      console.log('🔍 CALENDAR SELECTOR: Tipo da resposta:', typeof response);
      console.log('🔍 CALENDAR SELECTOR: Chaves da resposta:', Object.keys(response));
      
      if (response.success) {
        // Verificar se há calendários na resposta
        const calendarsData = response.calendars || response.data || [];
        console.log('🔍 DEBUG: Dados dos calendários:', calendarsData);
        
        if (!Array.isArray(calendarsData)) {
          console.error('❌ DEBUG: Dados não são um array:', calendarsData);
          setCalendars([]);
          return;
        }
        
        // Processar calendários para garantir que tenham created_at
        
        // GARANTIR que todos os calendários tenham created_at
        const processedCalendars = calendarsData.map((cal: Calendar) => {
          // Se não tem created_at, usar a data atual
          if (!cal.created_at) {
            return {
              ...cal,
              created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };
          }
          return cal;
        });
        
        setCalendars(processedCalendars);
        
        // Encontrar calendário atual
        const current = processedCalendars.find((c: Calendar) => c.id === currentCalendarId);
        if (current) {
          setCurrentCalendar(current);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar calendários:', error);
      toast({
        title: "❌ Erro!",
        description: "Falha ao carregar calendários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar calendários quando o componente montar ou quando currentCalendarId mudar
  useEffect(() => {
    loadCalendars();
  }, [currentCalendarId]);





  // Atualizar currentCalendar sempre que currentCalendarId ou calendars mudarem
  // MAS apenas se não houver um propCurrentCalendar ativo
  useEffect(() => {
    if (!propCurrentCalendar) {
      if (currentCalendarId && calendars.length > 0) {
        const current = calendars.find((c: Calendar) => c.id === currentCalendarId);
        if (current) {
          setCurrentCalendar(current);
        } else {
          // Se não encontrar o calendário atual, usar o primeiro disponível
          setCurrentCalendar(calendars[0]);
        }
      } else if (calendars.length > 0) {
        // Se não há calendário selecionado, usar o primeiro disponível
        setCurrentCalendar(calendars[0]);
      }
    }
  }, [currentCalendarId, calendars, propCurrentCalendar]);



  // Função para fechar o dropdown
  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Atualizar calendário atual quando a prop mudar (ex: após edição)
  // Este useEffect tem PRIORIDADE sobre os outros
  useEffect(() => {
    console.log('🔄 DEBUG: propCurrentCalendar mudou:', propCurrentCalendar);
    
    if (propCurrentCalendar) {
      console.log('✅ DEBUG: Atualizando currentCalendar e lista de calendários');
      console.log('📝 DEBUG: Novo nome:', propCurrentCalendar.company_name);
      
      // ATUALIZAR IMEDIATAMENTE o currentCalendar
      setCurrentCalendar(propCurrentCalendar);
      
      // Atualizar também na lista de calendários
      setCalendars(prevCalendars => 
        prevCalendars.map(cal => 
          cal.id === propCurrentCalendar.id ? propCurrentCalendar : cal
        )
      );
      
      console.log('✅ DEBUG: currentCalendar atualizado para:', propCurrentCalendar.company_name);
    }
  }, [propCurrentCalendar]);

  // ✅ NOVO: Escutar evento de atualização forçada
  useEffect(() => {
    const handleForceUpdate = (event: CustomEvent) => {
      console.log('🚀 DEBUG: Evento de atualização forçada recebido:', event.detail);
      
      if (event.detail.updatedCalendar) {
        console.log('✅ DEBUG: Forçando atualização com dados:', event.detail.updatedCalendar);
        
        // FORÇAR atualização imediata
        setCurrentCalendar(event.detail.updatedCalendar);
        
        // FORÇAR atualização da lista de calendários IMEDIATAMENTE
        setCalendars(prevCalendars => 
          prevCalendars.map(cal => 
            cal.id === event.detail.updatedCalendar.id ? event.detail.updatedCalendar : cal
          )
        );
        
        console.log('✅ DEBUG: Lista de calendários atualizada manualmente');
        
        console.log('✅ DEBUG: Atualização forçada concluída');
      }
    };

    // Adicionar listener
    window.addEventListener('forceCalendarUpdate', handleForceUpdate as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('forceCalendarUpdate', handleForceUpdate as EventListener);
    };
  }, []);



  // Formatar data para exibição
  const formatDate = (dateString: string | undefined) => {
    // Se não tem data, usar a data atual como fallback
    if (!dateString || dateString === 'undefined' || dateString === 'null') {
      const currentDate = new Date();
      const fallbackDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
      dateString = fallbackDate;
    }
    
    try {
      // Criar Date diretamente da string MySQL
      const date = new Date(dateString);
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      // Formatar para português brasileiro
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      
      return date.toLocaleDateString('pt-BR', options);
    } catch (error) {
      console.error('❌ Erro ao formatar data:', dateString, error);
      return 'Erro na data';
    }
  };

  // Formatar mês de início
  const formatStartMonth = (startMonth: string | undefined) => {
    if (!startMonth) {
      return 'Não definido';
    }
    
    try {
      const [year, month] = startMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('❌ Erro ao formatar start_month:', startMonth, error);
      return 'Erro na data';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-4 h-4 border-2 border-[#14225A] border-t-transparent rounded-full animate-spin" />
        Carregando calendários...
      </div>
    );
  }

  if (calendars.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          onClick={onCreateNew}
          size="sm"
          className="bg-[#14225A] hover:bg-[#14225A]/90 text-white transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          Criar Primeiro Calendário
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 border-[#14225A] text-[#14225A] hover:bg-[#14225A] hover:text-white transition-colors">
            <Calendar className="h-4 w-4" />
            {currentCalendar ? currentCalendar.company_name : 'Selecionar Calendário'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-1">
          {calendars.map((calendar) => (
            <DropdownMenuItem
              key={calendar.id}
                             onClick={() => {
                onCalendarChange(calendar.id);
                closeDropdown();
              }}
              className={`flex flex-col items-start p-3 cursor-pointer transition-colors rounded-md my-0.5 ${
                calendar.id === currentCalendarId ? 'bg-[#14225A]/10 border-l-4 border-l-[#14225A]' : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex flex-col w-full">
                {/* Linha superior: Título + Botões */}
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="font-medium text-sm">
                    {calendar.company_name}
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="flex items-center gap-1">
                    {/* Botão Editar - sempre mostra para usuários */}
                    {onEditCalendar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                        onClick={(e) => {
                          console.log('🔵 DEBUG: Botão EDITAR clicado!');
                          console.log('   Calendário:', calendar);
                          console.log('   Função onEditCalendar existe:', !!onEditCalendar);
                          e.stopPropagation();
                          console.log('   Chamando onEditCalendar...');
                          onEditCalendar(calendar);
                          console.log('   onEditCalendar executado, fechando dropdown...');
                          closeDropdown();
                        }}
                        title="Editar calendário"
                      >
                        <Edit className="h-3 w-3 text-blue-600" />
                      </Button>
                    )}
                    
                    {/* Botão Duplicar - sempre mostra para usuários */}
                    {onDuplicateCalendar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateCalendar(calendar);
                          closeDropdown();
                        }}
                        title="Duplicar calendário com tarefas"
                      >
                        <Copy className="h-3 w-3 text-blue-600" />
                      </Button>
                    )}
                    
                    {/* Botão Compartilhar - só mostra se for dono ou tiver permissão */}
                    {onShareCalendar && (calendar.is_owner || calendar.can_share) && (
                      <ShareButtonWithColor calendarId={calendar.id} onShare={() => {
                        onShareCalendar(calendar);
                        closeDropdown();
                      }} />
                    )}
                    
                    {/* Botão Excluir - sempre mostra para usuários */}
                    {onDeleteCalendar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                        onClick={(e) => {
                          console.log('🔴 DEBUG: Botão EXCLUIR clicado!');
                          console.log('   Calendário ID:', calendar.id);
                          console.log('   Função onDeleteCalendar existe:', !!onDeleteCalendar);
                          e.stopPropagation();
                          console.log('   Chamando onDeleteCalendar...');
                          onDeleteCalendar(calendar.id);
                          console.log('   onDeleteCalendar executado, fechando dropdown...');
                          closeDropdown();
                        }}
                        title="Excluir calendário"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Linha inferior: Informações do calendário */}
                <div className="text-xs text-muted-foreground">
                  Início: {formatStartMonth(calendar.start_month)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Criado: {formatDate(calendar.created_at)}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={() => {
              onCreateNew();
              closeDropdown();
            }}
            className="flex items-center gap-2 p-3 cursor-pointer border-t hover:bg-gray-100 transition-colors"
          >
            <Plus className="h-4 w-4 text-[#FE306B]" />
            <span className="text-[#FE306B] font-medium">Criar Novo Calendário</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Componente interno para o botão de compartilhamento com cor dinâmica
const ShareButtonWithColor = ({ calendarId, onShare }: { calendarId: number; onShare: () => void }) => {
  const { hasShares } = useCalendarShares(calendarId);
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 hover:bg-gray-200"
      onClick={(e) => {
        e.stopPropagation();
        onShare();
      }}
      title="Compartilhar calendário"
    >
      <Share2 className={`h-3 w-3 ${hasShares ? 'text-green-600' : 'text-blue-600'}`} />
    </Button>
  );
}; 