import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import type { MessageQuota } from '@/types/chat.types';

interface QuotaIndicatorProps {
  quota: MessageQuota | null;
}

export function QuotaIndicator({ quota }: QuotaIndicatorProps) {
  if (!quota) return null;

  const remaining = quota.remaining;
  const total = 20;
  const percentage = (remaining / total) * 100;

  // Determinar color según el nivel
  const getColor = () => {
    if (percentage > 50) return '#10B981'; // Verde
    if (percentage > 20) return AppColors.primary.yellow; // Amarillo
    return '#EF4444'; // Rojo
  };

  const getIcon = () => {
    if (percentage > 50) return 'checkmark-circle';
    if (percentage > 20) return 'warning';
    return 'alert-circle';
  };

  return (
    <View className="px-4 py-2 bg-gray-50 border-b border-gray-200">
      <View className="flex-row items-center">
        <Ionicons name={getIcon()} size={16} color={getColor()} />
        <Text className="ml-2 text-sm text-gray-700">
          <Text className="font-semibold" style={{ color: getColor() }}>
            {remaining} mensajes gratuitos
          </Text>
          {' restantes de '}
          <Text className="font-semibold">{total}</Text>
        </Text>
      </View>
      
      {/* Barra de progreso */}
      <View className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor(),
          }}
        />
      </View>

      {remaining === 0 && (
        <Text className="text-xs text-red-600 mt-1">
          Has agotado tus mensajes gratuitos. Contacta al entrenador para contratar sus servicios.
        </Text>
      )}
    </View>
  );
}
