import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getApiBaseUrl } from '@/config/environment';

// Tipos
interface User {
  id: number;
  email: string;
  company_name: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, companyName: string) => Promise<{ success: boolean; error?: string }>;
}

// Contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há usuário logado ao carregar
  useEffect(() => {
    console.log('🚀 useAuth: useEffect executado, chamando checkAuthStatus...');
    checkAuthStatus();
  }, []);

  // Verificar status de autenticação
  const checkAuthStatus = async () => {
    try {
      console.log('🔍 AUTH: Verificando status de autenticação...');
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('authUser');
      
      console.log('🔑 AUTH: Token encontrado:', !!token);
      console.log('🔑 AUTH: Token valor:', token ? token.substring(0, 50) + '...' : 'null');
      console.log('👤 AUTH: Usuário salvo:', !!savedUser);
      console.log('👤 AUTH: Usuário valor:', savedUser);
      
      if (token && savedUser) {
        // Tentar restaurar usuário do localStorage primeiro
        try {
          const user = JSON.parse(savedUser);
          console.log('✅ Usuário restaurado do localStorage:', user);
          setUser(user);
          setIsLoading(false);
          
          // Verificar token em background (opcional)
          verifyTokenInBackground(token);
        } catch (error) {
          console.error('❌ Erro ao restaurar usuário do localStorage:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setIsLoading(false);
        }
      } else {
        console.log('❌ Nenhum dado de autenticação encontrado');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      setIsLoading(false);
    }
  };

  // Verificar token em background (sem bloquear a UI)
  const verifyTokenInBackground = async (token: string) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // Atualizar usuário se necessário
          setUser(data.user);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        } else {
          // Token inválido, limpar estado e fazer logout
          console.log('❌ Token inválido, limpando estado...');
          localStorage.removeItem('selectedCalendarId');
          logout();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar token em background:', error);
      // Não fazer logout por erro de rede, manter usuário logado
    }
  };

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Limpar estado anterior antes de salvar novo
        console.log('🧹 Limpando estado anterior...');
        localStorage.removeItem('selectedCalendarId');
        
        // Salvar token e dados do usuário
        console.log('✅ Login bem-sucedido, salvando dados...');
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        console.log('💾 Dados salvos no localStorage');
        setUser(data.user);
        return true;
      } else {
        console.error('❌ Erro no login:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  // Função de registro
  const register = async (email: string, password: string, companyName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          company_name: companyName
        })
      });

      const data = await response.json();

      if (data.success) {
        // Limpar estado anterior antes de salvar novo
        console.log('🧹 Limpando estado anterior...');
        localStorage.removeItem('selectedCalendarId');
        
        // Salvar token e dados do usuário
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      } else {
        console.error('Erro no registro:', data.error);
        // Retornar mensagem específica do backend
        return { 
          success: false, 
          error: data.message || data.error || 'Erro desconhecido no registro'
        };
      }
    } catch (error) {
      console.error('Erro ao fazer registro:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique se o servidor está rodando.'
      };
    }
  };

  // Função de logout
  const logout = () => {
    console.log('🚪 Fazendo logout, limpando localStorage...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    // Limpar também o calendário selecionado
    localStorage.removeItem('selectedCalendarId');
    
    setUser(null);
    console.log('🧹 localStorage limpo');
    
    // Não forçar reload - deixar o React Router lidar com a navegação
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
