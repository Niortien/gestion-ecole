import { useMutation, useQueryClient } from '@tanstack/react-query';
import { messageApi, type SendMessageDto } from '../api/messagerie.api';
import { MESSAGERIE_KEYS } from '../query/messagerie.query';
import { toast } from 'sonner';

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SendMessageDto) => messageApi.send(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MESSAGERIE_KEYS.all });
      toast.success('Message envoyé');
    },
    onError: () => toast.error('Erreur lors de l\'envoi du message'),
  });
}

export function useMarquerLu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => messageApi.marquerLu(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MESSAGERIE_KEYS.all });
    },
  });
}
