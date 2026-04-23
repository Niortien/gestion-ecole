import api from '@/lib/api';
import type { Examen, TypeExamen } from '@/lib/types';

export interface CreateExamenDto {
  libelle: string;
  type: TypeExamen;
  classeId: number;
  matiereId?: number;
  date: string;
  dureeMinutes?: number;
  anneeScolaireId: number;
}

export const examensApi = {
  list: async (params?: { classeId?: number; anneeScolaireId?: number }): Promise<Examen[]> => {
    const { data } = await api.get<Examen[]>('/examens', { params });
    return data;
  },
  get: async (id: number): Promise<Examen> => {
    const { data } = await api.get<Examen>(`/examens/${id}`);
    return data;
  },
  create: async (dto: CreateExamenDto): Promise<Examen> => {
    const { data } = await api.post<Examen>('/examens', dto);
    return data;
  },
  update: async (id: number, dto: Partial<CreateExamenDto>): Promise<Examen> => {
    const { data } = await api.put<Examen>(`/examens/${id}`, dto);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/examens/${id}`);
  },
};
