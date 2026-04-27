import api from '@/lib/api';
import type { Eleve } from '@/lib/types';
import type { CreateEleveFormValues, UpdateEleveFormValues } from '../schema/eleves.schema';

export interface EleveFilters {
  classeId?: number;
  statut?: string;
  search?: string;
  anneeScolaireId?: number;
  page?: number;
  limit?: number;
}

export const elevesApi = {
  getAll: (params?: EleveFilters) =>
    api.get<Eleve[]>('/eleves', { params }),
  getById: (id: number) =>
    api.get<Eleve>(`/eleves/${id}`),
  create: (data: CreateEleveFormValues) =>
    api.post<Eleve>('/eleves', data),
  update: (id: number, data: UpdateEleveFormValues) =>
    api.put<Eleve>(`/eleves/${id}`, data),
  updateStatut: (id: number, statut: string) =>
    api.patch<Eleve>(`/eleves/${id}/statut`, { statut }),
  delete: (id: number) =>
    api.delete(`/eleves/${id}`),
  uploadPhoto: (id: number, file: File) => {
    const form = new FormData();
    form.append('photo', file);
    return api.post<{ photo: string }>(`/eleves/${id}/photo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
