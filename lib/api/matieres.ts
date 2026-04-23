import api from '@/lib/api';
import type { Matiere, NiveauMatiere } from '@/lib/types';

export interface CreateMatiereDto {
  nom: string;
  code: string;
  coefficient?: number;
  niveau?: NiveauMatiere;
}

export const matieresApi = {
  list: async (): Promise<Matiere[]> => {
    const { data } = await api.get<Matiere[]>('/matieres');
    return data;
  },
  get: async (id: number): Promise<Matiere> => {
    const { data } = await api.get<Matiere>(`/matieres/${id}`);
    return data;
  },
  create: async (dto: CreateMatiereDto): Promise<Matiere> => {
    const { data } = await api.post<Matiere>('/matieres', dto);
    return data;
  },
  update: async (id: number, dto: Partial<CreateMatiereDto>): Promise<Matiere> => {
    const { data } = await api.put<Matiere>(`/matieres/${id}`, dto);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/matieres/${id}`);
  },
};
