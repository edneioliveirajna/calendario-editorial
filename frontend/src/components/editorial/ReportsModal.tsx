import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarTask } from "@/types/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, CheckCircle, Clock, AlertCircle, Download } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";

interface ReportsModalProps {
  open: boolean;
  onClose: () => void;
  tasks: CalendarTask[];
  currentCalendarId?: number;
  companyName?: string;
  calendarMonth?: string;
}

export const ReportsModal = ({ open, onClose, tasks, currentCalendarId, companyName, calendarMonth }: ReportsModalProps) => {
  // Estado para forçar re-renderização quando nova tarefa é criada
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Hook para buscar notas
  const { notes, fetchNotes } = useNotes();
  
  // Carregar notas quando o modal abrir
  useEffect(() => {
    if (open && currentCalendarId) {
      console.log('🔄 Modal aberto, carregando notas para calendário:', currentCalendarId);
      fetchNotes({ calendar_id: currentCalendarId });
    }
  }, [open, currentCalendarId, fetchNotes]);
  
  // Escutar eventos de tarefas para atualizar automaticamente
  useEffect(() => {
    const handleTaskEvent = (event: CustomEvent) => {
      const { calendarId } = event.detail;
      
      // Só atualizar se for do calendário atual e modal estiver aberto
      if (calendarId === currentCalendarId && open) {
        console.log(`🔄 Modal de relatório detectou evento de tarefa (${event.type})! Atualizando...`);
        
        // Forçar atualização imediata e múltipla para garantir
        setLastUpdate(Date.now());
        
        // Sequência de atualizações para garantir que o modal se atualize
        setTimeout(() => setLastUpdate(Date.now()), 50);
        setTimeout(() => setLastUpdate(Date.now()), 100);
        setTimeout(() => setLastUpdate(Date.now()), 200);
      }
    };

    // Adicionar listeners para todos os eventos de tarefa
    window.addEventListener('taskCreated', handleTaskEvent as EventListener);
    window.addEventListener('taskUpdated', handleTaskEvent as EventListener);
    window.addEventListener('taskDeleted', handleTaskEvent as EventListener);
    window.addEventListener('taskMoved', handleTaskEvent as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('taskCreated', handleTaskEvent as EventListener);
      window.removeEventListener('taskUpdated', handleTaskEvent as EventListener);
      window.removeEventListener('taskDeleted', handleTaskEvent as EventListener);
      window.removeEventListener('taskMoved', handleTaskEvent as EventListener);
    };
  }, [currentCalendarId, open]);

  // ✅ NOVO: Escutar especificamente eventos de mudança de tarefa para atualização automática
  useEffect(() => {
    const handleTaskMoved = (event: CustomEvent) => {
      const { calendarId, taskId, oldDate, newDate } = event.detail;
      
      // Só atualizar se for do calendário atual e modal estiver aberto
      if (calendarId === currentCalendarId && open) {
        console.log(`🚀 Modal de relatório detectou tarefa movida: ${taskId} de ${oldDate} para ${newDate}`);
        console.log('🔄 Forçando atualização automática do relatório...');
        
        // Forçar atualização imediata
        setLastUpdate(Date.now());
        
        // Sequência de atualizações para garantir sincronização
        setTimeout(() => {
          console.log('✅ Atualização 1/3 concluída');
          setLastUpdate(Date.now());
        }, 100);
        
        setTimeout(() => {
          console.log('✅ Atualização 2/3 concluída');
          setLastUpdate(Date.now());
        }, 300);
        
        setTimeout(() => {
          console.log('✅ Atualização 3/3 concluída');
          setLastUpdate(Date.now());
        }, 500);
      }
    };

    // Adicionar listener específico para tarefas movidas
    window.addEventListener('taskMoved', handleTaskMoved as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('taskMoved', handleTaskMoved as EventListener);
    };
  }, [currentCalendarId, open]);
  
  // As tarefas já são filtradas pelo useTasks hook baseado no currentCalendarId
  // Usar lastUpdate para forçar re-renderização
  const filteredTasks = tasks;
  
  // ✅ NOVO: Ordenar tarefas por data (mais recente primeiro)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
    
  const completedTasks = sortedTasks.filter(task => task.status === 'completed');
  const pendingTasks = sortedTasks.filter(task => task.status === 'pending');
  const overdueTasks = sortedTasks.filter(task => task.status === 'overdue');
  
  // Debug: mostrar quando as tarefas mudam
  console.log(`📊 ReportsModal - Tarefas filtradas: ${filteredTasks.length}, LastUpdate: ${lastUpdate}`);
  console.log(`📝 ReportsModal - Notas carregadas: ${notes.length}`);
  console.log(`🔄 ReportsModal - Tarefas ordenadas por data (mais recente primeiro): ${sortedTasks.length}`);
  if (sortedTasks.length > 0) {
    console.log(`📅 Primeira tarefa (mais recente): ${sortedTasks[0].title} - ${sortedTasks[0].date.toLocaleDateString('pt-BR')}`);
    console.log(`📅 Última tarefa (mais antiga): ${sortedTasks[sortedTasks.length - 1].title} - ${sortedTasks[sortedTasks.length - 1].date.toLocaleDateString('pt-BR')}`);
  }
  
  // Forçar re-renderização sempre que as tarefas mudarem
  useEffect(() => {
    if (open) {
      setLastUpdate(Date.now());
    }
  }, [tasks, open]);
  
  // Forçar atualização adicional quando tarefas mudarem
  useEffect(() => {
    if (open && tasks.length > 0) {
      // Atualizar imediatamente
      setLastUpdate(Date.now());
      
      // Atualizar novamente após um pequeno delay para garantir
      setTimeout(() => {
        setLastUpdate(Date.now());
      }, 50);
    }
  }, [tasks.length, open]);

  const getCompletionRate = () => {
    if (filteredTasks.length === 0) return 0;
    return Math.round((completedTasks.length / filteredTasks.length) * 100);
  };

  // Função para gerar PDF do relatório
  const generatePDFReport = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Debug: verificar notas carregadas
      console.log('DEBUG - Notas carregadas:', notes);
      console.log('DEBUG - Tarefas filtradas:', filteredTasks);
      console.log('DEBUG - Calendar ID:', currentCalendarId);
      
      // Importar jsPDF dinamicamente
      const jsPDF = (await import('jspdf')).default;
      
      // Criar novo documento PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Configurações iniciais
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 20;
      
      // Cabeçalho institucional
      doc.setFillColor(20, 34, 90); // Azul #14225A
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      // Linha decorativa rosa
      doc.setFillColor(254, 48, 107); // Rosa #FE306B
      doc.rect(0, 45, pageWidth, 2, 'F');
      
      // Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO COMPLETO', pageWidth / 2, 28, { align: 'center' });
      
      // Subtítulo institucional
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Gestão de Calendários Editoriais', pageWidth / 2, 38, { align: 'center' });
      
      // Resetar posição Y após cabeçalho
      yPosition = 60;
      
      // Informações do calendário
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMAÇÕES DO CALENDÁRIO', margin, yPosition);
      yPosition += 20;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Calendário: ${companyName || 'Sem nome'}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 8;
      
      if (calendarMonth) {
        doc.text(`Período: ${calendarMonth}`, margin, yPosition);
        yPosition += 8;
      }
      
      yPosition += 20;
      
      // Resumo estatístico
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMO ESTATÍSTICO', margin, yPosition);
      yPosition += 20;
      
      const statsData = [
        { label: 'Tarefas Executadas', value: completedTasks.length, color: [34, 197, 94] },
        { label: 'Tarefas Pendentes', value: pendingTasks.length, color: [245, 158, 11] },
        { label: 'Tarefas Atrasadas', value: overdueTasks.length, color: [239, 68, 68] },
        { label: 'Total de Tarefas', value: filteredTasks.length, color: [20, 34, 90] }
      ];
      
      // Layout em grid para estatísticas
      const statsPerRow = 2;
      const statsWidth = (pageWidth - 2 * margin - 20) / statsPerRow;
      
      for (let i = 0; i < statsData.length; i++) {
        const stat = statsData[i];
        const xPos = margin + (i % statsPerRow) * (statsWidth + 20);
        const yPos = yPosition + Math.floor(i / statsPerRow) * 30;
        
        // Card da estatística
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.roundedRect(xPos, yPos, statsWidth, 25, 4, 4, 'FD');
        
        // Valor da estatística
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        const valueText = stat.value.toString();
        const valueWidth = doc.getTextWidth(valueText);
        doc.text(valueText, xPos + (statsWidth - valueWidth) / 2, yPos + 16);
        
        // Label da estatística
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        const labelText = stat.label;
        const labelWidth = doc.getTextWidth(labelText);
        doc.text(labelText, xPos + (statsWidth - labelWidth) / 2, yPos + 22);
      }
      
      yPosition += 80;
      
      // Taxa de conclusão
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Taxa de Conclusão: ${getCompletionRate()}%`, margin, yPosition);
      yPosition += 20;
      
      // Barra de progresso
      const progressBarWidth = pageWidth - 2 * margin;
      const progressBarHeight = 10;
      const progressBarX = margin;
      const progressBarY = yPosition;
      
      // Fundo da barra
      doc.setFillColor(229, 231, 235);
      doc.roundedRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 5, 5, 'F');
      
      // Barra de progresso
      const progressWidth = (progressBarWidth * getCompletionRate()) / 100;
      doc.setFillColor(34, 197, 94);
      doc.roundedRect(progressBarX, progressBarY, progressWidth, progressBarHeight, 5, 5, 'F');
      
      // Percentual na barra
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${getCompletionRate()}%`, progressBarX + progressBarWidth / 2, progressBarY + 7, { align: 'center' });
      
      yPosition += 30;
      
      // Verificar se precisa de nova página
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Detalhamento das tarefas
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALHAMENTO DAS TAREFAS', margin, yPosition);
      yPosition += 20;
      
      // Agrupar tarefas por data
      const tasksByDate = sortedTasks.reduce((acc, task) => {
        const taskDate = new Date(task.date).toLocaleDateString('pt-BR');
        if (!acc[taskDate]) {
          acc[taskDate] = [];
        }
        acc[taskDate].push(task);
        return acc;
      }, {} as Record<string, CalendarTask[]>);
      
      // Ordenar datas das tarefas
      const sortedDates = Object.keys(tasksByDate).sort((a, b) => {
        const dateA = new Date(a.split('/').reverse().join('-'));
        const dateB = new Date(b.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });
      
      for (const date of sortedDates) {
        const tasksForDate = tasksByDate[date];
        
        // Verificar se precisa de nova página
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Cabeçalho da data
        doc.setFillColor(243, 244, 246);
        doc.setDrawColor(209, 213, 219);
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 20, 4, 4, 'FD');
        
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Data: ${date}`, margin + 10, yPosition + 12);
        
        yPosition += 25;
        
        // Tarefas da data
        for (const task of tasksForDate) {
          // Verificar se precisa de nova página
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Card da tarefa
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(209, 213, 219);
          doc.roundedRect(margin + 5, yPosition, pageWidth - 2 * margin - 10, 0, 4, 4, 'FD');
          
          // Título da tarefa
          doc.setTextColor(31, 41, 55);
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          doc.text(`TAREFA: ${task.title}`, margin + 10, yPosition + 8);
          yPosition += 15;
          
          // Detalhes da tarefa
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          // Tipo de conteúdo
          const contentTypeTranslation: Record<string, string> = {
            'image': 'Imagem',
            'video': 'Vídeo',
            'campaign': 'Campanha',
            'post': 'Post',
            'story': 'Story',
            'reel': 'Reel',
            'ad': 'Anúncio',
            'content': 'Conteúdo',
            'other': 'Outro'
          };
          
          const translatedContentType = contentTypeTranslation[task.contentType] || task.contentType;
          
          doc.setTextColor(59, 130, 246);
          doc.text(`Tipo: ${translatedContentType}`, margin + 15, yPosition);
          yPosition += 8;
          
          // Plataformas
          doc.setTextColor(245, 158, 11);
          doc.text(`Plataformas: ${task.platforms.join(', ')}`, margin + 15, yPosition);
          yPosition += 8;
          
          // Status
          const statusColor = task.status === 'completed' ? [34, 197, 94] : 
                             task.status === 'pending' ? [245, 158, 11] : [239, 68, 68];
          const statusText = task.status === 'completed' ? 'Executado' : 
                            task.status === 'pending' ? 'Pendente' : 'Atrasado';
          
          doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
          doc.text(`Status: ${statusText}`, margin + 15, yPosition);
          yPosition += 8;
          
          // Descrição
          if (task.description) {
            doc.setTextColor(100, 116, 139);
            doc.text(`Descrição: ${task.description}`, margin + 15, yPosition);
            yPosition += 8;
          }
          
          // Buscar anotações associadas à tarefa
          console.log(`DEBUG - Buscando notas para tarefa ${task.id} (tipo: ${typeof task.id})`);
          
          const taskNotes = notes.filter(note => {
            console.log(`DEBUG - Verificando nota:`, {
              noteId: note.id,
              noteTaskId: note.task_id,
              noteTaskIdType: typeof note.task_id,
              taskId: task.id,
              taskIdType: typeof task.id,
              noteCalendarId: note.calendar_id,
              currentCalendarId: currentCalendarId,
              isGeneral: note.is_general
            });
            
            // Verificar se a nota está associada à tarefa atual
            const isAssociated = note.task_id && 
                               note.calendar_id === currentCalendarId &&
                               !note.is_general &&
                               (parseInt(note.task_id.toString()) === parseInt(task.id.toString()) ||
                                note.task_id.toString() === task.id.toString());
            
            console.log(`DEBUG - Nota ${note.id} associada à tarefa ${task.id}? ${isAssociated}`);
            return isAssociated;
          });
          
          console.log(`DEBUG - Notas encontradas para tarefa ${task.id}:`, taskNotes);
          
          if (taskNotes.length > 0) {
            yPosition += 3;
            
            // Cabeçalho das anotações
            doc.setTextColor(147, 51, 234);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`Anotações Associadas (${taskNotes.length}):`, margin + 15, yPosition);
            yPosition += 6;
            
            for (const note of taskNotes) {
              if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
              }
              
              // Card da anotação
              doc.setFillColor(250, 245, 255);
              doc.setDrawColor(196, 181, 253);
              doc.roundedRect(margin + 20, yPosition, pageWidth - 2 * margin - 25, 0, 2, 2, 'FD');
              
              doc.setTextColor(88, 28, 135);
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              doc.text(`${note.title || 'Sem título'}:`, margin + 25, yPosition + 6);
              yPosition += 10;
              
              doc.setTextColor(107, 114, 128);
              doc.setFontSize(9);
              doc.setFont('helvetica', 'normal');
              doc.text(`   ${note.content}`, margin + 25, yPosition);
              yPosition += 8;
            }
          }
          
          yPosition += 8;
        }
        
        yPosition += 5;
      }
      
      // Adicionar notas gerais do mês se houver
      const generalNotes = notes.filter(note => 
        note.is_general && note.calendar_id === currentCalendarId
      );
      
      if (generalNotes.length > 0) {
        // Verificar se precisa de nova página
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Card de notas gerais
        doc.setFillColor(254, 242, 242); // Vermelho claro
        doc.setDrawColor(252, 165, 165);
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'FD');
        
        doc.setTextColor(185, 28, 28);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTAS GERAIS DO MÊS', margin + 10, yPosition + 15);
        
        yPosition += 35;
        
        for (const note of generalNotes) {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Card da nota geral
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(margin + 5, yPosition, pageWidth - 2 * margin - 10, 0, 3, 3, 'FD');
          
          doc.setFontSize(12);
          doc.setTextColor(33, 33, 33);
          doc.setFont('helvetica', 'bold');
          doc.text(`• ${note.title || 'Sem título'}`, margin + 10, yPosition + 8);
          yPosition += 12;
          
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          doc.text(`  Conteúdo: ${note.content}`, margin + 15, yPosition);
          yPosition += 10;
          
          if (note.date) {
            doc.text(`  Data: ${new Date(note.date).toLocaleDateString('pt-BR')}`, margin + 15, yPosition);
            yPosition += 8;
          }
          
          yPosition += 10;
        }
      }
      
      // Adicionar todas as notas do mês (associadas e não associadas)
      const allMonthNotes = notes.filter(note => 
        note.calendar_id === currentCalendarId
      );
      
      if (allMonthNotes.length > 0) {
        // Verificar se precisa de nova página
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Card de todas as notas
        doc.setFillColor(236, 254, 255); // Azul claro
        doc.setDrawColor(147, 197, 253);
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'FD');
        
        doc.setTextColor(30, 64, 175);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('TODAS AS NOTAS DO MÊS', margin + 10, yPosition + 15);
        
        yPosition += 35;
        
        // Organizar notas por data
        const notesByDate = allMonthNotes.reduce((acc, note) => {
          // Se a nota tem data, usar ela; senão, agrupar por mês do calendário
          let noteDate;
          if (note.date) {
            noteDate = new Date(note.date).toLocaleDateString('pt-BR');
          } else {
            // Para notas sem data, agrupar por mês do calendário selecionado
            noteDate = calendarMonth || 'Mês do Calendário';
          }
          
          if (!acc[noteDate]) {
            acc[noteDate] = [];
          }
          acc[noteDate].push(note);
          return acc;
        }, {} as Record<string, any[]>);
        
        // Ordenar datas das notas
        const sortedNoteDates = Object.keys(notesByDate).sort((a, b) => {
          // Colocar mês do calendário primeiro
          if (a === calendarMonth || a === 'Mês do Calendário') return -1;
          if (b === calendarMonth || b === 'Mês do Calendário') return 1;
          
          // Para outras datas, ordenar normalmente
          if (a === 'Sem data') return 1;
          if (b === 'Sem data') return 1;
          
          try {
            const dateA = new Date(a.split('/').reverse().join('-'));
            const dateB = new Date(b.split('/').reverse().join('-'));
            return dateA.getTime() - dateB.getTime();
          } catch {
            return 0;
          }
        });
        
        for (const noteDate of sortedNoteDates) {
          const notesForDate = notesByDate[noteDate];
          
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Cabeçalho da data das notas
          doc.setFillColor(241, 245, 249);
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 20, 3, 3, 'FD');
          
          doc.setTextColor(51, 65, 85);
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`Data: ${noteDate}`, margin + 10, yPosition + 12);
          
          yPosition += 25;
          
          for (const note of notesForDate) {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }
            
            // Card da nota com cores baseadas no tipo
            const isGeneral = note.is_general;
            const noteColor = isGeneral ? [34, 197, 94] : [147, 51, 234]; // Verde para geral, roxo para associada
            const noteBgColor = isGeneral ? [240, 253, 244] : [250, 245, 255];
            const noteBorderColor = isGeneral ? [134, 239, 172] : [196, 181, 253];
            
            doc.setFillColor(noteBgColor[0], noteBgColor[1], noteBgColor[2]);
            doc.setDrawColor(noteBorderColor[0], noteBorderColor[1], noteBorderColor[2]);
            doc.roundedRect(margin + 5, yPosition, pageWidth - 2 * margin - 10, 0, 3, 3, 'FD');
            
            // Tipo da nota
            const noteType = isGeneral ? 'Nota Geral' : 'Nota Associada';
            doc.setTextColor(noteColor[0], noteColor[1], noteColor[2]);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`${noteType}: ${note.title || 'Sem título'}`, margin + 10, yPosition + 8);
            yPosition += 12;
            
            // Conteúdo da nota
            doc.setTextColor(107, 114, 128);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`   ${note.content}`, margin + 10, yPosition);
            yPosition += 10;
            
            // Se for nota associada, mostrar a qual tarefa
            if (!isGeneral && note.task_id) {
              const associatedTask = sortedTasks.find(t => t.id === note.task_id.toString());
              if (associatedTask) {
                doc.setTextColor(59, 130, 246);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.text(`   Vinculada a tarefa: ${associatedTask.title}`, margin + 10, yPosition);
                yPosition += 8;
              }
            }
            
            yPosition += 8;
          }
          
          yPosition += 5;
        }
      }
      
      // Adicionar rodapé em todas as páginas
      const totalPages = (doc as any).getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Número da página
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, 290, { align: 'center' });
        
        // Data de geração
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, 290);
      }
      
      // Salvar o PDF
      const fileName = `relatorio_${companyName || 'calendario'}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      console.log('PDF gerado com sucesso:', fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-marketing-primary" />
              {companyName ? `Relatório - ${companyName}` : 'Relatório do Mês'}
              {calendarMonth && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({calendarMonth})
                </span>
              )}
            </DialogTitle>
            <Button 
              onClick={generatePDFReport} 
              disabled={isGeneratingPDF}
              size="sm"
              className="text-white transition-colors duration-200 bg-blue-500 hover:bg-[#14225A] mr-8"
            >
              {isGeneratingPDF ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Relatório
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Geral */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-status-completed" />
                  Executados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-status-completed">{completedTasks.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-status-pending" />
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-status-pending">{pendingTasks.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-status-overdue" />
                  Atrasados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-status-overdue">{overdueTasks.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Taxa de Execução */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Taxa de Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-marketing-primary">{getCompletionRate()}%</div>
                <div className="text-sm text-muted-foreground">
                  {completedTasks.length} de {filteredTasks.length} tarefas executadas
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-marketing-primary h-2 rounded-full transition-all" 
                  style={{ width: `${getCompletionRate()}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Tarefas por Status */}
          <div className="space-y-3">
            {/* Títulos das colunas */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Nome das tarefas</span>
              </div>
              <div className="text-sm font-semibold text-gray-700">Data das tarefas</div>
            </div>
            
            {/* Lista de tarefas */}
            <div className="grid grid-cols-1 gap-4 max-h-60 overflow-y-auto">
              {sortedTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="font-medium">Nenhuma tarefa encontrada</p>
                  <p className="text-sm">Este calendário ainda não possui tarefas para relatório.</p>
                </div>
              ) : (
                sortedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={
                        task.status === 'completed' ? 'bg-status-completed/20 text-status-completed' :
                        task.status === 'pending' ? 'bg-status-pending/20 text-status-pending' :
                        'bg-status-overdue/20 text-status-overdue'
                      }
                    >
                      {task.status === 'completed' ? 'Executado' : 
                       task.status === 'pending' ? 'Pendente' : 'Atrasado'}
                    </Badge>
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {task.date.toLocaleDateString('pt-BR')}
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};