import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bulletinsApi } from '../api/bulletins.api';
import { BULLETINS_KEYS } from '../query/bulletins.query';
import type { GenerateBulletinFormValues } from '../schema/bulletins.schema';

export const useGenererBulletins = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateBulletinFormValues) => bulletinsApi.generer(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: BULLETINS_KEYS.all }); toast.success('Bulletins générés'); },
    onError: () => toast.error('Erreur lors de la génération'),
  });
};

export const usePublierBulletin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bulletinsApi.publier(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: BULLETINS_KEYS.all }); toast.success('Bulletin publié'); },
    onError: () => toast.error('Erreur lors de la publication'),
  });
};
