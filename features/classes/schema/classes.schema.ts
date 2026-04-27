import { z } from 'zod';
import { NomClasse, NiveauClasse } from '@/lib/types';

export const createClasseSchema = z.object({
  nom: z.nativeEnum(NomClasse),
  libelle: z.string().optional(),
  niveau: z.nativeEnum(NiveauClasse),
  capacite: z.number().int().min(1).max(100),
  anneeScolaireId: z.number({ error: 'Année scolaire requise' }),
});

export const updateClasseSchema = createClasseSchema.partial();
export type CreateClasseFormValues = z.infer<typeof createClasseSchema>;
export type UpdateClasseFormValues = z.infer<typeof updateClasseSchema>;
