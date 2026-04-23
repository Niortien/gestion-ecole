import api from '@/lib/api';
import type { Maitre } from '@/lib/types';

export interface CreateMaitreDto {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  diplome?: string;
  specialite?: string;
  dateEmbauche?: string;
}

export const maitresApi = {
  list: async (): Promise<Maitre[]> => {
    const { data } = await api.get<Maitre[]>('/maitres');
    return data;
  },
  get: async (id: number): Promise<Maitre> => {
    const { data } = await api.get<Maitre>(`/maitres/${id}`);
    return data;
  },
  monProfil: async (): Promise<Maitre> => {
    const { data } = await api.get<Maitre>('/maitres/mon-profil');
    return data;
  },
  create: async (dto: CreateMaitreDto): Promise<Maitre> => {
    const { data } = await api.post<Maitre>('/maitres', dto);
    return data;
  },
  update: async (id: number, dto: Partial<CreateMaitreDto>): Promise<Maitre> => {
    const { data } = await api.put<Maitre>(`/maitres/${id}`, dto);
    return data;
  },
  affectClasses: async (id: number, classeIds: number[]): Promise<Maitre> => {
    const { data } = await api.patch<Maitre>(`/maitres/${id}/classes`, { classeIds });
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/maitres/${id}`);
  },
};
