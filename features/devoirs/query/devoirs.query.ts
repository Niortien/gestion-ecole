import { useQuery } from '@tanstack/react-query';
import { devoirsApi } from '../api/devoirs.api';

export const DEVOIRS_KEYS = {
  all: ['devoirs'] as const,
  byClasse: (classeId: number) => ['devoirs', 'classe', classeId] as const,
  detail: (id: number) => ['devoirs', 'detail', id] as const,
};

export const useDevoirs = (classeId: number) =>
  useQuery({ queryKey: DEVOIRS_KEYS.byClasse(classeId), queryFn: () => devoirsApi.byClasse(classeId).then((r) => r.data), enabled: !!classeId });

export const useDevoir = (id: number) =>
  useQuery({ queryKey: DEVOIRS_KEYS.detail(id), queryFn: () => devoirsApi.getById(id).then((r) => r.data), enabled: !!id });
