import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { presencesApi } from '../api/presences.api';
import { PRESENCES_KEYS } from '../query/presences.query';
import type { AppelClasseFormValues } from '../schema/presences.schema';

export const useAppelClasse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AppelClasseFormValues) => presencesApi.appel(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PRESENCES_KEYS.all }); toast.success('Appel enregistré'); },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });
};
