import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { matieresApi } from '../api/matieres.api';
import { MATIERES_KEYS } from '../query/matieres.query';
import type { CreateMatiereFormValues, UpdateMatiereFormValues } from '../schema/matieres.schema';

export const useCreateMatiere = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMatiereFormValues) => matieresApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: MATIERES_KEYS.all }); toast.success('Matière créée'); },
    onError: () => toast.error('Erreur lors de la création'),
  });
};

export const useUpdateMatiere = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMatiereFormValues) => matieresApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: MATIERES_KEYS.all }); toast.success('Matière modifiée'); },
    onError: () => toast.error('Erreur lors de la modification'),
  });
};

export const useDeleteMatiere = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => matieresApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: MATIERES_KEYS.all }); toast.success('Matière supprimée'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
};
