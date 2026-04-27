import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { elevesApi } from '../api/eleves.api';
import { ELEVES_KEYS } from '../query/eleves.query';
import type { CreateEleveFormValues, UpdateEleveFormValues } from '../schema/eleves.schema';

export const useCreateEleve = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEleveFormValues) => elevesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ELEVES_KEYS.all });
      toast.success('Élève inscrit avec succès');
    },
    onError: () => toast.error("Erreur lors de l'inscription"),
  });
};

export const useUpdateEleve = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEleveFormValues) => elevesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ELEVES_KEYS.all });
      qc.invalidateQueries({ queryKey: ELEVES_KEYS.detail(id) });
      toast.success('Élève modifié avec succès');
    },
    onError: () => toast.error('Erreur lors de la modification'),
  });
};

export const useDeleteEleve = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => elevesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ELEVES_KEYS.all });
      toast.success('Élève supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
};

export const useUpdateStatutEleve = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (statut: string) => elevesApi.updateStatut(id, statut),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ELEVES_KEYS.all });
      qc.invalidateQueries({ queryKey: ELEVES_KEYS.detail(id) });
      toast.success('Statut mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour du statut'),
  });
};

export const useUploadPhotoEleve = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => elevesApi.uploadPhoto(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ELEVES_KEYS.detail(id) });
      toast.success('Photo mise à jour');
    },
    onError: () => toast.error('Erreur lors du téléchargement'),
  });
};
