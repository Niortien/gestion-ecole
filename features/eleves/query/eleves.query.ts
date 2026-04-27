import { useQuery } from '@tanstack/react-query';
import { elevesApi, type EleveFilters } from '../api/eleves.api';

export const ELEVES_KEYS = {
  all: ['eleves'] as const,
  list: (filters?: EleveFilters) => ['eleves', 'list', filters] as const,
  detail: (id: number) => ['eleves', 'detail', id] as const,
};

export const useEleves = (filters?: EleveFilters) =>
  useQuery({
    queryKey: ELEVES_KEYS.list(filters),
    queryFn: () => elevesApi.getAll(filters).then((r) => r.data),
  });

export const useEleve = (id: number) =>
  useQuery({
    queryKey: ELEVES_KEYS.detail(id),
    queryFn: () => elevesApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
