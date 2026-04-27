export { useMatieres, useMatiere, MATIERES_KEYS } from './query/matieres.query';
export { useCreateMatiere, useUpdateMatiere, useDeleteMatiere } from './mutation/matieres.mutation';
export { matieresApi } from './api/matieres.api';
export { createMatiereSchema, updateMatiereSchema } from './schema/matieres.schema';
export type { CreateMatiereFormValues, UpdateMatiereFormValues } from './schema/matieres.schema';
