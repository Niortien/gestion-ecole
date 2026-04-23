import api from '@/lib/api';
import type { Eleve, StatutEleve } from '@/lib/types';

export interface CreateEleveDto {
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance?: string;
  sexe: 'M' | 'F';
  numeroDossier?: string;
  classeId?: number;
  parentId?: number;
}

export const elevesApi = {
  list: async (params?: { classeId?: number; parentId?: number }): Promise<Eleve[]> => {
    const { data } = await api.get<Eleve[]>('/eleves', { params });
    return data;
  },
  get: async (id: number): Promise<Eleve> => {
    const { data } = await api.get<Eleve>(`/eleves/${id}`);
    return data;
  },
  create: async (dto: CreateEleveDto): Promise<Eleve> => {
    const { data } = await api.post<Eleve>('/eleves', dto);
    return data;
  },
  update: async (id: number, dto: Partial<CreateEleveDto>): Promise<Eleve> => {
    const { data } = await api.put<Eleve>(`/eleves/${id}`, dto);
    return data;
  },
  updateStatut: async (id: number, statut: StatutEleve): Promise<Eleve> => {
    const { data } = await api.patch<Eleve>(`/eleves/${id}/statut`, { statut });
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/eleves/${id}`);
  },
};
