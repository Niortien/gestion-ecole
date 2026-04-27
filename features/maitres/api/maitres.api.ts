import api from '@/lib/api';
import type { Maitre } from '@/lib/types';
import type { CreateMaitreFormValues, UpdateMaitreFormValues } from '../schema/maitres.schema';

export const maitresApi = {
  getAll: () => api.get<Maitre[]>('/maitres'),
  getById: (id: number) => api.get<Maitre>(`/maitres/${id}`),
  monProfil: () => api.get<Maitre>('/maitres/mon-profil'),
  create: (data: CreateMaitreFormValues) => api.post<Maitre>('/maitres', data),
  update: (id: number, data: UpdateMaitreFormValues) => api.put<Maitre>(`/maitres/${id}`, data),
  delete: (id: number) => api.delete(`/maitres/${id}`),
  assignClasses: (id: number, classeIds: number[]) => api.patch<Maitre>(`/maitres/${id}/classes`, { classeIds }),
};
