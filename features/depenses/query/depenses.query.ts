import { useQuery } from '@tanstack/react-query';
import { depensesApi } from '../api/depenses.api';

export const DEPENSES_KEYS = {
  all: ['depenses'] as const,
  list: (params?: object) => [...DEPENSES_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...DEPENSES_KEYS.all, 'detail', id] as const,
};

export function useDepenses(params?: { dateDebut?: string; dateFin?: string }) {
  return useQuery({
    queryKey: DEPENSES_KEYS.list(params),
    queryFn: () => depensesApi.list(params),
  });
}

export function useDepense(id: number) {
  return useQuery({
    queryKey: DEPENSES_KEYS.detail(id),
    queryFn: () => depensesApi.getById(id),
    enabled: !!id,
  });
}
