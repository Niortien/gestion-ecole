import { z } from 'zod';

export const createDevoirSchema = z.object({
  titre: z.string().min(2),
  description: z.string().optional(),
  matiereId: z.number(),
  classeId: z.number(),
  dateDonnee: z.string().min(1),
  dateRendu: z.string().optional(),
});

export const updateDevoirSchema = createDevoirSchema.partial();
export type CreateDevoirFormValues = z.infer<typeof createDevoirSchema>;
export type UpdateDevoirFormValues = z.infer<typeof updateDevoirSchema>;
