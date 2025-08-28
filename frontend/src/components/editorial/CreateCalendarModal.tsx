import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarSettings } from "@/types/calendar";
import { apiPost, API_ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Calendar } from "lucide-react";

interface CreateCalendarModalProps {
  open: boolean;
  onClose: () => void;
  onCreateCalendar: (settings: CalendarSettings) => void;
}

export const CreateCalendarModal = ({ open, onClose, onCreateCalendar }: CreateCalendarModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<CalendarSettings>({
    companyName: '',
    startMonth: ''
  });

  // Função inteligente para formatar nome da empresa
  const formatCompanyName = (text: string, isCapsLock: boolean): string => {
    if (!text || text.trim() === '') return text;
    
    // Se Caps Lock estiver ativado, manter tudo maiúsculo
    if (isCapsLock) {
      return text.toUpperCase();
    }
    
    // Caso contrário, capitalizar primeira letra de cada palavra
    return text
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        // Capitalizar primeira letra e manter o resto como está
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  // Função para lidar com mudanças no campo de nome da empresa
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const value = input.value;
    
    // Detectar Caps Lock de forma mais inteligente
    // Se o usuário digitar uma sequência de letras maiúsculas, provavelmente Caps Lock está ativado
    const lastChar = value.slice(-1);
    const isCapsLock = /[A-Z]/.test(lastChar) && lastChar === lastChar.toUpperCase();
    
    // Formatar o texto de acordo com Caps Lock
    const formattedValue = formatCompanyName(value, isCapsLock);
    
    setSettings({ ...settings, companyName: formattedValue });
  };

  // Função para lidar com keydown para detectar Caps Lock
  const handleCompanyNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Se a tecla for uma letra e estiver em maiúsculo, detectar Caps Lock
    if (/[a-zA-Z]/.test(e.key)) {
      const isCapsLock = e.key === e.key.toUpperCase();
      
      // Se Caps Lock estiver ativado, formatar o texto atual
      if (isCapsLock) {
        const currentValue = e.currentTarget.value;
        const formattedValue = formatCompanyName(currentValue, true);
        setSettings({ ...settings, companyName: formattedValue });
      }
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSettings({
        companyName: '',
        startMonth: ''
      });
      
      // Set current year and month as default
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      setSettings(prev => ({
        ...prev,
        startMonth: `${currentYear}-${String(currentMonth).padStart(2, '0')}`
      }));
    }
  }, [open]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (settings.startMonth) {
      setIsLoading(true);
      
      try {
        // O startMonth já está no formato YYYY-MM
        const startMonth = settings.startMonth;
        
        // Se não tiver nome da empresa, usar o mês selecionado
        let companyName = settings.companyName;
        if (!companyName || companyName.trim() === '') {
          const [year, month] = startMonth.split('-');
          const monthIndex = parseInt(month) - 1;
          const monthName = months[monthIndex];
          companyName = `${monthName} ${year}`;
        }
        
        // Chamar API para criar calendário (sem user_id - será obtido do token)
        const response = await apiPost(API_ENDPOINTS.CALENDARS.CREATE, {
          company_name: companyName,
          start_month: startMonth
        });
        
        if (response.success) {
          toast({
            title: "✅ Sucesso!",
            description: "Calendário criado e salvo no banco de dados!",
          });
          
          // Salvar calendário criado no estado
          // setCreatedCalendar(response.calendar); // REMOVIDO
          
          // Chamar callback com dados do calendário criado
          onCreateCalendar({
            ...settings,
            companyName: companyName, // Usar o nome processado
            uniqueUrl: response.calendar.unique_url,
            calendarId: response.calendar.id, // Corrigido: acessar response.calendar.id
          } as CalendarSettings);
          
          // Fechar o modal automaticamente após criar com sucesso
          onClose();
          
          // Mostrar mensagem de sucesso
          toast({
            title: "✅ Calendário criado!",
            description: `Calendário "${response.calendar.company_name}" foi criado com sucesso!`,
          });
          
          // Resetar o formulário
          setSettings({
            companyName: '',
            startMonth: ''
          });
        }
      } catch (error) {
        console.error('Erro ao criar calendário:', error);
        toast({
          title: "❌ Erro!",
          description: "Falha ao criar calendário. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio',
    'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro',
    'Novembro', 'Dezembro'
  ];



  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#FE306B]" />
            Criar Novo Calendário
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da Empresa (opcional)</Label>
            <Input
              id="companyName"
              placeholder="Ex: Minha Empresa"
              value={settings.companyName}
              onChange={handleCompanyNameChange}
              onKeyDown={handleCompanyNameKeyDown}
            />
            <p className="text-xs text-muted-foreground">
              Se deixar em branco, será usado o mês selecionado
            </p>
          </div>

          {/* Mês de Início */}
          <div className="space-y-2">
            <Label htmlFor="startMonth">Mês de Início</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={settings.startMonth ? settings.startMonth.split('-')[1] : ''}
                onValueChange={(month) => {
                  const year = settings.startMonth ? settings.startMonth.split('-')[0] : currentYear.toString();
                  setSettings({ ...settings, startMonth: `${year}-${month}` });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index + 1} value={String(index + 1).padStart(2, '0')}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={settings.startMonth ? settings.startMonth.split('-')[0] : ''}
                onValueChange={(year) => {
                  const month = settings.startMonth ? settings.startMonth.split('-')[1] : String(currentMonth).padStart(2, '0');
                  setSettings({ ...settings, startMonth: `${year}-${month}` });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {Array.from({ length: 126 }, (_, i) => 1975 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-[#FE306B] hover:bg-[#FE306B]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar Calendário"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
      
    </Dialog>
  );
};