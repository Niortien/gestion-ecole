import { useQuery } from '@tanstack/react-query';
import { rapportsApi } from '../api/rapports.api';

export const RAPPORTS_KEYS = {
  all: ['rapports'] as const,
  directeur: (params?: object) => [...RAPPORTS_KEYS.all, 'directeur', params] as const,
  comptable: (params?: object) => [...RAPPORTS_KEYS.all, 'comptable', params] as const,
  absences: (params?: object) => [...RAPPORTS_KEYS.all, 'absences', params] as const,
};

export function useRapportDirecteur(params?: { anneeScolaireId?: number }) {
  return useQuery({
    queryKey: RAPPORTS_KEYS.directeur(params),
    queryFn: () => rapportsApi.directeur(params),
  });
}

export function useRapportComptable(params?: { anneeScolaireId?: number }) {
  return useQuery({
    queryKey: RAPPORTS_KEYS.comptable(params),
    queryFn: () => rapportsApi.comptable(params),
  });
}

export function useRapportAbsences(params?: { classeId?: number; annee?: number }) {
  return useQuery({
    queryKey: RAPPORTS_KEYS.absences(params),
    queryFn: () => rapportsApi.absences(params),
  });
}
