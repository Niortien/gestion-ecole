import { useQuery } from '@tanstack/react-query';
import { messageApi } from '../api/messagerie.api';

export const MESSAGERIE_KEYS = {
  all: ['messagerie'] as const,
  reception: () => [...MESSAGERIE_KEYS.all, 'reception'] as const,
  envoi: () => [...MESSAGERIE_KEYS.all, 'envoi'] as const,
  nonLus: () => [...MESSAGERIE_KEYS.all, 'non-lus'] as const,
  conversation: (id: string) => [...MESSAGERIE_KEYS.all, 'conversation', id] as const,
};

export function useReception() {
  return useQuery({
    queryKey: MESSAGERIE_KEYS.reception(),
    queryFn: messageApi.reception,
  });
}

export function useEnvoi() {
  return useQuery({
    queryKey: MESSAGERIE_KEYS.envoi(),
    queryFn: messageApi.envoi,
  });
}

export function useNonLus() {
  return useQuery({
    queryKey: MESSAGERIE_KEYS.nonLus(),
    queryFn: messageApi.nonLus,
    refetchInterval: 30_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: MESSAGERIE_KEYS.nonLus(),
    queryFn: async () => {
      const msgs = await messageApi.nonLus();
      return msgs.length;
    },
    refetchInterval: 30_000,
    select: (count: number) => count,
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: MESSAGERIE_KEYS.conversation(conversationId),
    queryFn: () => messageApi.conversation(conversationId),
    enabled: !!conversationId,
  });
}
