import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Container } from '@/components/container';
import { Stack, useRouter } from 'expo-router';
import { Button } from '@/components/ui';
import { InvitationCard, EmptyInvitations } from '@/components/invite-friend';
import { useInvitations } from '@/hooks/use-invitations';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import { useState } from 'react';

export default function InviteFriendScreen() {
    const router = useRouter();
    const { invitations, isLoading, cancelInvitation, cancelingId, invitationCount } = useInvitations();
    const [refreshing, setRefreshing] = useState(false);

    const handleSendInvitation = () => {
        router.push('/(invite-friend)/send-invitation');
    };

    const onRefresh = async () => {
        setRefreshing(true);
        // La query se refrescará automáticamente
        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <>
                <View className="flex-1 bg-gray-50">
                    <View className="bg-white px-4 py-4 pb-6 border-b border-gray-100">
                        <Button
                            onPress={handleSendInvitation}
                            variant="primary"
                            size="lg"
                            className="w-full"
                            disabled={invitationCount.remaining <= 0}
                        >
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="person-add" size={20} color="white" />
                                <Text className="text-white font-bold text-base ml-2">
                                    Enviar nueva invitación
                                </Text>
                            </View>
                        </Button>

                        {/* Contador discreto */}
                        <View className="mt-3 flex-row items-center justify-center">
                            <Ionicons
                                name="information-circle-outline"
                                size={14}
                                color={invitationCount.remaining === 0 ? "#EF4444" : invitationCount.remaining <= 2 ? "#F59E0B" : "#6B7280"}
                            />
                            <Text
                                className={`text-xs ml-1.5 ${invitationCount.remaining === 0
                                        ? 'text-red-600 font-semibold'
                                        : invitationCount.remaining <= 2
                                            ? 'text-amber-600 font-medium'
                                            : 'text-gray-600'
                                    }`}
                            >
                                {invitationCount.remaining === 0
                                    ? 'Sin invitaciones disponibles este mes'
                                    : `${invitationCount.remaining} de ${invitationCount.max} invitaciones disponibles`
                                }
                            </Text>
                        </View>
                    </View>

                    {/* Lista de invitaciones */}
                    {isLoading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color={AppColors.primary.yellow} />
                            <Text className="text-gray-600 mt-4">Cargando invitaciones...</Text>
                        </View>
                    ) : (
                        <ScrollView
                            className="flex-1"
                            contentContainerStyle={{ flexGrow: 1 }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor={AppColors.primary.yellow}
                                />
                            }
                        >
                            {invitations.length === 0 ? (
                                <EmptyInvitations />
                            ) : (
                                <View className="p-4">
                                    <Text className="text-sm font-semibold text-gray-700 mb-3">
                                        {invitations.length} {invitations.length === 1 ? 'invitación pendiente' : 'invitaciones pendientes'}
                                    </Text>
                                    {invitations.map((invitation) => (
                                        <InvitationCard
                                            key={invitation._id}
                                            invitation={invitation}
                                            onCancel={cancelInvitation}
                                            isLoading={cancelingId === invitation._id}
                                        />
                                    ))}
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>
            </>
        </>
    );
}
