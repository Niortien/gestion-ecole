import api from '@/lib/api';
import type { AnneeScolaire } from '@/lib/types';
import type { CreateAnneeScolaireFormValues, UpdateAnneeScolaireFormValues } from '../schema/annees-scolaires.schema';

export const anneesScolairesApi = {
  getAll: () => api.get<AnneeScolaire[]>('/annees-scolaires'),
  getActive: () => api.get<AnneeScolaire>('/annees-scolaires/active'),
  getById: (id: number) => api.get<AnneeScolaire>(`/annees-scolaires/${id}`),
  create: (data: CreateAnneeScolaireFormValues) => api.post<AnneeScolaire>('/annees-scolaires', data),
  update: (id: number, data: UpdateAnneeScolaireFormValues) => api.put<AnneeScolaire>(`/annees-scolaires/${id}`, data),
  activate: (id: number) => api.patch<AnneeScolaire>(`/annees-scolaires/${id}/activate`),
  delete: (id: number) => api.delete(`/annees-scolaires/${id}`),
};
