import { Button } from "@/components/ui/button";
import { Calendar, Plus, BarChart3 } from "lucide-react";
import { CalendarSelector } from "./CalendarSelector";

interface CalendarHeaderProps {
  currentMonth: string;
  companyName?: string;
  currentCalendarId: number;
  onCreateCalendar: () => void;
  onShowReports: () => void;
  onCalendarChange: (calendarId: number) => void;
  onEditCalendar?: (calendar: any) => void;
  onDeleteCalendar?: (calendarId: number) => void;
  onDuplicateCalendar?: (calendar: any) => void;
  onShareCalendar?: (calendar: any) => void;
  currentCalendar?: any;
  onDropdownClose?: () => void;
}

export const CalendarHeader = ({ currentMonth, companyName, currentCalendarId, onCreateCalendar, onShowReports, onCalendarChange, onEditCalendar, onDeleteCalendar, onDuplicateCalendar, onShareCalendar, currentCalendar, onDropdownClose }: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-6 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-marketing-primary/10 rounded-lg">
          <Calendar className="h-6 w-6 text-marketing-primary" />
        </div>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {companyName ? `${companyName} - Calendário Editorial` : 'Calendário Editorial'}
            </h1>
            <p className="text-muted-foreground">{currentMonth}</p>
          </div>
          
          <CalendarSelector
            currentCalendarId={currentCalendarId}
            onCalendarChange={onCalendarChange}
            onCreateNew={onCreateCalendar}
            onEditCalendar={onEditCalendar}
            onDeleteCalendar={onDeleteCalendar}
            onDuplicateCalendar={onDuplicateCalendar}
            onShareCalendar={onShareCalendar}
            currentCalendar={currentCalendar}
            onDropdownClose={onDropdownClose}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={onShowReports}
          className="flex items-center gap-2 border-[#FE306B] text-[#FE306B] hover:bg-[#FE306B] hover:text-white transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
          Relatórios
        </Button>
        <Button 
          onClick={onCreateCalendar}
          className="flex items-center gap-2 bg-[#14225A] hover:bg-[#14225A]/90 text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Gerar Novo Calendário
        </Button>
      </div>
    </div>
  );
};