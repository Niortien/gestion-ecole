import { useQuery } from '@tanstack/react-query';
import { classesApi, type ClasseFilters } from '../api/classes.api';

export const CLASSES_KEYS = {
  all: ['classes'] as const,
  list: (filters?: ClasseFilters) => ['classes', 'list', filters] as const,
  detail: (id: number) => ['classes', 'detail', id] as const,
};

export const useClasses = (filters?: ClasseFilters) =>
  useQuery({ queryKey: CLASSES_KEYS.list(filters), queryFn: () => classesApi.getAll(filters).then((r) => r.data) });

export const useClasse = (id: number) =>
  useQuery({ queryKey: CLASSES_KEYS.detail(id), queryFn: () => classesApi.getById(id).then((r) => r.data), enabled: !!id });
