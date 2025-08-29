// Configuração da API para diferentes ambientes
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000',
    timeout: 10000
  },
  production: {
    baseURL: process.env.VITE_API_URL || 'https://api-back-rosy.vercel.app',
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
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...apiConfig.headers,
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export default apiConfig;
