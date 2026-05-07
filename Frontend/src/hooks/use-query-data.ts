import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showErrorToast } from '@/lib/toast-utils';
import { getCachedData } from '@/lib/offline-storage';

type OfflineEntity = 'products' | 'clients' | 'suppliers' | 'sales';

/**
 * Hook universel pour charger des données avec :
 * - Cache TanStack Query (mémoire, instantané)
 * - Fallback IndexedDB si offline
 * - Refresh silencieux en arrière-plan
 */
export function useQueryData<T>(
  key: string | string[],
  fetchFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    enabled?: boolean;
    offlineEntity?: OfflineEntity; // Si fourni, fallback IndexedDB quand offline
  }
) {
  const queryKey = Array.isArray(key) ? key : [key];

  const { data, isLoading, isFetching, error, refetch } = useQuery<T>({
    queryKey,
    queryFn: async () => {
      // Si offline et entité connue → IndexedDB
      if (!navigator.onLine && options?.offlineEntity) {
        const cached = await getCachedData(options.offlineEntity);
        return cached as T;
      }
      return fetchFn();
    },
    staleTime: options?.staleTime ?? 2 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (prev) => prev,
    enabled: options?.enabled !== false,
    retry: (failureCount, error: any) => {
      // Pas de retry si offline
      if (!navigator.onLine) return false;
      return failureCount < 1;
    },
  });

  return {
    data: data ?? null,
    loading: isLoading,
    refreshing: isFetching && !isLoading,
    error: error?.message ?? null,
    refresh: () => refetch(),
  };
}

/**
 * Hook pour les mutations avec optimistic update intégré.
 */
export function useOptimisticMutation<T>(
  queryKey: string,
  mutationFn: (data: any) => Promise<any>,
  options?: {
    optimisticUpdate?: (old: T[], data: any) => T[];
    onSuccess?: () => void;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (data) => {
      if (!options?.optimisticUpdate) return;
      await qc.cancelQueries({ queryKey: [queryKey] });
      const prev = qc.getQueryData<T[]>([queryKey]);
      qc.setQueryData<T[]>([queryKey], (old) =>
        options.optimisticUpdate!(old ?? [], data)
      );
      return { prev };
    },
    onError: (_err, _data, context: any) => {
      if (context?.prev) qc.setQueryData([queryKey], context.prev);
      showErrorToast('Erreur', options?.errorMessage ?? 'Une erreur est survenue');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      options?.onSuccess?.();
    },
  });
}
