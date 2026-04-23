import api from '@/lib/api';
import type { Note, Periode } from '@/lib/types';

export interface CreateNoteDto {
  eleveId: number;
  matiereId: number;
  classeId: number;
  anneeScolaireId: number;
  periode: Periode;
  valeur: number;
  observation?: string;
}

export const notesApi = {
  byClasse: async (classeId: number, params: { periode: Periode; anneeScolaireId: number }): Promise<Note[]> => {
    const { data } = await api.get<Note[]>(`/notes/classe/${classeId}`, { params });
    return data;
  },
  byEleve: async (eleveId: number, params?: { anneeScolaireId?: number }): Promise<Note[]> => {
    const { data } = await api.get<Note[]>(`/notes/eleve/${eleveId}`, { params });
    return data;
  },
  create: async (dto: CreateNoteDto): Promise<Note> => {
    const { data } = await api.post<Note>('/notes', dto);
    return data;
  },
  update: async (id: number, dto: Partial<CreateNoteDto>): Promise<Note> => {
    const { data } = await api.put<Note>(`/notes/${id}`, dto);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};
