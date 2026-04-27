import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { classesApi } from '../api/classes.api';
import { CLASSES_KEYS } from '../query/classes.query';
import type { CreateClasseFormValues, UpdateClasseFormValues } from '../schema/classes.schema';

export const useCreateClasse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClasseFormValues) => classesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: CLASSES_KEYS.all }); toast.success('Classe créée'); },
    onError: () => toast.error('Erreur lors de la création'),
  });
};

export const useUpdateClasse = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClasseFormValues) => classesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: CLASSES_KEYS.all }); toast.success('Classe modifiée'); },
    onError: () => toast.error('Erreur lors de la modification'),
  });
};

export const useDeleteClasse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: CLASSES_KEYS.all }); toast.success('Classe supprimée'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
};
