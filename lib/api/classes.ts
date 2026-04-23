import api from '@/lib/api';
import type { Classe, NomClasse, NiveauClasse } from '@/lib/types';

export interface CreateClasseDto {
  nom: NomClasse;
  libelle?: string;
  niveau: NiveauClasse;
  capacite?: number;
  anneeScolaireId: number;
}

export const classesApi = {
  list: async (params?: { anneeScolaireId?: number }): Promise<Classe[]> => {
    const { data } = await api.get<Classe[]>('/classes', { params });
    return data;
  },
  get: async (id: number): Promise<Classe> => {
    const { data } = await api.get<Classe>(`/classes/${id}`);
    return data;
  },
  create: async (dto: CreateClasseDto): Promise<Classe> => {
    const { data } = await api.post<Classe>('/classes', dto);
    return data;
  },
  update: async (id: number, dto: Partial<CreateClasseDto>): Promise<Classe> => {
    const { data } = await api.put<Classe>(`/classes/${id}`, dto);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/classes/${id}`);
  },
};
