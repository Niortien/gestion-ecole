import { useQuery } from '@tanstack/react-query';
import { notesApi, type NoteFilters } from '../api/notes.api';
import type { Periode } from '@/lib/types';

export const NOTES_KEYS = {
  all: ['notes'] as const,
  byClasse: (classeId: number, filters?: NoteFilters) => ['notes', 'classe', classeId, filters] as const,
  byEleve: (eleveId: number, anneeScolaireId?: number) => ['notes', 'eleve', eleveId, anneeScolaireId] as const,
};

export const useNotesByClasse = (classeId: number, filters?: NoteFilters) =>
  useQuery({
    queryKey: NOTES_KEYS.byClasse(classeId, filters),
    queryFn: () => notesApi.byClasse(classeId, filters).then((r) => r.data),
    enabled: !!classeId,
  });

export const useNotesByEleve = (eleveId: number, params?: { anneeScolaireId?: number }) =>
  useQuery({
    queryKey: NOTES_KEYS.byEleve(eleveId, params?.anneeScolaireId),
    queryFn: () => notesApi.byEleve(eleveId, params).then((r) => r.data),
    enabled: !!eleveId,
  });
