import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { devoirsApi } from '../api/devoirs.api';
import { DEVOIRS_KEYS } from '../query/devoirs.query';
import type { CreateDevoirFormValues, UpdateDevoirFormValues } from '../schema/devoirs.schema';

export const useCreateDevoir = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDevoirFormValues) => devoirsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: DEVOIRS_KEYS.all }); toast.success('Devoir créé'); },
    onError: () => toast.error('Erreur lors de la création'),
  });
};

export const useUpdateDevoir = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDevoirFormValues) => devoirsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: DEVOIRS_KEYS.all }); toast.success('Devoir modifié'); },
    onError: () => toast.error('Erreur lors de la modification'),
  });
};

export const useDeleteDevoir = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => devoirsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: DEVOIRS_KEYS.all }); toast.success('Devoir supprimé'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
};
