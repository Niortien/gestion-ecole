import { useQuery } from '@tanstack/react-query';
import { anneesScolairesApi } from '../api/annees-scolaires.api';

export const ANNEES_KEYS = {
  all: ['annees-scolaires'] as const,
  list: () => ['annees-scolaires', 'list'] as const,
  active: () => ['annees-scolaires', 'active'] as const,
  detail: (id: number) => ['annees-scolaires', 'detail', id] as const,
};

export const useAnneesScolaires = () =>
  useQuery({ queryKey: ANNEES_KEYS.list(), queryFn: () => anneesScolairesApi.getAll().then((r) => r.data) });

export const useActiveAnneeScolaire = () =>
  useQuery({ queryKey: ANNEES_KEYS.active(), queryFn: () => anneesScolairesApi.getActive().then((r) => r.data) });

export const useAnneeScolaire = (id: number) =>
  useQuery({ queryKey: ANNEES_KEYS.detail(id), queryFn: () => anneesScolairesApi.getById(id).then((r) => r.data), enabled: !!id });
