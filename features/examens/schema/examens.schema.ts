import { z } from 'zod';
import { TypeExamen } from '@/lib/types';

export const createExamenSchema = z.object({
  libelle: z.string().min(2),
  type: z.nativeEnum(TypeExamen),
  classeId: z.number(),
  matiereId: z.number().optional(),
  date: z.string().min(1),
  dureeMinutes: z.number().int().optional(),
  anneeScolaireId: z.number(),
});

export const updateExamenSchema = createExamenSchema.partial();
export type CreateExamenFormValues = z.infer<typeof createExamenSchema>;
export type UpdateExamenFormValues = z.infer<typeof updateExamenSchema>;
