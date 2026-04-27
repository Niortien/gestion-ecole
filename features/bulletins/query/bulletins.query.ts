import { useQuery } from '@tanstack/react-query';
import { bulletinsApi } from '../api/bulletins.api';
import type { Periode } from '@/lib/types';

export const BULLETINS_KEYS = {
  all: ['bulletins'] as const,
  byClasse: (classeId: number, params?: object) => ['bulletins', 'classe', classeId, params] as const,
  byEleve: (eleveId: number, anneeScolaireId?: number) => ['bulletins', 'eleve', eleveId, anneeScolaireId] as const,
};

export const useBulletinsByClasse = (classeId: number, params?: { anneeScolaireId?: number; periode?: Periode }) =>
  useQuery({
    queryKey: BULLETINS_KEYS.byClasse(classeId, params),
    queryFn: () => bulletinsApi.byClasse(classeId, params).then((r) => r.data),
    enabled: !!classeId,
  });

export const useBulletinsByEleve = (eleveId: number, params?: { anneeScolaireId?: number }) =>
  useQuery({
    queryKey: BULLETINS_KEYS.byEleve(eleveId, params?.anneeScolaireId),
    queryFn: () => bulletinsApi.byEleve(eleveId, params).then((r) => r.data),
    enabled: !!eleveId,
  });
