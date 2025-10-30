import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Message, OptimisticMessage } from '@/types/chat.types';

interface MessageBubbleProps {
  message: Message | OptimisticMessage;
  onRetry?: (messageId: string) => void;
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isMine = message.is_mine;
  const isOptimistic = 'status' in message && (message.status === 'SENDING' || message.status === 'ERROR');
  const isError = 'status' in message && message.status === 'ERROR';
  const isSending = 'status' in message && message.status === 'SENDING';
  
  // Verificar si el mensaje fue leído (solo para mensajes reales, no optimistas)
  const isRead = !isOptimistic && 'read_at' in message && message.read_at !== undefined && message.read_at !== null;

  // Formatear hora
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View
      className={`flex-row mb-3 px-4 ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      <View
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isMine
            ? isError
              ? 'bg-red-100'
              : 'bg-yellow-400'
            : 'bg-gray-200'
        }`}
        style={{ opacity: isSending ? 0.7 : 1 }}
      >
        {/* Texto del mensaje */}
        <Text
          className={`text-base ${
            isMine ? (isError ? 'text-red-900' : 'text-gray-900') : 'text-gray-900'
          }`}
        >
          {message.text}
        </Text>

        {/* Footer: hora + estado */}
        <View className="flex-row items-center justify-end mt-1 space-x-1">
          <Text className={`text-xs ${isMine ? 'text-gray-700' : 'text-gray-600'}`}>
            {formatTime(message.created_at)}
          </Text>

          {/* Indicadores de estado */}
          {isMine && !isOptimistic && (
            <Ionicons
              name={isRead ? 'checkmark-done' : 'checkmark'}
              size={14}
              color="#4B5563"
            />
          )}

          {isSending && (
            <View className="ml-1">
              <Ionicons name="time-outline" size={14} color="#6B7280" />
            </View>
          )}

          {isError && onRetry && (
            <TouchableOpacity
              onPress={() => onRetry(message._id)}
              className="ml-1 p-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="refresh" size={14} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>

        {/* Mensaje de error */}
        {isError && 'error' in message && message.error && (
          <Text className="text-xs text-red-700 mt-1">
            {message.error}
          </Text>
        )}
      </View>
    </View>
  );
}
