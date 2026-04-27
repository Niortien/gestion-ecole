import { z } from 'zod';

export const createMaitreSchema = z.object({
  nom: z.string().min(2),
  prenom: z.string().min(2),
  telephone: z.string().optional(),
  diplome: z.string().optional(),
  specialite: z.string().optional(),
  dateEmbauche: z.string().optional(),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  classeIds: z.array(z.number()).optional(),
});

export const updateMaitreSchema = createMaitreSchema.omit({ email: true, password: true }).partial();
export type CreateMaitreFormValues = z.infer<typeof createMaitreSchema>;
export type UpdateMaitreFormValues = z.infer<typeof updateMaitreSchema>;
