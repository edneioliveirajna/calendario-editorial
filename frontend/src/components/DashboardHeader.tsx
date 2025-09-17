import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Calendar, LogOut, User, Settings, X, Mail, Lock, Trash2, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados para o modal de configurações
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateProfile = async () => {
    if (!formData.currentPassword) {
      toast({
        title: "⚠️ Atenção",
        description: "Digite sua senha atual para confirmar as alterações!",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "❌ Erro",
        description: "As senhas não coincidem!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Aqui você implementaria a lógica de atualização
      // Por enquanto, vamos simular
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "✅ Sucesso!",
        description: "Perfil atualizado com sucesso!",
      });
      
      setShowSettingsModal(false);
      setFormData({
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Falha ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!formData.currentPassword) {
      toast({
        title: "⚠️ Atenção",
        description: "Digite sua senha para confirmar a exclusão!",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita!')) {
      return;
    }

    setIsLoading(true);
    try {
      // Aqui você implementaria a lógica de exclusão
      // Por enquanto, vamos simular
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "✅ Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
      });
      
      logout();
      navigate('/login');
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Falha ao excluir conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Título */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-[#14225A] to-[#FE306B] rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  PLANIT GLOW
                </h1>
              </div>
            </div>
          </div>

          {/* Menu do Usuário */}
          <div className="flex items-center space-x-4">
            {/* Informações do Usuário */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.company_name}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email}
              </p>
            </div>

            {/* Dropdown do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#14225A] to-[#FE306B] rounded-full flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.company_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowSettingsModal(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Modal de Configurações */}
      {showSettingsModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setShowSettingsModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-[#14225A]/10 to-[#FE306B]/10 px-6 py-4 rounded-t-lg border-b border-[#FE306B]/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#14225A] flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações da Conta
                </h3>
                <Button
                  onClick={() => setShowSettingsModal(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-4">
              {/* Email */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border border-gray-200 focus:outline-none focus:ring-0 focus:border-[#14225A]"
                />
              </div>

              {/* Senha Atual */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Senha Atual
                </Label>
                <Input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Digite sua senha atual"
                  className="border border-gray-200 focus:outline-none focus:ring-0 focus:border-[#14225A]"
                />
              </div>

              {/* Nova Senha */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Nova Senha (opcional)
                </Label>
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Deixe em branco para manter a atual"
                  className="border border-gray-200 focus:outline-none focus:ring-0 focus:border-[#14225A]"
                />
              </div>

              {/* Confirmar Nova Senha */}
              {formData.newPassword && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Confirmar Nova Senha
                  </Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirme a nova senha"
                    className="border border-gray-200 focus:outline-none focus:ring-0 focus:border-[#14225A]"
                  />
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className="flex-1 bg-[#14225A] hover:bg-[#1a2d6b] text-white font-bold"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  variant="destructive"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isLoading ? "Excluindo..." : "Excluir Conta"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
