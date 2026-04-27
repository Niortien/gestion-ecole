import api from '@/lib/api';
import type { Depense, CategorieDepense } from '@/lib/types';

export interface CreateDepenseDto {
  libelle: string;
  montant: number;
  categorie?: CategorieDepense;
  date: string;
  description?: string;
}

export const depensesApi = {
  list: async (params?: { dateDebut?: string; dateFin?: string }): Promise<Depense[]> => {
    const { data } = await api.get<Depense[]>('/depenses', { params });
    return data;
  },
  getById: async (id: number): Promise<Depense> => {
    const { data } = await api.get<Depense>(`/depenses/${id}`);
    return data;
  },
  create: async (dto: CreateDepenseDto): Promise<Depense> => {
    const { data } = await api.post<Depense>('/depenses', dto);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/depenses/${id}`);
  },
};
