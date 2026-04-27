import { useQuery } from '@tanstack/react-query';
import { fraisScolariteApi } from '../api/frais-scolarite.api';

export const FRAIS_KEYS = {
  all: ['frais-scolarite'] as const,
  list: (params?: object) => [...FRAIS_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...FRAIS_KEYS.all, 'detail', id] as const,
};

export function useFraisScolarite(params?: { anneeScolaireId?: number }) {
  return useQuery({
    queryKey: FRAIS_KEYS.list(params),
    queryFn: () => fraisScolariteApi.list(params),
  });
}

export function useFraisScolariteById(id: number) {
  return useQuery({
    queryKey: FRAIS_KEYS.detail(id),
    queryFn: () => fraisScolariteApi.getById(id),
    enabled: !!id,
  });
}
