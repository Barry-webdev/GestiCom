import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCachedData } from '@/lib/offline-storage';

type OfflineEntity = 'products' | 'clients' | 'suppliers' | 'sales';

export function useCachedData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options?: { staleTime?: number; offlineEntity?: OfflineEntity }
) {
  const staleTime = options?.staleTime ?? 5 * 60_000;

  const { data, isLoading, error, refetch } = useQuery<T>({
    queryKey: [cacheKey],
    queryFn: async () => {
      // Offline + entité connue → IndexedDB
      if (!navigator.onLine && options?.offlineEntity) {
        const cached = await getCachedData(options.offlineEntity);
        return cached as T;
      }
      return fetchFn();
    },
    staleTime,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (prev) => prev,
    retry: (failureCount) => navigator.onLine && failureCount < 1,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refresh: () => { refetch(); },
  };
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (key: string) => qc.invalidateQueries({ queryKey: [key] });
}
