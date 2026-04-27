import { useQuery } from '@tanstack/react-query';
import { maitresApi } from '../api/maitres.api';

export const MAITRES_KEYS = {
  all: ['maitres'] as const,
  list: () => ['maitres', 'list'] as const,
  detail: (id: number) => ['maitres', 'detail', id] as const,
};

export const useMaitres = () =>
  useQuery({ queryKey: MAITRES_KEYS.list(), queryFn: () => maitresApi.getAll().then((r) => r.data) });

export const useMaitre = (id: number) =>
  useQuery({ queryKey: MAITRES_KEYS.detail(id), queryFn: () => maitresApi.getById(id).then((r) => r.data), enabled: !!id });

export const useMonProfilMaitre = () =>
  useQuery({ queryKey: ['maitres', 'mon-profil'], queryFn: () => maitresApi.monProfil().then((r) => r.data) });
