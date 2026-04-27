import { useQuery } from '@tanstack/react-query';
import { examensApi, type ExamenFilters } from '../api/examens.api';

export const EXAMENS_KEYS = {
  all: ['examens'] as const,
  list: (filters?: ExamenFilters) => ['examens', 'list', filters] as const,
};

export const useExamens = (filters?: ExamenFilters) =>
  useQuery({ queryKey: EXAMENS_KEYS.list(filters), queryFn: () => examensApi.getAll(filters).then((r) => r.data) });
