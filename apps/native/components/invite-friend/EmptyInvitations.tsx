import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function EmptyInvitations() {
    return (
        <View className="flex-1 justify-center items-center p-8 mt-12">
            <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
                No hay invitaciones pendientes
            </Text>
            <Text className="text-gray-600 text-center max-w-xs">
                Cuando envíes invitaciones a tus amigos, aparecerán aquí hasta que las rediman o expiren.
            </Text>
        </View>
    );
}
