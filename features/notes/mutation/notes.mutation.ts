import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notesApi } from '../api/notes.api';
import { NOTES_KEYS } from '../query/notes.query';
import type { CreateNoteFormValues } from '../schema/notes.schema';

export const useCreateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoteFormValues) => notesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: NOTES_KEYS.all }); toast.success('Note enregistrée'); },
    onError: () => toast.error('Erreur lors de l\'enregistrement'),
  });
};

export const useUpdateNote = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateNoteFormValues>) => notesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: NOTES_KEYS.all }); toast.success('Note modifiée'); },
    onError: () => toast.error('Erreur lors de la modification'),
  });
};

export const useDeleteNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: NOTES_KEYS.all }); toast.success('Note supprimée'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
};
