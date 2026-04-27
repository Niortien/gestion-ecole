import { useMutation, useQueryClient } from '@tanstack/react-query';
import { depensesApi, type CreateDepenseDto } from '../api/depenses.api';
import { DEPENSES_KEYS } from '../query/depenses.query';
import { toast } from 'sonner';

export function useCreateDepense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDepenseDto) => depensesApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEPENSES_KEYS.all });
      toast.success('Dépense enregistrée');
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement'),
  });
}

export function useDeleteDepense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => depensesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEPENSES_KEYS.all });
      toast.success('Dépense supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
}
