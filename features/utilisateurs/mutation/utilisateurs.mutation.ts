import { useMutation, useQueryClient } from '@tanstack/react-query';
import { utilisateursApi, type CreateUtilisateurDto } from '../api/utilisateurs.api';
import { UTILISATEURS_KEYS } from '../query/utilisateurs.query';
import { toast } from 'sonner';

export function useCreateUtilisateur() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUtilisateurDto) => utilisateursApi.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: UTILISATEURS_KEYS.all }); toast.success('Utilisateur créé'); },
    onError: () => toast.error('Erreur lors de la création'),
  });
}

export function useUpdateUtilisateur() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateUtilisateurDto> }) => utilisateursApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: UTILISATEURS_KEYS.all }); toast.success('Utilisateur mis à jour'); },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });
}

export function useDeleteUtilisateur() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => utilisateursApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: UTILISATEURS_KEYS.all }); toast.success('Utilisateur supprimé'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
}
