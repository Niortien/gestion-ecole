import { z } from 'zod';
import { StatutPresence } from '@/lib/types';

export const appelClasseSchema = z.object({
  classeId: z.number(),
  date: z.string().min(1),
  presences: z.array(z.object({
    eleveId: z.number(),
    statut: z.nativeEnum(StatutPresence),
    motif: z.string().optional(),
  })),
});

export type AppelClasseFormValues = z.infer<typeof appelClasseSchema>;
