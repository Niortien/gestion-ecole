import api from '@/lib/api';
import type { AnneeScolaire } from '@/lib/types';

export interface CreateAnneeScolaireDto {
  libelle: string;
  dateDebut: string;
  dateFin: string;
  estActive?: boolean;
}

export const anneesScolairesApi = {
  list: async (): Promise<AnneeScolaire[]> => {
    const { data } = await api.get<AnneeScolaire[]>('/annees-scolaires');
    return data;
  },
  active: async (): Promise<AnneeScolaire> => {
    const { data } = await api.get<AnneeScolaire>('/annees-scolaires/active');
    return data;
  },
  get: async (id: number): Promise<AnneeScolaire> => {
    const { data } = await api.get<AnneeScolaire>(`/annees-scolaires/${id}`);
    return data;
  },
  create: async (dto: CreateAnneeScolaireDto): Promise<AnneeScolaire> => {
    const { data } = await api.post<AnneeScolaire>('/annees-scolaires', dto);
    return data;
  },
  update: async (id: number, dto: Partial<CreateAnneeScolaireDto>): Promise<AnneeScolaire> => {
    const { data } = await api.put<AnneeScolaire>(`/annees-scolaires/${id}`, dto);
    return data;
  },
  activate: async (id: number): Promise<AnneeScolaire> => {
    const { data } = await api.patch<AnneeScolaire>(`/annees-scolaires/${id}/activate`);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/annees-scolaires/${id}`);
  },
};
