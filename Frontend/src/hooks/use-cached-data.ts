import { useState, useEffect, useRef } from 'react';
import { getCached, setCache } from '@/lib/api';

// Hook générique avec cache mémoire + localStorage pour chargement instantané
export function useCachedData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options?: { staleTime?: number }
) {
  const localKey = `cache_${cacheKey}`;

  // Charger depuis localStorage immédiatement (synchrone = pas de flash)
  const getLocalData = (): T | null => {
    try {
      const raw = localStorage.getItem(localKey);
      if (!raw) return null;
      const { data, timestamp } = JSON.parse(raw);
      const ttl = options?.staleTime ?? 5 * 60_000; // 5 min par défaut
      if (Date.now() - timestamp > ttl) return null;
      return data as T;
    } catch { return null; }
  };

  const [data, setData] = useState<T | null>(() => {
    // Essayer le cache mémoire d'abord (plus rapide)
    const mem = getCached(cacheKey);
    if (mem) return mem as T;
    return getLocalData();
  });
  const [loading, setLoading] = useState(!data); // Pas de spinner si on a du cache
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const refresh = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
      setCache(cacheKey, result);
      localStorage.setItem(localKey, JSON.stringify({ data: result, timestamp: Date.now() }));
      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Garder les données en cache en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    if (data) {
      // On a du cache: afficher immédiatement, rafraîchir en arrière-plan
      refresh(true);
    } else {
      refresh(false);
    }
  }, []);

  return { data, loading, error, refresh: () => refresh(false) };
}
