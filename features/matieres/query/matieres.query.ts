import { useQuery } from '@tanstack/react-query';
import { matieresApi } from '../api/matieres.api';

export const MATIERES_KEYS = {
  all: ['matieres'] as const,
  list: () => ['matieres', 'list'] as const,
  detail: (id: number) => ['matieres', 'detail', id] as const,
};

export const useMatieres = () =>
  useQuery({ queryKey: MATIERES_KEYS.list(), queryFn: () => matieresApi.getAll().then((r) => r.data) });

export const useMatiere = (id: number) =>
  useQuery({ queryKey: MATIERES_KEYS.detail(id), queryFn: () => matieresApi.getById(id).then((r) => r.data), enabled: !!id });
