import api from '@/lib/api';
import type { Bulletin, Periode } from '@/lib/types';
import type { GenerateBulletinFormValues } from '../schema/bulletins.schema';

export const bulletinsApi = {
  byClasse: (classeId: number, params?: { anneeScolaireId?: number; periode?: Periode }) =>
    api.get<Bulletin[]>(`/bulletins/classe/${classeId}`, { params }),
  byEleve: (eleveId: number, params?: { anneeScolaireId?: number }) =>
    api.get<Bulletin[]>(`/bulletins/eleve/${eleveId}`, { params }),
  generer: (data: GenerateBulletinFormValues) => api.post<Bulletin[]>('/bulletins/generer', data),
  publier: (id: number) => api.patch<Bulletin>(`/bulletins/${id}/publier`),
};
