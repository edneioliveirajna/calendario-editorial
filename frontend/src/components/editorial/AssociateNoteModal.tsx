import React, { useState, useEffect } from 'react';
import { X, FileText, Link, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useNotes, Note } from '../../hooks/use-notes';
import { useToast } from '../../hooks/use-toast';
import { CalendarTask } from '../../types/calendar';

interface AssociateNoteModalProps {
  open: boolean;
  onClose: () => void;
  task: CalendarTask | null;
  currentCalendarId?: number;
}

export const AssociateNoteModal: React.FC<AssociateNoteModalProps> = ({ 
  open, 
  onClose, 
  task, 
  currentCalendarId 
}) => {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [existingNotes, setExistingNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  
  const { 
    notes, 
    loading, 
    fetchTaskNotes, 
    createTaskNote, 
    updateNote 
  } = useNotes();
  
  const { toast } = useToast();

  // Carregar notas existentes da tarefa quando o modal abrir
  useEffect(() => {
    if (open && task && currentCalendarId) {
      fetchTaskNotes(task.id);
    }
  }, [open, task, currentCalendarId, fetchTaskNotes]);

  // Filtrar notas da tarefa atual
  useEffect(() => {
    if (task) {
      const taskNotes = notes.filter(note => note.task_id === parseInt(task.id));
      setExistingNotes(taskNotes);
    }
  }, [notes, task]);

  const handleCreateNote = async () => {
    if (!task || !currentCalendarId || !noteTitle.trim()) {
      toast({
        title: "⚠️ Atenção",
        description: "Título da nota é obrigatório!",
      });
      return;
    }

    const success = await createTaskNote(
      noteTitle.trim(), 
      noteContent.trim(), 
      parseInt(task.id), 
      currentCalendarId
    );

    if (success) {
      setNoteTitle('');
      setNoteContent('');
      toast({
        title: "✅ Sucesso!",
        description: "Nota associada à tarefa com sucesso!",
      });
    }
  };

  const handleAssociateExistingNote = async () => {
    if (!selectedNoteId || !task || !currentCalendarId) {
      toast({
        title: "⚠️ Atenção",
        description: "Selecione uma nota para associar!",
      });
      return;
    }

    const selectedNote = notes.find(note => note.id === selectedNoteId);
    if (!selectedNote) return;

    const success = await updateNote(selectedNoteId, {
      task_id: parseInt(task.id),
      calendar_id: currentCalendarId,
      is_general: false
    });

    if (success) {
      setSelectedNoteId(null);
      toast({
        title: "✅ Sucesso!",
        description: "Nota associada à tarefa com sucesso!",
      });
    }
  };

  const handleClose = () => {
    setNoteTitle('');
    setNoteContent('');
    setSelectedNoteId(null);
    onClose();
  };

  if (!open || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Link className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Associar Nota à Tarefa
              </h2>
              <p className="text-sm text-gray-600">
                {task.title}
              </p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seção 1: Criar Nova Nota */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-3">
              <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Criar Nova Nota para esta Tarefa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  ✏️ Título da Nota
                </label>
                <Input
                  placeholder="Ex: Observações importantes"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
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
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[80px] border border-blue-200 focus:outline-none focus:ring-0 focus:border-blue-400"
                />
              </div>
              
              <Button
                onClick={handleCreateNote}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold"
                disabled={!noteTitle.trim()}
              >
                💾 Criar e Associar Nota
              </Button>
            </CardContent>
          </Card>

          {/* Seção 2: Associar Nota Existente */}
          <Card className="border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
              <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
                <Link className="h-5 w-5" />
                Associar Nota Existente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  📝 Selecione uma Nota
                </label>
                <select
                  value={selectedNoteId || ''}
                  onChange={(e) => setSelectedNoteId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-2 border border-green-200 rounded-lg focus:outline-none focus:ring-0 focus:border-green-400"
                >
                  <option value="">Selecione uma nota...</option>
                  {notes
                    .filter(note => note.is_general && !note.task_id) // Apenas notas gerais não associadas
                    .map(note => (
                      <option key={note.id} value={note.id}>
                        {note.title} - {new Date(note.created_at).toLocaleDateString('pt-BR')}
                      </option>
                    ))}
                </select>
              </div>
              
              {selectedNoteId && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Nota selecionada:</strong> {notes.find(n => n.id === selectedNoteId)?.title}
                  </p>
                </div>
              )}
              
              <Button
                onClick={handleAssociateExistingNote}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
                disabled={!selectedNoteId}
              >
                🔗 Associar Nota Selecionada
              </Button>
            </CardContent>
          </Card>

          {/* Seção 3: Notas Já Associadas */}
          {existingNotes.length > 0 && (
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-3">
                <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Notas Já Associadas ({existingNotes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {existingNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800">{note.title}</h4>
                    {note.content && (
                      <p className="text-sm text-purple-700 mt-1">{note.content}</p>
                    )}
                    <p className="text-xs text-purple-600 mt-2">
                      Criada em: {new Date(note.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
