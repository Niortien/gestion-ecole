import api from '@/lib/api';
import type { User, UserRole } from '@/lib/types';

export interface CreateUtilisateurDto {
  email: string;
  password: string;
  role: UserRole;
}

export const utilisateursApi = {
  list: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/utilisateurs');
    return data;
  },
  create: async (dto: CreateUtilisateurDto): Promise<User> => {
    const { data } = await api.post<User>('/utilisateurs', dto);
    return data;
  },
  update: async (id: number, dto: Partial<CreateUtilisateurDto>): Promise<User> => {
    const { data } = await api.put<User>(`/utilisateurs/${id}`, dto);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/utilisateurs/${id}`);
  },
};
