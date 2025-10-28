import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import type { Conversation } from '@/types/chat.types';

interface ConversationCardProps {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
}

export function ConversationCard({ conversation, onPress }: ConversationCardProps) {
  const { other_participant, last_message_text, last_message_at, unread_count, status } = conversation;

  // Formatear la hora del último mensaje
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Mostrar hora si fue hoy
      return date.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else if (diffInHours < 168) {
      // Mostrar día de la semana si fue esta semana
      return date.toLocaleDateString('es-CO', { weekday: 'short' });
    } else {
      // Mostrar fecha completa
      return date.toLocaleDateString('es-CO', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  // Icono de avatar según el rol
  const avatarIcon = other_participant.role === 'TRAINER' ? 'fitness' : 'person';
  const avatarColor = other_participant.role === 'TRAINER' 
    ? AppColors.primary.yellow 
    : '#3B82F6';

  // Badge de estado de conversación
  const getStatusBadge = () => {
    if (status === 'CONTRACTED') {
      return (
        <View className="bg-green-100 px-2 py-0.5 rounded-full">
          <Text className="text-green-700 text-xs font-semibold">Contratado</Text>
        </View>
      );
    } else if (status === 'BLOCKED') {
      return (
        <View className="bg-red-100 px-2 py-0.5 rounded-full">
          <Text className="text-red-700 text-xs font-semibold">Bloqueado</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(conversation)}
      className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100"
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View 
        className="w-14 h-14 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${avatarColor}20` }}
      >
        <Ionicons name={avatarIcon} size={28} color={avatarColor} />
      </View>

      {/* Contenido */}
      <View className="flex-1">
        {/* Nombre y hora */}
        <View className="flex-row justify-between items-center mb-1">
          <Text 
            className="text-base font-semibold text-gray-900"
            numberOfLines={1}
            style={{ flex: 1, marginRight: 8 }}
          >
            {other_participant.name}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatTime(last_message_at)}
          </Text>
        </View>

        {/* Último mensaje y badge de estado */}
        <View className="flex-row justify-between items-center">
          <Text 
            className={`text-sm flex-1 ${unread_count > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
            numberOfLines={1}
            style={{ marginRight: 8 }}
          >
            {last_message_text || 'No hay mensajes'}
          </Text>
          
          {/* Badge de mensajes no leídos o estado */}
          {unread_count > 0 ? (
            <View 
              className="min-w-[20px] h-5 rounded-full items-center justify-center px-1.5"
              style={{ backgroundColor: AppColors.primary.yellow }}
            >
              <Text className="text-white text-xs font-bold">
                {unread_count > 99 ? '99+' : unread_count}
              </Text>
            </View>
          ) : (
            getStatusBadge()
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
