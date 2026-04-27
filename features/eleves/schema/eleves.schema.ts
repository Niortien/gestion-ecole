import { z } from 'zod';
import { StatutEleve, Sexe } from '@/lib/types';

export const createEleveSchema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  dateNaissance: z.string().min(1, 'Date de naissance requise'),
  lieuNaissance: z.string().optional(),
  sexe: z.nativeEnum(Sexe, { error: 'Sexe requis' }),
  numeroDossier: z.string().optional(),
  classeId: z.number({ error: 'Classe requise' }),
  parentId: z.number({ error: 'Parent requis' }),
  statut: z.nativeEnum(StatutEleve).default(StatutEleve.INSCRIT),
});

export const updateEleveSchema = createEleveSchema.partial();

export type CreateEleveFormValues = z.infer<typeof createEleveSchema>;
export type UpdateEleveFormValues = z.infer<typeof updateEleveSchema>;
