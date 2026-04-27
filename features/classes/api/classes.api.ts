import api from '@/lib/api';
import type { Classe } from '@/lib/types';
import type { CreateClasseFormValues, UpdateClasseFormValues } from '../schema/classes.schema';

export interface ClasseFilters {
  anneeScolaireId?: number;
  niveau?: string;
}

export const classesApi = {
  getAll: (params?: ClasseFilters) => api.get<Classe[]>('/classes', { params }),
  getById: (id: number) => api.get<Classe>(`/classes/${id}`),
  create: (data: CreateClasseFormValues) => api.post<Classe>('/classes', data),
  update: (id: number, data: UpdateClasseFormValues) => api.put<Classe>(`/classes/${id}`, data),
  delete: (id: number) => api.delete(`/classes/${id}`),
};
