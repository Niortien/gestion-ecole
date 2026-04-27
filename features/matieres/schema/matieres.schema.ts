import { z } from 'zod';
import { NiveauMatiere } from '@/lib/types';

export const createMatiereSchema = z.object({
  nom: z.string().min(2),
  code: z.string().min(1),
  coefficient: z.number().int().min(1).max(10),
  niveau: z.nativeEnum(NiveauMatiere),
});

export const updateMatiereSchema = createMatiereSchema.partial();
export type CreateMatiereFormValues = z.infer<typeof createMatiereSchema>;
export type UpdateMatiereFormValues = z.infer<typeof updateMatiereSchema>;
