import api from '@/lib/api';
import type { Parent } from '@/lib/types';
import type { CreateParentFormValues, UpdateParentFormValues } from '../schema/parents.schema';

export const parentsApi = {
  getAll: () => api.get<Parent[]>('/parents'),
  getById: (id: number) => api.get<Parent>(`/parents/${id}`),
  monProfil: () => api.get<Parent>('/parents/mon-profil'),
  create: (data: CreateParentFormValues) => api.post<Parent>('/parents', data),
  update: (id: number, data: UpdateParentFormValues) => api.put<Parent>(`/parents/${id}`, data),
  delete: (id: number) => api.delete(`/parents/${id}`),
};
