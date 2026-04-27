import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parentsApi } from '../api/parents.api';
import { PARENTS_KEYS } from '../query/parents.query';
import type { CreateParentFormValues, UpdateParentFormValues } from '../schema/parents.schema';

export const useCreateParent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateParentFormValues) => parentsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PARENTS_KEYS.all }); toast.success('Parent créé'); },
    onError: () => toast.error('Erreur lors de la création'),
  });
};

export const useUpdateParent = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateParentFormValues) => parentsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PARENTS_KEYS.all }); toast.success('Parent modifié'); },
    onError: () => toast.error('Erreur lors de la modification'),
  });
};

export const useDeleteParent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => parentsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PARENTS_KEYS.all }); toast.success('Parent supprimé'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
};
