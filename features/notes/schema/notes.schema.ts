import { z } from 'zod';
import { Periode } from '@/lib/types';

export const createNoteSchema = z.object({
  eleveId: z.number(),
  matiereId: z.number(),
  classeId: z.number(),
  anneeScolaireId: z.number(),
  periode: z.nativeEnum(Periode),
  valeur: z.number().min(0).max(20),
  observation: z.string().optional(),
});

export const batchCreateNoteSchema = z.object({
  notes: z.array(createNoteSchema),
});

export type CreateNoteFormValues = z.infer<typeof createNoteSchema>;
export type BatchCreateNoteFormValues = z.infer<typeof batchCreateNoteSchema>;
