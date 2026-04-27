import api from '@/lib/api';
import type { FraisScolarite } from '@/lib/types';

export interface CreateFraisScolariteDto {
  libelle: string;
  montant: number;
  classeId?: number;
  anneeScolaireId: number;
  obligatoire?: boolean;
  description?: string;
}

export const fraisScolariteApi = {
  list: async (params?: { anneeScolaireId?: number }): Promise<FraisScolarite[]> => {
    const { data } = await api.get<FraisScolarite[]>('/frais-scolarite', { params });
    return data;
  },
  getById: async (id: number): Promise<FraisScolarite> => {
    const { data } = await api.get<FraisScolarite>(`/frais-scolarite/${id}`);
    return data;
  },
  create: async (dto: CreateFraisScolariteDto): Promise<FraisScolarite> => {
    const { data } = await api.post<FraisScolarite>('/frais-scolarite', dto);
    return data;
  },
  update: async (id: number, dto: Partial<CreateFraisScolariteDto>): Promise<FraisScolarite> => {
    const { data } = await api.put<FraisScolarite>(`/frais-scolarite/${id}`, dto);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/frais-scolarite/${id}`);
  },
};
