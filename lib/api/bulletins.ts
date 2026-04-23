import api from '@/lib/api';
import type { Bulletin, Periode } from '@/lib/types';

export interface GenererBulletinsDto {
  classeId: number;
  anneeScolaireId: number;
  periode: Periode;
}

export const bulletinsApi = {
  byClasse: async (classeId: number, params: { anneeScolaireId: number; periode?: Periode }): Promise<Bulletin[]> => {
    const { data } = await api.get<Bulletin[]>(`/bulletins/classe/${classeId}`, { params });
    return data;
  },
  byEleve: async (eleveId: number, params?: { anneeScolaireId?: number }): Promise<Bulletin[]> => {
    const { data } = await api.get<Bulletin[]>(`/bulletins/eleve/${eleveId}`, { params });
    return data;
  },
  generer: async (dto: GenererBulletinsDto): Promise<Bulletin[]> => {
    const { data } = await api.post<Bulletin[]>('/bulletins/generer', dto);
    return data;
  },
  publier: async (id: number): Promise<Bulletin> => {
    const { data } = await api.patch<Bulletin>(`/bulletins/${id}/publier`);
    return data;
  },
};
