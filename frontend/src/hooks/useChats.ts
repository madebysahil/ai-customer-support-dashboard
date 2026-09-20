import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const res = await api.get(`/chats`);
      return res.json();
    }
  });
}

export function useChatMessages(chatId: string | null) {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const res = await api.get(`/chats/${chatId}/messages`);
      return res.json();
    },
    enabled: !!chatId,
  });
}
