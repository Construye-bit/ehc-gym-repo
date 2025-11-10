import { useState, useCallback, useEffect } from 'react';
import { useAction, useQuery } from 'convex/react';
import api from '@/api';
import type { Id } from '@/api';

export interface AIMessage {
    _id: string;
    text: string;
    is_mine: boolean;
    created_at: number;
    status?: 'SENDING' | 'SENT' | 'ERROR';
    error?: string;
}

export interface AIThread {
    threadId: string;
    messages: AIMessage[];
}

export function useAIChat() {
    const [threadId, setThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Actions (no mutations, porque las actions del AI son actions)
    const startConversationAction = useAction(api.chat.ai.actions.startConversation);
    const generateResponseAction = useAction(api.chat.ai.actions.generateResponse);

    // Query para obtener mensajes del thread actual
    const threadMessages = useQuery(
        api.chat.ai.queries.listThreadMessages,
        threadId ? { threadId, paginationOpts: { numItems: 100, cursor: null } } : 'skip'
    );

    // Actualizar mensajes cuando cambien
    useEffect(() => {
        if (threadMessages?.page) {
            const formattedMessages: AIMessage[] = threadMessages.page.map((msg: any) => ({
                _id: msg._id,
                text: msg.text || '',
                is_mine: msg.role === 'user',
                created_at: msg._creationTime,
                status: 'SENT',
            }));
            setMessages(formattedMessages);
        }
    }, [threadMessages]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        // Agregar mensaje optimista del usuario
        const optimisticMessage: AIMessage = {
            _id: `temp-${Date.now()}`,
            text: text.trim(),
            is_mine: true,
            created_at: Date.now(),
            status: 'SENDING',
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        setIsLoading(true);

        try {
            let currentThreadId = threadId;

            // Si no hay thread, crear uno nuevo
            if (!currentThreadId) {
                const result = await startConversationAction({
                    prompt: text.trim(),
                });

                currentThreadId = result.threadId;
                setThreadId(currentThreadId);

                // Actualizar mensaje optimista a SENT
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === optimisticMessage._id
                            ? { ...msg, status: 'SENT' as const }
                            : msg
                    )
                );

                // Agregar respuesta de la IA
                const aiMessage: AIMessage = {
                    _id: `ai-${Date.now()}`,
                    text: result.text,
                    is_mine: false,
                    created_at: Date.now(),
                    status: 'SENT',
                };

                setMessages((prev) => [...prev, aiMessage]);
            } else {
                // Continuar conversación existente
                const result = await generateResponseAction({
                    threadId: currentThreadId,
                    prompt: text.trim(),
                });

                // Actualizar mensaje optimista a SENT
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === optimisticMessage._id
                            ? { ...msg, status: 'SENT' as const }
                            : msg
                    )
                );

                // Agregar respuesta de la IA
                const aiMessage: AIMessage = {
                    _id: `ai-${Date.now()}`,
                    text: result.text,
                    is_mine: false,
                    created_at: Date.now(),
                    status: 'SENT',
                };

                setMessages((prev) => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error('Error sending AI message:', error);

            // Marcar mensaje como error
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === optimisticMessage._id
                        ? {
                            ...msg,
                            status: 'ERROR' as const,
                            error: error instanceof Error ? error.message : 'Error al enviar mensaje',
                        }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, [threadId, startConversationAction, generateResponseAction]);

    const retryMessage = useCallback(async (messageId: string) => {
        const message = messages.find((msg) => msg._id === messageId);
        if (!message || !message.is_mine) return;

        // Remover mensaje con error
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));

        // Reenviar
        await sendMessage(message.text);
    }, [messages, sendMessage]);

    const startNewConversation = useCallback(() => {
        setThreadId(null);
        setMessages([]);
    }, []);

    return {
        messages,
        isLoading,
        sendMessage,
        retryMessage,
        startNewConversation,
        hasThread: !!threadId,
    };
}
