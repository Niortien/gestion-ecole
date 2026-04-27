import api from '@/lib/api';
import type { Presence } from '@/lib/types';
import type { AppelClasseFormValues } from '../schema/presences.schema';

export const presencesApi = {
  appel: (data: AppelClasseFormValues) => api.post<Presence[]>('/presences/appel', data),
  byClasse: (classeId: number, params?: { date?: string }) =>
    api.get<Presence[]>(`/presences/classe/${classeId}`, { params }),
  byEleve: (eleveId: number, params?: { mois?: string }) =>
    api.get<Presence[]>(`/presences/eleve/${eleveId}`, { params }),
  statsClasse: (classeId: number, params?: { anneeScolaireId?: number }) =>
    api.get(`/presences/stats/classe/${classeId}`, { params }),
};
