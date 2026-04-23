import api from '@/lib/api';
import type { Parent } from '@/lib/types';

export interface CreateParentDto {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  telephoneUrgence?: string;
  profession?: string;
  adresse?: string;
}

export const parentsApi = {
  list: async (): Promise<Parent[]> => {
    const { data } = await api.get<Parent[]>('/parents');
    return data;
  },
  get: async (id: number): Promise<Parent> => {
    const { data } = await api.get<Parent>(`/parents/${id}`);
    return data;
  },
  create: async (dto: CreateParentDto): Promise<Parent> => {
    const { data } = await api.post<Parent>('/parents', dto);
    return data;
  },
  update: async (id: number, dto: Partial<CreateParentDto>): Promise<Parent> => {
    const { data } = await api.put<Parent>(`/parents/${id}`, dto);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/parents/${id}`);
  },
};
