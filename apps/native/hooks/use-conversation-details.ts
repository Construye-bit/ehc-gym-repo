import { useQuery, useConvexAuth } from 'convex/react';
import api from '@/api';
import type { Id } from '@/api';
import type { ConversationDetails } from '@/types/chat.types';

export function useConversationDetails(conversationId: Id<'conversations'> | null) {
  const { isAuthenticated } = useConvexAuth();

  const data = useQuery(
    api.chat.conversations.queries.get,
    (conversationId && isAuthenticated) ? { conversationId } : 'skip'
  ) as ConversationDetails | undefined;

  const isLoading = data === undefined && conversationId !== null && isAuthenticated;

  return {
    conversation: data,
    isLoading,
  };
}
