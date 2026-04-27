import api from '@/lib/api';
import type { Message } from '@/lib/types';

export interface SendMessageDto {
  destinataireId: number;
  sujet: string;
  contenu: string;
  conversationId?: string;
}

export const messageApi = {
  reception: async (): Promise<Message[]> => {
    const { data } = await api.get<Message[]>('/messagerie/reception');
    return data;
  },
  envoi: async (): Promise<Message[]> => {
    const { data } = await api.get<Message[]>('/messagerie/envoi');
    return data;
  },
  conversation: async (conversationId: string): Promise<Message[]> => {
    const { data } = await api.get<Message[]>(`/messagerie/conversation/${conversationId}`);
    return data;
  },
  nonLus: async (): Promise<Message[]> => {
    const { data } = await api.get<Message[]>('/messagerie/non-lus');
    return data;
  },
  send: async (dto: SendMessageDto): Promise<Message> => {
    const { data } = await api.post<Message>('/messagerie', dto);
    return data;
  },
  marquerLu: async (id: number): Promise<Message> => {
    const { data } = await api.patch<Message>(`/messagerie/${id}/lire`);
    return data;
  },
};
