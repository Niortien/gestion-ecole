import { useQuery } from '@tanstack/react-query';
import { parentsApi } from '../api/parents.api';

export const PARENTS_KEYS = {
  all: ['parents'] as const,
  list: () => ['parents', 'list'] as const,
  detail: (id: number) => ['parents', 'detail', id] as const,
};

export const useParents = () =>
  useQuery({ queryKey: PARENTS_KEYS.list(), queryFn: () => parentsApi.getAll().then((r) => r.data) });

export const useParent = (id: number) =>
  useQuery({ queryKey: PARENTS_KEYS.detail(id), queryFn: () => parentsApi.getById(id).then((r) => r.data), enabled: !!id });

export const useMonProfilParent = () =>
  useQuery({ queryKey: ['parents', 'mon-profil'], queryFn: () => parentsApi.monProfil().then((r) => r.data) });
