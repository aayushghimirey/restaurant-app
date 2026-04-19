import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToInvalidation } from '@/lib/eventBus';

export function useFetch<T>(
  queryKey: string | readonly unknown[],
  fetchFn: () => Promise<T>,
  options?: { enabled?: boolean }
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const isEnabled = options?.enabled !== false;

  // Keep the latest fetch function without causing re-evaluation
  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const serializedKey = JSON.stringify(queryKey);

  const fetchData = useCallback(async () => {
    if (!isEnabled) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFnRef.current();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled]);

  // Refetch when serialized key or enabled state changes
  useEffect(() => {
    fetchData();
  }, [serializedKey, fetchData]);

  useEffect(() => {
    // We try to stringify the query key to use as subscribe key, or just take the first part
    const keyGroup = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    const unsubscribe = subscribeToInvalidation(keyGroup as string, () => {
      fetchData();
    });
    return unsubscribe;
  }, [serializedKey, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
