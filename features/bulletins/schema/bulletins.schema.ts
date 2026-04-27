import { z } from 'zod';
import { Periode } from '@/lib/types';

export const generateBulletinSchema = z.object({
  classeId: z.number(),
  anneeScolaireId: z.number(),
  periode: z.nativeEnum(Periode),
});

export type GenerateBulletinFormValues = z.infer<typeof generateBulletinSchema>;
