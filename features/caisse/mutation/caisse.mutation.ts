import { useMutation, useQueryClient } from '@tanstack/react-query';
import { caisseApi } from '../api/caisse.api';
import { CAISSE_KEYS } from '../query/caisse.query';
import { toast } from 'sonner';

export function useCloturerCaisse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => caisseApi.cloturer(date),
    onSuccess: () => { qc.invalidateQueries({ queryKey: CAISSE_KEYS.all }); toast.success('Caisse clôturée'); },
    onError: () => toast.error('Erreur lors de la clôture'),
  });
}
