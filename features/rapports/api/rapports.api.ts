import api from '@/lib/api';
import type { RapportDirecteur, RapportComptable, RapportAbsences } from '@/lib/types';

export const rapportsApi = {
  directeur: async (params?: { anneeScolaireId?: number }): Promise<RapportDirecteur> => {
    const { data } = await api.get<RapportDirecteur>('/rapports/directeur', { params });
    return data;
  },
  comptable: async (params?: { anneeScolaireId?: number }): Promise<RapportComptable> => {
    const { data } = await api.get<RapportComptable>('/rapports/comptable', { params });
    return data;
  },
  absences: async (params?: { classeId?: number; annee?: number }): Promise<RapportAbsences> => {
    const { data } = await api.get<RapportAbsences>('/rapports/absences', { params });
    return data;
  },
};
