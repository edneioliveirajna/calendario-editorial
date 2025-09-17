import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Share2, User, Mail, Calendar, X, Trash2 } from "lucide-react";
import { apiRequest } from '../../config/api';
import { getApiBaseUrl } from '../../config/environment';

interface ShareCalendarModalProps {
  open: boolean;
  onClose: () => void;
  calendarId: number;
  calendarName: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Share {
  id: number;
  shared_with_id: number;
  user_name: string;
  email: string;
  can_edit: boolean;
  can_delete: boolean;
  can_share: boolean;
  shared_at: string;
}

export const ShareCalendarModal = ({ open, onClose, calendarId, calendarName }: ShareCalendarModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState({
    can_edit: true,
    can_delete: true,
    can_share: false
  });
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  // Estados para edição de permissões
  const [editingShare, setEditingShare] = useState<Share | null>(null);
  const [editPermissions, setEditPermissions] = useState({
    can_edit: false,
    can_delete: false,
    can_share: false
  });
  const [updatingPermissions, setUpdatingPermissions] = useState(false);

  // Verificar se o calendário é válido
  const isValidCalendar = calendarId > 0 && calendarName;

  // Carregar compartilhamentos existentes
  useEffect(() => {
    if (open && isValidCalendar) {
      loadShares();
    }
  }, [open, isValidCalendar]);

  // Buscar usuários
  useEffect(() => {
    console.log('🔍 useEffect searchUsers:', { searchQuery, isValidCalendar, searchQueryLength: searchQuery.length });
    
    if (searchQuery.length >= 2 && isValidCalendar) {
      console.log('⏰ Iniciando busca em 300ms...');
      const timeoutId = setTimeout(() => {
        console.log('🚀 Executando busca para:', searchQuery);
        searchUsers();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      console.log('🧹 Limpando resultados da busca');
      setSearchResults([]);
    }
  }, [searchQuery, isValidCalendar]);

  const loadShares = async () => {
    if (!isValidCalendar) return;
    
    try {
      console.log('📋 Carregando compartilhamentos para calendário:', calendarId);
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/sharing/calendar/${calendarId}`;
      const response = await apiRequest(url);
      console.log('📋 Compartilhamentos carregados:', response);
      setShares(response.shares || []);
    } catch (error) {
      console.error('❌ Erro ao carregar compartilhamentos:', error);
    }
  };

  const searchUsers = async () => {
    if (searchQuery.length < 2 || !isValidCalendar) {
      console.log('❌ Busca cancelada:', { searchQueryLength: searchQuery.length, isValidCalendar });
      return;
    }
    
    console.log('🔍 Iniciando busca de usuários para:', searchQuery);
    setSearching(true);
    try {
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/sharing/search-users?query=${encodeURIComponent(searchQuery)}`;
      console.log('🌐 URL da busca:', url);
      
      const response = await apiRequest(url);
      console.log('✅ Resposta da busca:', response);
      
      setSearchResults(response.users || []);
      console.log('👥 Usuários encontrados:', response.users?.length || 0);
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const shareCalendar = async () => {
    if (!selectedUser || !isValidCalendar) return;

    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/sharing/share`;
      
      await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          calendarId,
          userEmail: selectedUser.email,
          permissions
        })
      });

      // Recarregar compartilhamentos
      await loadShares();
      
      // Limpar seleção
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
      
      // Resetar permissões
      setPermissions({
        can_edit: true,
        can_delete: true,
        can_share: false
      });
    } catch (error) {
      console.error('Erro ao compartilhar calendário:', error);
      alert('Erro ao compartilhar calendário. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const removeShare = async (shareId: number) => {
    if (!confirm('Tem certeza que deseja remover este compartilhamento?') || !isValidCalendar) return;

    try {
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/sharing/share/${shareId}`;
      
      await apiRequest(url, {
        method: 'DELETE'
      });
      
      // Recarregar compartilhamentos
      await loadShares();
    } catch (error) {
      console.error('Erro ao remover compartilhamento:', error);
      alert('Erro ao remover compartilhamento. Verifique o console para mais detalhes.');
    }
  };

  // Função para iniciar edição de permissões
  const startEditPermissions = (share: Share) => {
    setEditingShare(share);
    setEditPermissions({
      can_edit: share.can_edit,
      can_delete: share.can_delete,
      can_share: share.can_share
    });
  };

  // Função para cancelar edição
  const cancelEditPermissions = () => {
    setEditingShare(null);
    setEditPermissions({
      can_edit: false,
      can_delete: false,
      can_share: false
    });
  };

  // Função para atualizar permissões
  const updatePermissions = async () => {
    if (!editingShare || !isValidCalendar) return;

    setUpdatingPermissions(true);
    try {
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/sharing/share/${editingShare.id}`;
      
      await apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          permissions: editPermissions
        })
      });
      
      // Recarregar compartilhamentos
      await loadShares();
      
      // Limpar estado de edição
      setEditingShare(null);
      setEditPermissions({
        can_edit: false,
        can_delete: false,
        can_share: false
      });
      
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      alert('Erro ao atualizar permissões. Verifique o console para mais detalhes.');
    } finally {
      setUpdatingPermissions(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            Compartilhar Calendário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Calendário */}
          {isValidCalendar ? (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                  <Calendar className="h-4 w-4" />
                  {calendarName}
                </CardTitle>
              </CardHeader>
            </Card>
          ) : (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-yellow-800">
                  <Calendar className="h-4 w-4" />
                  Calendário não selecionado
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-yellow-700">
                  Crie ou selecione um calendário para poder compartilhá-lo.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Buscar Usuário */}
          {isValidCalendar && (
            <div className="space-y-3">
              <Label htmlFor="user-search">Buscar usuário para compartilhar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="user-search"
                  placeholder="Digite o nome ou email do usuário..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Status da busca */}
              {searchQuery.length > 0 && (
                <div className="text-sm text-gray-600">
                  {searchQuery.length < 2 ? (
                    <span className="text-yellow-600">Digite pelo menos 2 caracteres para buscar</span>
                  ) : searching ? (
                    <span className="text-blue-600">Buscando usuários...</span>
                  ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                    <span className="text-gray-500">Nenhum usuário encontrado</span>
                  ) : searchResults.length > 0 ? (
                    <span className="text-green-600">{searchResults.length} usuário(s) encontrado(s)</span>
                  ) : null}
                </div>
              )}

            {/* Resultados da busca */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedUser?.id === user.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

                         {/* Usuário selecionado */}
             {selectedUser && (
               <Card className="border-green-200 bg-green-50">
                 <CardContent className="p-3">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <User className="h-4 w-4 text-green-600" />
                       <div>
                         <div className="font-medium text-green-800">{selectedUser.name}</div>
                         <div className="text-sm text-green-600">{selectedUser.email}</div>
                       </div>
                     </div>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => setSelectedUser(null)}
                     >
                       <X className="h-4 w-4" />
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             )}
           </div>
          )}

          {/* Permissões */}
          {isValidCalendar && selectedUser && (
            <div className="space-y-3">
              <Label>Permissões de acesso</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can-edit"
                    checked={permissions.can_edit}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, can_edit: checked as boolean }))
                    }
                  />
                  <Label htmlFor="can-edit">Pode editar tarefas e notas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can-delete"
                    checked={permissions.can_delete}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, can_delete: checked as boolean }))
                    }
                  />
                  <Label htmlFor="can-delete">Pode deletar tarefas e notas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can-share"
                    checked={permissions.can_share}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, can_share: checked as boolean }))
                    }
                  />
                  <Label htmlFor="can-share">Pode compartilhar com outros usuários</Label>
                </div>
              </div>

              <Button
                onClick={shareCalendar}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Compartilhando..." : "Compartilhar Calendário"}
              </Button>
            </div>
          )}

          {/* Lista de Compartilhamentos */}
          {isValidCalendar && shares.length > 0 && (
            <div className="space-y-3">
              <Label>Usuários com acesso compartilhado</Label>
              <div className="space-y-2">
                {shares.map((share) => (
                  <Card key={share.id} className="border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{share.user_name}</div>
                            <div className="text-sm text-gray-500">{share.email}</div>
                            <div className="text-xs text-gray-400">
                              Compartilhado em: {formatDate(share.shared_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditPermissions(share)}
                              className="text-xs h-7 px-2"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeShare(share.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Modal de Edição de Permissões */}
      <Dialog open={!!editingShare} onOpenChange={() => cancelEditPermissions()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Editar Permissões
            </DialogTitle>
          </DialogHeader>

          {editingShare && (
            <div className="space-y-4">
              {/* Informações do usuário */}
              <Card className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{editingShare.user_name}</div>
                      <div className="text-sm text-gray-500">{editingShare.email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissões */}
              <div className="space-y-3">
                <Label>Permissões de acesso</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-can-edit"
                      checked={editPermissions.can_edit}
                      onCheckedChange={(checked) => 
                        setEditPermissions(prev => ({ ...prev, can_edit: checked as boolean }))
                      }
                    />
                    <Label htmlFor="edit-can-edit">Pode editar tarefas e notas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-can-delete"
                      checked={editPermissions.can_delete}
                      onCheckedChange={(checked) => 
                        setEditPermissions(prev => ({ ...prev, can_delete: checked as boolean }))
                      }
                    />
                    <Label htmlFor="edit-can-delete">Pode deletar tarefas e notas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-can-share"
                      checked={editPermissions.can_share}
                      onCheckedChange={(checked) => 
                        setEditPermissions(prev => ({ ...prev, can_share: checked as boolean }))
                      }
                    />
                    <Label htmlFor="edit-can-share">Pode compartilhar com outros usuários</Label>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={cancelEditPermissions}
                  disabled={updatingPermissions}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={updatePermissions}
                  disabled={updatingPermissions}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updatingPermissions ? "Atualizando..." : "Salvar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
