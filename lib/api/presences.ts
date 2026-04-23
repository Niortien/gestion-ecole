import api from '@/lib/api';
import type { Presence, StatutPresence } from '@/lib/types';

export interface AppelEntryDto {
  eleveId: number;
  statut: StatutPresence;
  motif?: string;
}

export interface AppelClasseDto {
  classeId: number;
  date: string;
  presences: AppelEntryDto[];
}

export const presencesApi = {
  appel: async (dto: AppelClasseDto): Promise<Presence[]> => {
    const { data } = await api.post<Presence[]>('/presences/appel', dto);
    return data;
  },
  byClasse: async (classeId: number, params?: { date?: string }): Promise<Presence[]> => {
    const { data } = await api.get<Presence[]>(`/presences/classe/${classeId}`, { params });
    return data;
  },
  byEleve: async (eleveId: number, params?: { mois?: string }): Promise<Presence[]> => {
    const { data } = await api.get<Presence[]>(`/presences/eleve/${eleveId}`, { params });
    return data;
  },
  statsClasse: async (classeId: number, params?: { anneeScolaireId?: number }): Promise<unknown> => {
    const { data } = await api.get(`/presences/stats/classe/${classeId}`, { params });
    return data;
  },
};
