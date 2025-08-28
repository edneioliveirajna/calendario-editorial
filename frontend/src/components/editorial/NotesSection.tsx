import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, FileText, X, Link } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useNotes, Note } from '../../hooks/use-notes';
import { useToast } from '../../hooks/use-toast';

interface NotesSectionProps {
  currentCalendarId?: number;
  companyName?: string;
  tasks?: Array<{ id: string; title: string }> | undefined;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ 
  currentCalendarId, 
  companyName,
  tasks 
}) => {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const { 
    notes, 
    loading, 
    fetchNotes,
    updateNote, 
    deleteNote 
  } = useNotes();
  
  const { toast } = useToast();

  // Função para navegar até a tarefa no calendário
  const navigateToTask = (taskId: number) => {
    // Buscar a tarefa no estado atual
    const task = tasks?.find(t => t.id === taskId.toString());
    
    if (task) {
      // Mostrar toast de navegação
      toast({
        title: "🔗 Navegando...",
        description: `Indo para a tarefa: ${task.title}`,
      });
      
      // Emitir evento customizado para destacar a tarefa no calendário
      const highlightEvent = new CustomEvent('highlightTask', {
        detail: {
          taskId: taskId,
          taskTitle: task.title
        }
      });
      
      // Disparar o evento para o componente pai (Index.tsx)
      window.dispatchEvent(highlightEvent);
      
      // Fechar o tooltip
      setHoveredTaskId(null);
    } else {
      toast({
        title: "❌ Erro",
        description: "Tarefa não encontrada no calendário atual",
        variant: "destructive",
      });
    }
  };

  // Carregar todas as notas (gerais + do calendário) quando o componente montar
  useEffect(() => {
    if (currentCalendarId) {
      // Buscar notas gerais E notas do calendário
      fetchNotes({ calendar_id: currentCalendarId });
    }
  }, [currentCalendarId, fetchNotes]);

  // Escutar evento de recarregamento de notas (quando uma tarefa é excluída)
  useEffect(() => {
    const handleReloadNotes = (event: CustomEvent) => {
      const { calendarId } = event.detail;
      if (calendarId === currentCalendarId) {
        console.log('🔄 Recarregando notas após exclusão de tarefa...');
        fetchNotes({ calendar_id: currentCalendarId });
      }
    };

    // Adicionar listener para o evento customizado
    window.addEventListener('reloadNotes', handleReloadNotes as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('reloadNotes', handleReloadNotes as EventListener);
    };
  }, [currentCalendarId, fetchNotes]);

  const handleUpdateNote = async () => {
    if (!editingNote || !noteTitle.trim()) {
      toast({
        title: "⚠️ Atenção",
        description: "O título da nota é obrigatório!",
      });
      return;
    }

    const updatedNote = await updateNote(editingNote.id, {
      title: noteTitle.trim(),
      content: noteContent.trim(),
      // Preservar campos importantes para manter a associação
      task_id: editingNote.task_id,
      calendar_id: editingNote.calendar_id,
      is_general: editingNote.is_general,
      date: editingNote.date
    });

    if (updatedNote) {
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
      setShowEditModal(false);
      
      // ✅ NOVO: Recarregar notas para manter permissões e botões visíveis
      if (currentCalendarId) {
        console.log('🔄 Recarregando notas após edição para manter permissões...');
        fetchNotes({ calendar_id: currentCalendarId });
      }
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    const success = await deleteNote(noteId);
    if (success) {
      // ✅ NOVO: Recarregar notas após exclusão para manter estado sincronizado
      if (currentCalendarId) {
        console.log('🔄 Recarregando notas após exclusão...');
        fetchNotes({ calendar_id: currentCalendarId });
      }
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowEditModal(true);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setShowEditModal(false);
  };

  // Mostrar todas as notas (gerais + associadas a tarefas)
  const allNotes = notes;

  return (
    <div className="mt-8 space-y-4">
      {/* Cabeçalho da Seção */}
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">
          📝 Notas do Mês - {companyName || 'Calendário'}
        </h2>
      </div>

      {/* Modal de Edição */}
      {showEditModal && editingNote && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={(e) => {
            // Verificar se existe texto selecionado no momento do clique
            const selection = window.getSelection();
            const hasActiveSelection = selection && selection.toString().length > 0;
            
            // Só fechar se não há seleção ativa
            if (!hasActiveSelection) {
              cancelEditing();
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 rounded-t-lg border-b border-purple-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Editar Nota
                </h3>
                <Button
                  onClick={cancelEditing}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-purple-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  ✏️ Título da Nota
                </label>
                <Input
                  placeholder="Ex: Reunião de planejamento"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value.toUpperCase())}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.value.length > 0) {
                      target.value = target.value.charAt(0).toUpperCase() + target.value.slice(1).toLowerCase();
                    }
                  }}
                  className="border border-purple-200 focus:outline-none focus:ring-0 focus:border-purple-400"
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
                    if (value.length > 0) {
                      setNoteContent(value.charAt(0).toUpperCase() + value.slice(1));
                    } else {
                      setNoteContent(value);
                    }
                  }}
                  className="min-h-[100px] border border-purple-200 focus:outline-none focus:ring-0 focus:border-purple-400"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleUpdateNote}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold"
                >
                  💾 Atualizar Nota
                </Button>
                <Button
                  onClick={cancelEditing}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  ❌ Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Notas */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando notas...</p>
          </div>
        ) : allNotes.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Nenhuma nota criada</p>
              <p className="text-gray-500 text-sm">Clique em "Nova Nota" para criar sua primeira nota do mês!</p>
            </CardContent>
          </Card>
        ) : (
          allNotes.map((note) => (
            <Card key={note.id} className="border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">
                      {note.title}
                    </h3>
                    {note.content && (
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">
                        {note.content}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {note.updated_at !== note.created_at && (
                        <span className="flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          Editada em {new Date(note.updated_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {!note.is_general && note.task_id && (
                        <div className="relative">
                          <span 
                            className="flex items-center gap-1 text-green-600 font-medium cursor-pointer hover:text-green-700 transition-colors"
                            onMouseEnter={() => setHoveredTaskId(note.task_id)}
                            onMouseLeave={() => setHoveredTaskId(null)}
                            onClick={() => navigateToTask(note.task_id)}
                            title="Clique para ver no calendário"
                          >
                            <Link className="h-3 w-3" />
                            {hoveredTaskId === note.task_id ? "Ver no calendário" : "Associada a tarefa"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {/* Botão Editar - só mostra se pode editar */}
                    {(note.is_calendar_owner || note.can_edit) && (
                      <Button
                        onClick={() => startEditing(note)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {/* Botão Excluir - só mostra se pode excluir */}
                    {(note.is_calendar_owner || note.can_delete) && (
                      <Button
                        onClick={() => handleDeleteNote(note.id)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
