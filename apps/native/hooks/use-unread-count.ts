import { useQuery } from 'convex/react';
import { useConvexAuth } from 'convex/react';
import api from '@/api';

/**
 * Hook para obtener el conteo total de mensajes sin leer
 * Suma los unread_count de todas las conversaciones del usuario
 */
export function useUnreadCount() {
  const { isAuthenticated } = useConvexAuth();

  // Solo hacer la query si el usuario está autenticado en Convex
  const data = useQuery(
    api.chat.conversations.queries.listMine,
    isAuthenticated ? { limit: 50 } : 'skip'
  );

  const isLoading = data === undefined && isAuthenticated;
  const conversations = data?.conversations || [];

  // Sumar todos los mensajes sin leer
  const unreadCount = conversations.reduce(
    (total, conversation) => total + (conversation.unread_count || 0),
    0
  );

  return {
    unreadCount,
    isLoading,
  };
}
