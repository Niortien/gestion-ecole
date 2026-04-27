import { z } from 'zod';

export const createParentSchema = z.object({
  nom: z.string().min(2),
  prenom: z.string().min(2),
  telephone: z.string().optional(),
  telephoneUrgence: z.string().optional(),
  profession: z.string().optional(),
  adresse: z.string().optional(),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

export const updateParentSchema = createParentSchema.omit({ email: true, password: true }).partial();
export type CreateParentFormValues = z.infer<typeof createParentSchema>;
export type UpdateParentFormValues = z.infer<typeof updateParentSchema>;
