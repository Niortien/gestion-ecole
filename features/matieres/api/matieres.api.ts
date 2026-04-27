import api from '@/lib/api';
import type { Matiere } from '@/lib/types';
import type { CreateMatiereFormValues, UpdateMatiereFormValues } from '../schema/matieres.schema';

export const matieresApi = {
  getAll: () => api.get<Matiere[]>('/matieres'),
  getById: (id: number) => api.get<Matiere>(`/matieres/${id}`),
  create: (data: CreateMatiereFormValues) => api.post<Matiere>('/matieres', data),
  update: (id: number, data: UpdateMatiereFormValues) => api.put<Matiere>(`/matieres/${id}`, data),
  delete: (id: number) => api.delete(`/matieres/${id}`),
};
