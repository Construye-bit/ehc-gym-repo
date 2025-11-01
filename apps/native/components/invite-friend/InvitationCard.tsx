import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import type { Doc } from '@/api';

interface InvitationCardProps {
    invitation: Doc<'invitations'>;
    onCancel: (invitationId: string) => void;
    isLoading?: boolean;
}

export function InvitationCard({ invitation, onCancel, isLoading }: InvitationCardProps) {
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getDaysRemaining = () => {
        const now = Date.now();
        const diff = invitation.expires_at - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const handleCancelPress = () => {
        Alert.alert(
            'Cancelar invitación',
            `¿Estás seguro de que deseas cancelar la invitación para ${invitation.invitee_name || invitation.invitee_email}?`,
            [
                {
                    text: 'No',
                    style: 'cancel'
                },
                {
                    text: 'Sí, cancelar',
                    style: 'destructive',
                    onPress: () => onCancel(invitation._id)
                }
            ]
        );
    };

    const daysRemaining = getDaysRemaining();

    return (
        <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
            {/* Header con nombre y estado */}
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-3">
                    <Text className="text-lg font-bold text-gray-900 mb-1">
                        {invitation.invitee_name || 'Sin nombre'}
                    </Text>
                    {invitation.invitee_email && (
                        <View className="flex-row items-center">
                            <Ionicons name="mail-outline" size={14} color="#6B7280" />
                            <Text className="text-sm text-gray-600 ml-1" numberOfLines={1}>
                                {invitation.invitee_email}
                            </Text>
                        </View>
                    )}
                    {invitation.invitee_phone && (
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="call-outline" size={14} color="#6B7280" />
                            <Text className="text-sm text-gray-600 ml-1">
                                {invitation.invitee_phone}
                            </Text>
                        </View>
                    )}
                    {invitation.invitee_document_number && (
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="card-outline" size={14} color="#6B7280" />
                            <Text className="text-sm text-gray-600 ml-1">
                                CC {invitation.invitee_document_number}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Badge de estado */}
                <View className="bg-yellow-100 px-3 py-1 rounded-full">
                    <Text className="text-yellow-700 text-xs font-semibold">
                        {invitation.status === 'PENDING' ? 'Pendiente' : invitation.status}
                    </Text>
                </View>
            </View>

            {/* Información de fechas */}
            <View className="flex-row justify-between items-center mb-3 pt-3 border-t border-gray-100">
                <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">Enviada</Text>
                    <Text className="text-sm font-medium text-gray-700">
                        {formatDate(invitation.created_at)}
                    </Text>
                </View>
                <View className="flex-1 items-end">
                    <Text className="text-xs text-gray-500 mb-1">Expira en</Text>
                    <Text className={`text-sm font-semibold ${daysRemaining <= 2 ? 'text-red-600' : 'text-gray-700'}`}>
                        {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}
                    </Text>
                </View>
            </View>

            {/* Botón de cancelar */}
            <TouchableOpacity
                onPress={handleCancelPress}
                disabled={isLoading}
                className={`flex-row items-center justify-center py-3 rounded-xl border-2 border-red-500 ${isLoading ? 'opacity-50' : ''}`}
                activeOpacity={0.7}
            >
                <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                <Text className="text-red-500 font-semibold ml-2">
                    {isLoading ? 'Cancelando...' : 'Cancelar invitación'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
