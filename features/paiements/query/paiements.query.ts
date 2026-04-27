import { useQuery } from '@tanstack/react-query';
import { paiementsApi } from '../api/paiements.api';

export const PAIEMENTS_KEYS = {
  all: ['paiements'] as const,
  list: (params?: object) => [...PAIEMENTS_KEYS.all, 'list', params] as const,
  byEleve: (eleveId: number) => [...PAIEMENTS_KEYS.all, 'eleve', eleveId] as const,
  situation: (eleveId: number, anneeScolaireId?: number) => [...PAIEMENTS_KEYS.all, 'situation', eleveId, anneeScolaireId] as const,
};

export function usePaiements(params?: { dateDebut?: string; dateFin?: string }) {
  return useQuery({
    queryKey: PAIEMENTS_KEYS.list(params),
    queryFn: () => paiementsApi.list(params),
  });
}

export function usePaiementsByEleve(eleveId: number) {
  return useQuery({
    queryKey: PAIEMENTS_KEYS.byEleve(eleveId),
    queryFn: () => paiementsApi.byEleve(eleveId),
    enabled: !!eleveId,
  });
}

export function useSituationFinanciere(eleveId: number, params?: { anneeScolaireId?: number }) {
  return useQuery({
    queryKey: PAIEMENTS_KEYS.situation(eleveId, params?.anneeScolaireId),
    queryFn: () => paiementsApi.situation(eleveId, params),
    enabled: !!eleveId,
  });
}
