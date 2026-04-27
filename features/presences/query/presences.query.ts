import { useQuery } from '@tanstack/react-query';
import { presencesApi } from '../api/presences.api';

export const PRESENCES_KEYS = {
  all: ['presences'] as const,
  byClasse: (classeId: number, date?: string) => ['presences', 'classe', classeId, date] as const,
  byEleve: (eleveId: number, mois?: string) => ['presences', 'eleve', eleveId, mois] as const,
  statsClasse: (classeId: number, anneeScolaireId?: number) => ['presences', 'stats', classeId, anneeScolaireId] as const,
};

export const usePresencesByClasse = (classeId: number, params?: { date?: string }) =>
  useQuery({
    queryKey: PRESENCES_KEYS.byClasse(classeId, params?.date),
    queryFn: () => presencesApi.byClasse(classeId, params).then((r) => r.data),
    enabled: !!classeId,
  });

export const usePresencesByEleve = (eleveId: number, params?: { mois?: string }) =>
  useQuery({
    queryKey: PRESENCES_KEYS.byEleve(eleveId, params?.mois),
    queryFn: () => presencesApi.byEleve(eleveId, params).then((r) => r.data),
    enabled: !!eleveId,
  });

export const useStatsPresencesClasse = (classeId: number, params?: { anneeScolaireId?: number }) =>
  useQuery({
    queryKey: PRESENCES_KEYS.statsClasse(classeId, params?.anneeScolaireId),
    queryFn: () => presencesApi.statsClasse(classeId, params).then((r) => r.data),
    enabled: !!classeId,
  });
