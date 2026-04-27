import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { anneesScolairesApi } from '../api/annees-scolaires.api';
import { ANNEES_KEYS } from '../query/annees-scolaires.query';
import type { CreateAnneeScolaireFormValues, UpdateAnneeScolaireFormValues } from '../schema/annees-scolaires.schema';

export const useCreateAnneeScolaire = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnneeScolaireFormValues) => anneesScolairesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ANNEES_KEYS.all }); toast.success('Année scolaire créée'); },
    onError: () => toast.error('Erreur lors de la création'),
  });
};

export const useUpdateAnneeScolaire = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAnneeScolaireFormValues) => anneesScolairesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ANNEES_KEYS.all }); toast.success('Année scolaire modifiée'); },
    onError: () => toast.error('Erreur lors de la modification'),
  });
};

export const useActivateAnneeScolaire = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => anneesScolairesApi.activate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ANNEES_KEYS.all }); toast.success('Année scolaire activée'); },
    onError: () => toast.error('Erreur lors de l\'activation'),
  });
};

export const useDeleteAnneeScolaire = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => anneesScolairesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ANNEES_KEYS.all }); toast.success('Année scolaire supprimée'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
};
