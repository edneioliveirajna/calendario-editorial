import { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';
import { getApiBaseUrl } from '../config/environment';

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

interface UseCalendarSharesReturn {
  hasShares: boolean;
  sharesCount: number;
  isLoading: boolean;
  error: string | null;
  refreshShares: () => void;
}

export const useCalendarShares = (calendarId: number | null): UseCalendarSharesReturn => {
  const [hasShares, setHasShares] = useState(false);
  const [sharesCount, setSharesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShares = async () => {
    if (!calendarId) {
      setHasShares(false);
      setSharesCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/sharing/calendar/${calendarId}`;
      const response = await apiRequest(url);
      
      const shares = response.shares || [];
      const count = shares.length;
      
      setHasShares(count > 0);
      setSharesCount(count);
    } catch (err) {
      console.error('Erro ao buscar compartilhamentos:', err);
      setError('Erro ao verificar compartilhamentos');
      // Em caso de erro, mantém o estado anterior para não quebrar a UI
    } finally {
      setIsLoading(false);
    }
  };

  const refreshShares = () => {
    fetchShares();
  };

  useEffect(() => {
    fetchShares();
  }, [calendarId]);

  return {
    hasShares,
    sharesCount,
    isLoading,
    error,
    refreshShares
  };
};
