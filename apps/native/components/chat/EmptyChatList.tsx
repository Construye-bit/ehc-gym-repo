import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyChatListProps {
  userRole: 'CLIENT' | 'TRAINER';
}

export function EmptyChatList({ userRole }: EmptyChatListProps) {
  const message = userRole === 'CLIENT'
    ? 'Aún no tienes conversaciones con entrenadores'
    : 'Aún no tienes conversaciones con clientes';

  const suggestion = userRole === 'CLIENT'
    ? 'Explora el catálogo de entrenadores para comenzar'
    : 'Los clientes podrán contactarte pronto';

  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-bold text-gray-900 text-center mb-2">
        {message}
      </Text>
      <Text className="text-sm text-gray-600 text-center">
        {suggestion}
      </Text>
    </View>
  );
}
