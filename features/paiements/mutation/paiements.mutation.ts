import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paiementsApi, type CreatePaiementDto } from '../api/paiements.api';
import { PAIEMENTS_KEYS } from '../query/paiements.query';
import { toast } from 'sonner';

export function useCreatePaiement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePaiementDto) => paiementsApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAIEMENTS_KEYS.all });
      toast.success('Paiement enregistré');
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement du paiement'),
  });
}

export function useAnnulerPaiement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => paiementsApi.annuler(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAIEMENTS_KEYS.all });
      toast.success('Paiement annulé');
    },
    onError: () => toast.error('Erreur lors de l\'annulation'),
  });
}
