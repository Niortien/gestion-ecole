import { useQuery } from '@tanstack/react-query';
import { caisseApi } from '../api/caisse.api';

export const CAISSE_KEYS = {
  all: ['caisse'] as const,
  list: (params?: object) => [...CAISSE_KEYS.all, 'list', params] as const,
  solde: () => [...CAISSE_KEYS.all, 'solde'] as const,
};

export function useCaisse(params?: { dateDebut?: string; dateFin?: string }) {
  return useQuery({
    queryKey: CAISSE_KEYS.list(params),
    queryFn: () => caisseApi.list(params),
  });
}

export function useSoldeCaisse() {
  return useQuery({
    queryKey: CAISSE_KEYS.solde(),
    queryFn: caisseApi.solde,
  });
}
