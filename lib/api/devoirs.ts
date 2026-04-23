import api from '@/lib/api';
import type { Devoir } from '@/lib/types';

export interface CreateDevoirDto {
  titre: string;
  description?: string;
  matiereId: number;
  classeId: number;
  dateDonnee: string;
  dateRendu?: string;
}

export const devoirsApi = {
  byClasse: async (classeId: number): Promise<Devoir[]> => {
    const { data } = await api.get<Devoir[]>(`/devoirs/classe/${classeId}`);
    return data;
  },
  get: async (id: number): Promise<Devoir> => {
    const { data } = await api.get<Devoir>(`/devoirs/${id}`);
    return data;
  },
  create: async (dto: CreateDevoirDto): Promise<Devoir> => {
    const { data } = await api.post<Devoir>('/devoirs', dto);
    return data;
  },
  update: async (id: number, dto: Partial<CreateDevoirDto>): Promise<Devoir> => {
    const { data } = await api.put<Devoir>(`/devoirs/${id}`, dto);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/devoirs/${id}`);
  },
};
