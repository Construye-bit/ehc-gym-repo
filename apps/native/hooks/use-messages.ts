import { useQuery, useMutation } from 'convex/react';
import { useState, useCallback, useEffect } from 'react';
import api from '@/api';
import type { Id } from '@/api';
import type { MessagesResponse, OptimisticMessage, SendMessageResult } from '@/types/chat.types';

const DEFAULT_LIMIT = 50;

export function useMessages(conversationId: Id<'conversations'> | null) {
  const [limit] = useState(DEFAULT_LIMIT);
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);

  // Obtener mensajes de la conversación
  const data = useQuery(
    api.chat.messages.queries.get,
    conversationId ? { conversationId, limit } : 'skip'
  ) as MessagesResponse | undefined;

  const sendMutation = useMutation(api.chat.messages.mutations.send);
  const markAsReadMutation = useMutation(api.chat.messages.mutations.markAsRead);

  const isLoading = data === undefined && conversationId !== null;
  const messages = data?.messages || [];
  const hasMore = data?.nextCursor !== null;

  // Combinar mensajes reales con optimistas
  const allMessages = [...messages, ...optimisticMessages].sort(
    (a, b) => a.created_at - b.created_at
  );

  // Enviar mensaje con estado optimista
  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId || !text.trim()) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: OptimisticMessage = {
        _id: tempId,
        conversation_id: conversationId,
        text: text.trim(),
        is_mine: true,
        created_at: Date.now(),
        status: 'SENDING',
      };

      // Agregar mensaje optimista
      setOptimisticMessages((prev) => [...prev, optimisticMsg]);

      try {
        await sendMutation({
          conversationId,
          text: text.trim(),
        });

        // Remover mensaje optimista al confirmar
        setOptimisticMessages((prev) => prev.filter((m) => m._id !== tempId));
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Marcar como error y permitir reintento
        setOptimisticMessages((prev) =>
          prev.map((m) =>
            m._id === tempId
              ? {
                  ...m,
                  status: 'ERROR' as const,
                  error: error instanceof Error ? error.message : 'Error al enviar',
                }
              : m
          )
        );
      }
    },
    [conversationId, sendMutation]
  );

  // Reintentar mensaje fallido
  const retryMessage = useCallback(
    async (tempId: string) => {
      const failedMsg = optimisticMessages.find((m) => m._id === tempId);
      if (!failedMsg || !conversationId) return;

      // Actualizar estado a enviando
      setOptimisticMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, status: 'SENDING' as const } : m))
      );

      try {
        await sendMutation({
          conversationId,
          text: failedMsg.text,
        });

        // Remover al confirmar
        setOptimisticMessages((prev) => prev.filter((m) => m._id !== tempId));
      } catch (error) {
        console.error('Error retrying message:', error);
        
        // Volver a marcar como error
        setOptimisticMessages((prev) =>
          prev.map((m) =>
            m._id === tempId
              ? {
                  ...m,
                  status: 'ERROR' as const,
                  error: error instanceof Error ? error.message : 'Error al enviar',
                }
              : m
          )
        );
      }
    },
    [optimisticMessages, conversationId, sendMutation]
  );

  // Marcar mensajes como leídos
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      await markAsReadMutation({ conversationId });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [conversationId, markAsReadMutation]);

  // Auto-marcar como leído cuando se abra la conversación o lleguen mensajes nuevos
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      // Verificar si hay mensajes no leídos del otro usuario
      const hasUnreadFromOther = messages.some(
        (msg) => !msg.is_mine && (!msg.read_at || msg.status === 'SENT')
      );
      
      if (hasUnreadFromOther) {
        markAsRead();
      }
    }
  }, [conversationId, messages.length]); // Ejecutar cuando cambie la conversación o lleguen nuevos mensajes

  return {
    messages: allMessages,
    isLoading,
    hasMore,
    sendMessage,
    retryMessage,
    markAsRead,
  };
}
