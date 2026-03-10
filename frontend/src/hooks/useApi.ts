/**
 * ============================================================================
 * USEAPI HOOK
 * ============================================================================
 * Generic data fetching hook with error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiError, handleApiResponse } from '@/utils/api-errors';

interface UseApiOptions {
  immediate?: boolean;
  onError?: (error: ApiError) => void;
  onSuccess?: (data: any) => void;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export function useApi<T = any>(
  url: string,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { immediate = true, onError, onSuccess } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      const result = await handleApiResponse<T>(response);
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('FETCH_ERROR', 'Failed to fetch');
      setError(apiError);
      onError?.(apiError);
    } finally {
      setLoading(false);
    }
  }, [url, onError, onSuccess]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
