import { useQuery, useQueryClient } from '@tanstack/react-query';

// Hook générique basé sur TanStack Query
// - Affichage immédiat depuis le cache (stale-while-revalidate)
// - Pas de spinner si données en cache
// - Refresh en arrière-plan silencieux
export function useCachedData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options?: { staleTime?: number }
) {
  const staleTime = options?.staleTime ?? 5 * 60_000; // 5 min par défaut

  const { data, isLoading, error, refetch } = useQuery<T>({
    queryKey: [cacheKey],
    queryFn: fetchFn,
    staleTime,
    gcTime: 10 * 60_000,          // Garde en mémoire 10 min
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (prev) => prev, // Garde les anciennes données pendant le refresh
    retry: 1,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refresh: () => { refetch(); },
  };
}

// Hook pour invalidation globale du cache
export function useInvalidate() {
  const qc = useQueryClient();
  return (key: string) => qc.invalidateQueries({ queryKey: [key] });
}
