import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { examensApi } from '../api/examens.api';
import { EXAMENS_KEYS } from '../query/examens.query';
import type { CreateExamenFormValues, UpdateExamenFormValues } from '../schema/examens.schema';

export const useCreateExamen = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamenFormValues) => examensApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: EXAMENS_KEYS.all }); toast.success('Examen créé'); },
    onError: () => toast.error('Erreur lors de la création'),
  });
};

export const useUpdateExamen = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateExamenFormValues) => examensApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: EXAMENS_KEYS.all }); toast.success('Examen modifié'); },
    onError: () => toast.error('Erreur lors de la modification'),
  });
};

export const useDeleteExamen = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examensApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: EXAMENS_KEYS.all }); toast.success('Examen supprimé'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
};
