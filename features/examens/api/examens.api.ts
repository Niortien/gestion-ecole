import api from '@/lib/api';
import type { Examen } from '@/lib/types';
import type { CreateExamenFormValues, UpdateExamenFormValues } from '../schema/examens.schema';

export interface ExamenFilters {
  classeId?: number;
  anneeScolaireId?: number;
}

export const examensApi = {
  getAll: (params?: ExamenFilters) => api.get<Examen[]>('/examens', { params }),
  getById: (id: number) => api.get<Examen>(`/examens/${id}`),
  create: (data: CreateExamenFormValues) => api.post<Examen>('/examens', data),
  update: (id: number, data: UpdateExamenFormValues) => api.put<Examen>(`/examens/${id}`, data),
  delete: (id: number) => api.delete(`/examens/${id}`),
};
