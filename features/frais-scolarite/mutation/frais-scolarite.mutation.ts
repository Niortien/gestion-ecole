import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fraisScolariteApi, type CreateFraisScolariteDto } from '../api/frais-scolarite.api';
import { FRAIS_KEYS } from '../query/frais-scolarite.query';
import { toast } from 'sonner';

export function useCreateFraisScolarite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFraisScolariteDto) => fraisScolariteApi.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: FRAIS_KEYS.all }); toast.success('Frais créé'); },
    onError: () => toast.error('Erreur lors de la création'),
  });
}

export function useUpdateFraisScolarite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateFraisScolariteDto> }) => fraisScolariteApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: FRAIS_KEYS.all }); toast.success('Frais mis à jour'); },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });
}

export function useDeleteFraisScolarite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fraisScolariteApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: FRAIS_KEYS.all }); toast.success('Frais supprimé'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
}
