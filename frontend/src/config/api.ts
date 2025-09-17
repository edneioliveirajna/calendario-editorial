// Configuração da API - Node.js/PostgreSQL
import { getApiBaseUrl } from './environment';

// URL base da API (Node.js na porta 3001)
export const API_BASE_URL = getApiBaseUrl();

// Endpoints da API (Node.js)
export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
  },
  
  // Calendários
  CALENDARS: {
    CREATE: `${API_BASE_URL}/calendars`,
    READ: `${API_BASE_URL}/calendars`,
    UPDATE: `${API_BASE_URL}/calendars`,
    DELETE: `${API_BASE_URL}/calendars`,
    LIST: `${API_BASE_URL}/calendars`,
  },
  
  // Tarefas
  TASKS: {
    CREATE: `${API_BASE_URL}/tasks`,
    READ: `${API_BASE_URL}/tasks`,
    READ_BY_CALENDAR: `${API_BASE_URL}/tasks/calendar`,
    UPDATE: `${API_BASE_URL}/tasks`,
    DELETE: `${API_BASE_URL}/tasks`,
    MOVE: `${API_BASE_URL}/tasks`,
  },
  
  // Notas
  NOTES: {
    CREATE: `${API_BASE_URL}/notes`,
    READ: `${API_BASE_URL}/notes`,
    UPDATE: `${API_BASE_URL}/notes`,
    DELETE: `${API_BASE_URL}/notes`,
  },
};

// Função para construir URLs com query parameters
export function buildApiUrl(endpoint: string, params: Record<string, any> = {}): string {
  const url = new URL(endpoint);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, value.toString());
    }
  });
  
  return url.toString();
}

// Função para obter headers de autenticação
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
  
  return {
    'Content-Type': 'application/json'
  };
}

// Função para fazer requisições HTTP
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const defaultOptions: RequestInit = {
    headers: getAuthHeaders(),
    ...options
  };

  // DEBUG: Verificar opções sendo enviadas
  console.log('🔍 apiRequest DEBUG:');
  console.log('   URL:', url);
  console.log('   Headers:', defaultOptions.headers);
  console.log('   Method:', defaultOptions.method);
  console.log('   Body:', defaultOptions.body);

  try {
    const response = await fetch(url, defaultOptions);
    
    // DEBUG: Verificar resposta
    console.log('📥 Resposta recebida:');
    console.log('   Status:', response.status);
    console.log('   OK:', response.ok);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log('📥 Dados da resposta:', responseData);
    return responseData;
  } catch (error) {
    console.error('❌ Erro na requisição API:', error);
    throw error;
  }
}

// Funções específicas para cada método HTTP
export async function apiGet(url: string): Promise<any> {
  return apiRequest(url, { method: 'GET' });
}

export async function apiPost(url: string, data: any): Promise<any> {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function apiPut(url: string, data: any): Promise<any> {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function apiDelete(url: string): Promise<any> {
  return apiRequest(url, { method: 'DELETE' });
} 