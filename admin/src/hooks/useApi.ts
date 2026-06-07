import { useState, useCallback } from 'react';
import { apiRequest } from '../api/client';
import type { ApiResponse } from '../types';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const request = useCallback(
    async (
      endpoint: string, 
      options: RequestInit = {}, 
      hooks?: UseApiOptions
    ): Promise<ApiResponse<T>> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiRequest<T>(endpoint, options);
        
        if (response.error) {
          setError(response.error);
          hooks?.onError?.(response.error);
        } else {
          setData(response.data);
          hooks?.onSuccess?.(response.data);
        }
        
        return response;
      } catch (err: any) {
        const msg = err.message || 'An unexpected error occurred';
        setError(msg);
        hooks?.onError?.(msg);
        return { data: null, error: msg, status: 500 };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { data, error, isLoading, request };
}
