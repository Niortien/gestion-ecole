import { z } from 'zod';

export const createAnneeScolaireSchema = z.object({
  libelle: z.string().regex(/^\d{4}-\d{4}$/, 'Format: 2025-2026'),
  dateDebut: z.string().min(1, 'Date de début requise'),
  dateFin: z.string().min(1, 'Date de fin requise'),
  estActive: z.boolean().default(false),
});

export const updateAnneeScolaireSchema = createAnneeScolaireSchema.partial();
export type CreateAnneeScolaireFormValues = z.infer<typeof createAnneeScolaireSchema>;
export type UpdateAnneeScolaireFormValues = z.infer<typeof updateAnneeScolaireSchema>;
