// Configuração de ambiente - APENAS DESENVOLVIMENTO
export const ENVIRONMENT = {
  // Desenvolvimento local
  API_BASE_URL: 'http://localhost:3001/api',
  FRONTEND_URL: 'http://localhost:8080',
  BACKEND_PORT: '3001',
  FRONTEND_PORT: '8080'
};

// URL base da API (sempre desenvolvimento)
export const getApiBaseUrl = () => {
  return ENVIRONMENT.API_BASE_URL;
};

// URL base do frontend (sempre desenvolvimento)
export const getFrontendUrl = () => {
  return ENVIRONMENT.FRONTEND_URL;
};

// Configurações do ambiente
export const getEnvironmentConfig = () => {
  return ENVIRONMENT;
};
