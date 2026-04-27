import api from '@/lib/api';
import type { AuthResponse } from '@/lib/types';
import type { UserRole } from '@/lib/types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },
  register: async (email: string, password: string, role?: UserRole): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { email, password, role });
    return data;
  },
};
