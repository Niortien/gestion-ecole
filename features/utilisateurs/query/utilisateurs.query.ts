import { useQuery } from '@tanstack/react-query';
import { utilisateursApi } from '../api/utilisateurs.api';

export const UTILISATEURS_KEYS = {
  all: ['utilisateurs'] as const,
  list: () => [...UTILISATEURS_KEYS.all, 'list'] as const,
};

export function useUtilisateurs() {
  return useQuery({
    queryKey: UTILISATEURS_KEYS.list(),
    queryFn: utilisateursApi.list,
  });
}
