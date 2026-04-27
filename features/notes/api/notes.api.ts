import api from '@/lib/api';
import type { Note, Periode } from '@/lib/types';
import type { CreateNoteFormValues } from '../schema/notes.schema';

export interface NoteFilters {
  periode?: Periode;
  anneeScolaireId?: number;
}

export const notesApi = {
  byClasse: (classeId: number, params?: NoteFilters) =>
    api.get<Note[]>(`/notes/classe/${classeId}`, { params }),
  byEleve: (eleveId: number, params?: { anneeScolaireId?: number }) =>
    api.get<Note[]>(`/notes/eleve/${eleveId}`, { params }),
  create: (data: CreateNoteFormValues) => api.post<Note>('/notes', data),
  update: (id: number, data: Partial<CreateNoteFormValues>) => api.put<Note>(`/notes/${id}`, data),
  delete: (id: number) => api.delete(`/notes/${id}`),
};
