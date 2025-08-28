import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, API_ENDPOINTS } from "@/config/api";
import { Share2 } from "lucide-react";
import { ShareCalendarModal } from "./ShareCalendarModal";
import { useCalendarShares } from '../../hooks/useCalendarShares';

interface EditCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendar: any;
  onCalendarUpdated: (updatedCalendar: any) => void;
  onDropdownClose?: () => void;
}

export const EditCalendarModal = ({ 
  isOpen, 
  onClose, 
  calendar, 
  onCalendarUpdated,
  onDropdownClose
}: EditCalendarModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Hook para verificar se o calendário tem compartilhamentos
  const { hasShares } = useCalendarShares(calendar?.id || null);
  const [formData, setFormData] = useState({
    company_name: '',
    start_month: ''
  });

  useEffect(() => {
    if (calendar) {
      setFormData({
        company_name: calendar.company_name || '',
        start_month: calendar.start_month || ''
      });
    }
  }, [calendar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name.trim() || !formData.start_month) {
      toast({
        title: "❌ Erro!",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // DEBUG: Verificar token
      const token = localStorage.getItem('auth_token');
      console.log('🔐 Token encontrado:', token ? 'SIM' : 'NÃO');
      console.log('🔐 Token valor:', token);
      
      // DEBUG: Verificar dados sendo enviados
      console.log('📝 Dados sendo enviados:', {
        id: calendar.id,
        company_name: formData.company_name.trim(),
        start_month: formData.start_month
      });
      
      const response = await apiRequest(`${API_ENDPOINTS.CALENDARS.UPDATE}/${calendar.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          company_name: formData.company_name.trim(),
          start_month: formData.start_month
        })
      });

      if (response.success) {
        toast({
          title: "✅ Calendário atualizado!",
          description: "As alterações foram salvas com sucesso",
        });
        
        // ✅ SOLUÇÃO DIRETA: Forçar atualização completa após salvar
        try {
          console.log('🔄 DEBUG: Forçando atualização completa...');
          
          // 1. Buscar calendário atualizado do backend
          const updatedResponse = await apiRequest(`${API_ENDPOINTS.CALENDARS.READ}/${calendar.id}`);
          console.log('📥 DEBUG: Resposta do backend:', updatedResponse);
          
          if (updatedResponse.success && updatedResponse.calendar) {
            console.log('✅ DEBUG: Calendário atualizado encontrado:', updatedResponse.calendar);
            
            // 2. Atualizar o calendário no componente pai
            onCalendarUpdated(updatedResponse.calendar);
            
            // 3. FORÇAR atualização da lista de calendários no CalendarSelector
            // Simular um "refresh invisível" recarregando os dados
            setTimeout(async () => {
              try {
                console.log('🔄 DEBUG: Forçando reload da lista de calendários...');
                const listResponse = await apiRequest(API_ENDPOINTS.CALENDARS.LIST);
                if (listResponse.success) {
                  console.log('✅ DEBUG: Lista de calendários recarregada');
                  // Disparar evento customizado para forçar atualização
                  window.dispatchEvent(new CustomEvent('forceCalendarUpdate', {
                    detail: { updatedCalendar: updatedResponse.calendar }
                  }));
                }
              } catch (error) {
                console.error('❌ DEBUG: Erro ao recarregar lista:', error);
              }
            }, 100);
            
          } else {
            console.log('⚠️ DEBUG: Fallback para dados locais');
            onCalendarUpdated({
              ...calendar,
              company_name: formData.company_name.trim(),
              start_month: formData.start_month
            });
          }
        } catch (error) {
          console.error('❌ DEBUG: Erro ao buscar calendário atualizado:', error);
          onCalendarUpdated({
            ...calendar,
            company_name: formData.company_name.trim(),
            start_month: formData.start_month
          });
        }
        
        // Fechar o dropdown se a função estiver disponível
        if (onDropdownClose) {
          onDropdownClose();
        }
        
        onClose();
      } else {
        throw new Error(response.error || 'Erro ao atualizar calendário');
      }
    } catch (error) {
      console.error('Erro ao atualizar calendário:', error);
      toast({
        title: "❌ Erro!",
        description: "Falha ao atualizar calendário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Se não houver calendário, não renderizar nada
  if (!calendar) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              ✏️ Editar Calendário
            </DialogTitle>
            {/* Botão Compartilhar - só mostra para calendários próprios */}
            {calendar.is_owner && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowShareModal(true)}
                disabled={!calendar}
                className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Share2 className={`h-4 w-4 ${hasShares ? 'text-green-600' : 'text-blue-600'}`} />
                Compartilhar
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Nome da Empresa</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="Digite o nome da empresa"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="start_month">Mês de Início</Label>
            <div className="relative">
              <Input
                id="start_month"
                type="month"
                value={formData.start_month}
                onChange={(e) => setFormData(prev => ({ ...prev, start_month: e.target.value }))}
                required
                className="cursor-pointer hover:border-[#FE306B] transition-colors focus:border-[#FE306B] focus:ring-1 focus:ring-[#FE306B]"
              />
              {/* Overlay invisível que captura todos os cliques */}
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => {
                  const input = document.getElementById('start_month') as HTMLInputElement;
                  if (input) {
                    input.showPicker();
                  }
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Clique em qualquer lugar do campo para selecionar mês e ano
            </p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#FE306B] hover:bg-[#FE306B]/90 text-white transition-colors"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-[#14225A] text-[#14225A] hover:bg-[#14225A] hover:text-white transition-colors"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
      
      {/* Modal de Compartilhamento */}
      {calendar && (
        <ShareCalendarModal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          calendarId={calendar.id}
          calendarName={calendar.company_name}
        />
      )}
    </Dialog>
  );
};
