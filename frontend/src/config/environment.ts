// Configuração de ambiente (DEV/PROD)
// Lê das variáveis do Vite quando disponível e possui fallbacks seguros
const VITE_API_URL = (import.meta as any)?.env?.VITE_API_URL as string | undefined;

// Fallbacks:
// - Se VITE_API_URL existir, usa ela
// - Caso contrário, tenta usar a origem atual + "/api"
// - Em último caso, usa localhost de desenvolvimento
const resolvedApiBaseUrl =
  VITE_API_URL?.replace(/\/$/, '') ||
  `${window.location.origin.replace(/\/$/, '')}/api` ||
  'http://localhost:3001/api';

const resolvedFrontendUrl = ((): string => {
  // Se estiver rodando no navegador, usa a origem atual
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  // Fallback para dev
  return 'http://localhost:8080';
})();

export const ENVIRONMENT = {
  API_BASE_URL: resolvedApiBaseUrl,
  FRONTEND_URL: resolvedFrontendUrl,
  BACKEND_PORT: '3001',
  FRONTEND_PORT: '8080'
};

// URL base da API (ambiente resolvido)
export const getApiBaseUrl = () => {
  return ENVIRONMENT.API_BASE_URL;
};

// URL base do frontend (ambiente resolvido)
export const getFrontendUrl = () => {
  return ENVIRONMENT.FRONTEND_URL;
};

// Configurações do ambiente
export const getEnvironmentConfig = () => {
  return ENVIRONMENT;
};
