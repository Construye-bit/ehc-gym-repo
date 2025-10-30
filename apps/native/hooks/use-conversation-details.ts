import { useQuery } from 'convex/react';
import api from '@/api';
import type { Id } from '@/api';
import type { ConversationDetails } from '@/types/chat.types';

export function useConversationDetails(conversationId: Id<'conversations'> | null) {
  const data = useQuery(
    api.chat.conversations.queries.get,
    conversationId ? { conversationId } : 'skip'
  ) as ConversationDetails | undefined;

  const isLoading = data === undefined && conversationId !== null;

  return {
    conversation: data,
    isLoading,
  };
}
