// Configuração da API para diferentes ambientes
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000',
    timeout: 10000
  },
  production: {
    baseURL: process.env.VITE_API_URL || 'https://api-back-xi.vercel.app',
    timeout: 15000
  }
};

// Selecionar configuração baseada no ambiente
const currentEnv = import.meta.env.MODE || 'development';
const config = API_CONFIG[currentEnv];

// Configuração padrão do axios
export const apiConfig = {
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Função para obter token do localStorage
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Função para configurar headers de autenticação
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// URLs das rotas da API
export const API_ROUTES = {
  // Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify'
  },
  
  // Calendários
  CALENDARS: {
    LIST: '/calendars',
    CREATE: '/calendars',
    UPDATE: (id) => `/calendars/${id}`,
    DELETE: (id) => `/calendars/${id}`,
    SHARE: (id) => `/calendars/${id}/share`
  },
  
  // Tarefas
  TASKS: {
    LIST: '/tasks',
    READ: '/tasks',
    CREATE: '/tasks',
    UPDATE: (id) => `/tasks/${id}`,
    DELETE: (id) => `/tasks/${id}`,
    COMPLETE: (id) => `/tasks/${id}/complete`
  },
  
  // Notas
  NOTES: {
    LIST: '/notes',
    CREATE: '/notes',
    UPDATE: (id) => `/notes/${id}`,
    DELETE: (id) => `/notes/${id}`
  },
  
  // Compartilhamento
  SHARING: {
    SHARE: '/sharing/share',
    ACCEPT: '/sharing/accept',
    DECLINE: '/sharing/decline'
  }
};

// Função para construir URL completa
export const buildApiUrl = (route) => {
  return `${config.baseURL}${route}`;
};

// Função para fazer requisições com tratamento de erro
export const apiRequest = async (url, options = {}) => {
  console.log('🚀 API REQUEST: Iniciando requisição para:', url);
  console.log('🔑 API REQUEST: Token disponível:', !!getAuthToken());
  console.log('🔑 API REQUEST: Headers de auth:', getAuthHeaders());
  console.log('🌐 API REQUEST: URL base:', config.baseURL);
  
  try {
    // Construir URL completa se for relativa
    const fullUrl = url.startsWith('http') ? url : `${config.baseURL}${url}`;
    console.log('🌐 API REQUEST: URL completa:', fullUrl);
    
    const requestHeaders = {
      ...apiConfig.headers,
      ...getAuthHeaders(),
      ...options.headers
    };
    console.log('📋 API REQUEST: Headers finais:', requestHeaders);
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: requestHeaders
    });

    console.log('📡 API REQUEST: Resposta recebida, status:', response.status);
    console.log('📡 API REQUEST: Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('❌ API REQUEST: Erro HTTP:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ API REQUEST: Corpo do erro:', errorText);
      
      // Detectar erros de permissão (403)
      if (response.status === 403) {
        const errorData = JSON.parse(errorText);
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.isPermissionError = true;
        error.permissionMessage = errorData.message || 'Você não tem permissão para realizar essa ação. Verifique com o administrador do calendário.';
        throw error;
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('✅ API REQUEST: Dados da resposta:', responseData);
    return responseData;
  } catch (error) {
    console.error('❌ API REQUEST: Erro capturado:', error);
    throw error;
  }
};

export default apiConfig;
