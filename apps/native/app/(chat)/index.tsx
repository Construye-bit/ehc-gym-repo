import { View, Text, TouchableOpacity, StatusBar, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import { useAuth } from '@/hooks/use-auth';
import { useConversations } from '@/hooks/use-conversations';
import { ConversationCard, EmptyChatList } from '@/components/chat';
import type { Conversation } from '@/types/chat.types';

export default function ChatScreen() {
    const router = useRouter();
    const { person, isTrainer, isClient } = useAuth();
    const { conversations, isLoading, refresh } = useConversations();

    // Determinar el rol del usuario para mostrar mensaje apropiado
    const userRole = isTrainer ? 'TRAINER' : 'CLIENT';

    // Handler para abrir una conversación
    const handleOpenConversation = (conversation: Conversation) => {
        router.push(`/(chat)/${conversation._id}` as any);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar backgroundColor={AppColors.primary.yellow} barStyle="light-content" />
                {/* Header */}
                <View className="px-5 pt-6 pb-8 rounded-b-3xl" style={{ backgroundColor: AppColors.primary.yellow }}>
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-1">
                            <Text className="text-white text-2xl font-bold">
                                {isTrainer 
                                    ? `¡Hola, ${person?.name || "Entrenador"}! 💪`
                                    : `¡Hola, ${person?.name || "Cliente"}! 👋`
                                }
                            </Text>
                            <Text className="text-white opacity-80 text-sm mt-1">
                                {isTrainer 
                                    ? "Panel de entrenador"
                                    : "Bienvenido a tu espacio de entrenamiento"
                                }
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <View className="bg-white/20 px-3 py-1 rounded-full">
                                <Text className="text-white text-xs font-semibold">
                                    {isTrainer ? "ENTRENADOR" : "CLIENTE"}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/(home)/settings')}
                                className="bg-white/20 p-2 rounded-full"
                            >
                                <Ionicons name="settings-outline" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Lista de conversaciones */}
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color={AppColors.primary.yellow} />
                        <Text className="text-gray-500 mt-4">Cargando conversaciones...</Text>
                    </View>
                ) : conversations.length === 0 ? (
                    <EmptyChatList userRole={userRole} />
                ) : (
                    <FlatList
                        data={conversations}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <ConversationCard 
                                conversation={item} 
                                onPress={handleOpenConversation}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={isLoading}
                                onRefresh={refresh}
                                tintColor={AppColors.primary.yellow}
                                colors={[AppColors.primary.yellow]}
                            />
                        }
                        contentContainerStyle={
                            conversations.length === 0 ? { flex: 1 } : undefined
                        }
                    />
                )}
            </SafeAreaView>
        </>
    );
}
