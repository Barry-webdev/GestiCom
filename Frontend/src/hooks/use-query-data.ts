import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showErrorToast } from '@/lib/toast-utils';

/**
 * Hook universel pour charger des données avec cache TanStack Query.
 * - Affichage immédiat depuis le cache (stale-while-revalidate)
 * - Pas de spinner si données déjà en cache
 * - Refresh silencieux en arrière-plan
 */
export function useQueryData<T>(
  key: string | string[],
  fetchFn: () => Promise<T>,
  options?: {
    staleTime?: number;   // Durée avant re-fetch (défaut: 2 min)
    enabled?: boolean;
  }
) {
  const queryKey = Array.isArray(key) ? key : [key];

  const { data, isLoading, isFetching, error, refetch } = useQuery<T>({
    queryKey,
    queryFn: fetchFn,
    staleTime: options?.staleTime ?? 2 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (prev) => prev, // Garde les anciennes données pendant refresh
    enabled: options?.enabled !== false,
    retry: 1,
  });

  return {
    data: data ?? null,
    loading: isLoading,      // true seulement au PREMIER chargement sans cache
    refreshing: isFetching && !isLoading, // true lors du refresh silencieux
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
