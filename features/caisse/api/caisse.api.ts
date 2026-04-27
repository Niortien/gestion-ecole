import api from '@/lib/api';
import type { Caisse } from '@/lib/types';

export const caisseApi = {
  list: async (params?: { dateDebut?: string; dateFin?: string }): Promise<Caisse[]> => {
    const { data } = await api.get<Caisse[]>('/caisse', { params });
    return data;
  },
  solde: async (): Promise<{ solde: number; totalEntrees?: number; totalSorties?: number }> => {
    const { data } = await api.get<{ solde: number; totalEntrees?: number; totalSorties?: number }>('/caisse/solde');
    return data;
  },
  cloturer: async (date: string): Promise<Caisse> => {
    const { data } = await api.post<Caisse>('/caisse/cloturer', { date });
    return data;
  },
};
