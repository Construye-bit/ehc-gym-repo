import { useQuery, useConvexAuth } from 'convex/react';
import { useState, useCallback } from 'react';
import api from '@/api';
import type { ConversationsResponse } from '@/types/chat.types';

const DEFAULT_LIMIT = 20;

export function useConversations() {
  const { isAuthenticated } = useConvexAuth();
  const [limit] = useState(DEFAULT_LIMIT);

  // Obtener conversaciones del usuario actual solo si está autenticado
  const data = useQuery(
    api.chat.conversations.queries.listMine,
    isAuthenticated ? { limit } : 'skip'
  ) as ConversationsResponse | undefined;

  const isLoading = data === undefined && isAuthenticated;
  const conversations = data?.conversations || [];
  const hasMore = data?.nextCursor !== null;

  // Función para refrescar (expone el query reactivo de Convex)
  const refresh = useCallback(() => {
    // Convex maneja el refresh automáticamente
    // Esta función existe para compatibilidad de API
  }, []);

  return {
    conversations,
    isLoading,
    hasMore,
    refresh,
  };
}
