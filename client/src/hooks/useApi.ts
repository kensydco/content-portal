import { useState, useCallback } from 'react';
import { api } from '../utils/api';
import { useToast } from './useToast';

export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();

  const execute = useCallback(
    async (apiCall: () => Promise<{ data: { success: true; data: T } }>) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        setData(response.data.data);
        return response.data.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.error?.message || 'An error occurred';
        setError(errorMessage);
        showError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  return { data, loading, error, execute };
}
