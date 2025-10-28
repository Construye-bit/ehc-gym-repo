import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import { useAuth } from '@/hooks/use-auth';

export default function ChatScreen() {
    const router = useRouter();
    const { person, isTrainer } = useAuth();

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

                <View className="flex-1 justify-center items-center p-6">
                    <Text className="text-6xl mb-4">💬</Text>
                    <Text className="text-2xl font-bold text-foreground mb-2 text-center">
                        Chat
                    </Text>
                    <Text className="text-muted-foreground text-center mb-8 max-w-sm">
                        La funcionalidad de chat estará disponible próximamente.
                    </Text>
                </View>
            </SafeAreaView>
        </>
    );
}
