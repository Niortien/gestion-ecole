import api from '@/lib/api';
import type { Devoir } from '@/lib/types';
import type { CreateDevoirFormValues, UpdateDevoirFormValues } from '../schema/devoirs.schema';

export const devoirsApi = {
  byClasse: (classeId: number) => api.get<Devoir[]>(`/devoirs/classe/${classeId}`),
  getById: (id: number) => api.get<Devoir>(`/devoirs/${id}`),
  create: (data: CreateDevoirFormValues) => api.post<Devoir>('/devoirs', data),
  update: (id: number, data: UpdateDevoirFormValues) => api.put<Devoir>(`/devoirs/${id}`, data),
  delete: (id: number) => api.delete(`/devoirs/${id}`),
};
