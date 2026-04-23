import api from '@/lib/api';
import type { Paiement, ModePaiement, SituationFinanciere } from '@/lib/types';

export interface CreatePaiementDto {
  eleveId: number;
  fraisScolariteId: number;
  montant: number;
  datePaiement: string;
  modePaiement?: ModePaiement;
  referencePaiement?: string;
  commentaire?: string;
}

export const paiementsApi = {
  list: async (params?: { dateDebut?: string; dateFin?: string }): Promise<Paiement[]> => {
    const { data } = await api.get<Paiement[]>('/paiements', { params });
    return data;
  },
  byEleve: async (eleveId: number): Promise<Paiement[]> => {
    const { data } = await api.get<Paiement[]>(`/paiements/eleve/${eleveId}`);
    return data;
  },
  situation: async (eleveId: number, params?: { anneeScolaireId?: number }): Promise<SituationFinanciere> => {
    const { data } = await api.get<SituationFinanciere>(`/paiements/eleve/${eleveId}/situation`, { params });
    return data;
  },
  create: async (dto: CreatePaiementDto): Promise<Paiement> => {
    const { data } = await api.post<Paiement>('/paiements', dto);
    return data;
  },
  annuler: async (id: number): Promise<Paiement> => {
    const { data } = await api.patch<Paiement>(`/paiements/${id}/annuler`);
    return data;
  },
};
