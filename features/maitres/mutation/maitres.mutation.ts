import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { maitresApi } from '../api/maitres.api';
import { MAITRES_KEYS } from '../query/maitres.query';
import type { CreateMaitreFormValues, UpdateMaitreFormValues } from '../schema/maitres.schema';

export const useCreateMaitre = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaitreFormValues) => maitresApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: MAITRES_KEYS.all }); toast.success('Enseignant créé'); },
    onError: () => toast.error('Erreur lors de la création'),
  });
};

export const useUpdateMaitre = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMaitreFormValues) => maitresApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: MAITRES_KEYS.all }); qc.invalidateQueries({ queryKey: MAITRES_KEYS.detail(id) }); toast.success('Enseignant modifié'); },
    onError: () => toast.error('Erreur lors de la modification'),
  });
};

export const useDeleteMaitre = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => maitresApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: MAITRES_KEYS.all }); toast.success('Enseignant supprimé'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
};
