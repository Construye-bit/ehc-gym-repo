import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';

export function AIWelcomeScreen() {
    return (
        <View className="flex-1 items-center justify-center p-8">
            <View className="bg-yellow-100 rounded-full p-6 mb-4">
                <Ionicons
                    name="sparkles"
                    size={48}
                    color={AppColors.primary.yellow}
                />
            </View>
            <Text className="text-gray-900 text-xl font-bold text-center mb-2">
                ¡Hola! Soy tu asistente virtual
            </Text>
            <Text className="text-gray-600 text-center mb-6">
                Puedo ayudarte con información sobre:
            </Text>
            <View className="w-full space-y-3">
                {[
                    { icon: 'person-outline', text: 'Tu perfil y preferencias' },
                    { icon: 'fitness-outline', text: 'Métricas de salud y progreso' },
                    {
                        icon: 'document-text-outline',
                        text: 'Contratos con entrenadores',
                    },
                    { icon: 'bulb-outline', text: 'Consejos de fitness' },
                ].map((item, index) => (
                    <View
                        key={index}
                        className="flex-row items-center bg-white p-3 rounded-lg shadow-sm"
                    >
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: AppColors.primary.yellow }}
                        >
                            <Ionicons name={item.icon as any} size={20} color="white" />
                        </View>
                        <Text className="ml-3 text-gray-700 flex-1">{item.text}</Text>
                    </View>
                ))}
            </View>
            <Text className="text-gray-500 text-sm text-center mt-6">
                Escribe tu pregunta abajo para empezar 👇
            </Text>
        </View>
    );
}
