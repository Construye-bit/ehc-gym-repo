import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import { useAuth } from '@/hooks/use-auth';

interface AppHeaderProps {
    /**
     * Si no se especifica, se detecta automáticamente según el rol del usuario
     */
    userType?: 'CLIENT' | 'TRAINER' | 'ADMIN';
    /**
     * Título personalizado. Si no se proporciona, usa el nombre de la persona
     */
    customTitle?: string;
    /**
     * Subtítulo personalizado
     */
    customSubtitle?: string;
    /**
     * Mostrar el botón de configuración
     */
    showSettings?: boolean;
    /**
     * Mostrar el badge de rol
     */
    showRoleBadge?: boolean;
}

export function AppHeader({
    userType,
    customTitle,
    customSubtitle,
    showSettings = true,
    showRoleBadge = true,
}: AppHeaderProps) {
    const router = useRouter();
    const { person, isTrainer, isClient } = useAuth();

    // Determinar tipo de usuario
    const detectedType = userType || (isTrainer ? 'TRAINER' : isClient ? 'CLIENT' : 'ADMIN');

    // Configuración según el tipo de usuario
    const config = {
        CLIENT: {
            greeting: '👋',
            defaultTitle: `¡Hola, ${person?.name || 'Cliente'}!`,
            defaultSubtitle: 'Bienvenido a tu espacio de entrenamiento',
            badgeLabel: 'CLIENTE',
        },
        TRAINER: {
            greeting: '💪',
            defaultTitle: `¡Hola, ${person?.name || 'Entrenador'}!`,
            defaultSubtitle: 'Panel de entrenador',
            badgeLabel: 'ENTRENADOR',
        },
        ADMIN: {
            greeting: '👤',
            defaultTitle: `¡Hola, ${person?.name || 'Admin'}!`,
            defaultSubtitle: 'Panel de administrador',
            badgeLabel: 'ADMIN',
        },
    };

    const currentConfig = config[detectedType];
    const title = customTitle || currentConfig.defaultTitle;
    const subtitle = customSubtitle || currentConfig.defaultSubtitle;

    return (
        <View
            className="px-5 pt-6 pb-8 rounded-b-3xl"
            style={{ backgroundColor: AppColors.primary.yellow }}
        >
            <View className="flex-row justify-between items-center mb-4">
                <View className="flex-1">
                    <Text className="text-white text-2xl font-bold">
                        {title} {currentConfig.greeting}
                    </Text>
                    <Text className="text-white opacity-80 text-sm mt-1">
                        {subtitle}
                    </Text>
                </View>
                <View className="flex-row items-center gap-2">
                    {showRoleBadge && (
                        <View className="bg-white/20 px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-semibold">
                                {currentConfig.badgeLabel}
                            </Text>
                        </View>
                    )}
                    {showSettings && (
                        <TouchableOpacity
                            onPress={() => router.push('/(home)/settings')}
                            className="bg-white/20 p-2 rounded-full"
                        >
                            <Ionicons name="settings-outline" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}
