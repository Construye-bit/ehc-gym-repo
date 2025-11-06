import { View, Text, TouchableOpacity, Image } from 'react-native';
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
            defaultTitle: `Hola, ${person?.name || 'Cliente'}`,
            defaultSubtitle: 'Train like a warrior',
            badgeLabel: 'CLIENTE',
        },
        TRAINER: {
            defaultTitle: `Hola, ${person?.name || 'Entrenador'}`,
            defaultSubtitle: 'Panel de entrenador',
            badgeLabel: 'ENTRENADOR',
        },
        ADMIN: {
            defaultTitle: `Hola, ${person?.name || 'Admin'}`,
            defaultSubtitle: 'Panel de administrador',
            badgeLabel: 'ADMIN',
        },
    };

    const currentConfig = config[detectedType];
    const title = customTitle || currentConfig.defaultTitle;
    const subtitle = customSubtitle || currentConfig.defaultSubtitle;

    return (
        <View
            className="px-5 pt-4 pb-6"
            style={{ backgroundColor: AppColors.primary.yellow }}
        >
            <View className="flex-row justify-between items-center">
                {/* Logo y Título */}
                <View className="flex-row items-center flex-1 gap-3">
                    <View className="bg-white rounded-full p-1.5">
                        <Image
                            source={require('@/assets/images/logo-rb.png')}
                            className="w-8 h-8"
                            resizeMode="contain"
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-xl font-bold">
                            {title}
                        </Text>
                        {subtitle ? (
                            <Text className="text-white/80 text-sm mt-0.5">
                                {subtitle}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {/* Botón de perfil */}
                {showSettings && (
                    <TouchableOpacity
                        onPress={() => router.push('/(profile)/edit-profile')}
                        className="bg-white/20 p-2.5 rounded-full ml-2"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="person-outline" size={22} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
