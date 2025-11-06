import { Stack } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import { BottomNavigation } from "@/components/botton-navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";

export default function HomeRoutesLayout() {
    // Verificar autenticación de Clerk primero
    const { isSignedIn } = useClerkAuth();

    // Solo llamar estos hooks si el usuario está autenticado
    const { isClient } = useAuth();
    const { unreadCount } = useUnreadCount();

    // Memorizar las tabs para evitar re-renderizados innecesarios
    const navigationTabs = useMemo(() => {
        // Si no está autenticado, retornar tabs por defecto
        if (!isSignedIn) {
            return [
                {
                    name: 'home',
                    label: 'Inicio',
                    icon: 'home-outline' as const,
                    route: '/(home)',
                },
            ];
        }

        return [
            {
                name: 'home',
                label: 'Inicio',
                icon: 'home-outline' as const,
                route: '/(home)',
            },
            {
                name: 'consejos',
                label: 'Consejos',
                icon: 'bulb-outline' as const,
                route: isClient ? '/(blog)/client-feed' : '/(blog)/trainer-feed',
            },
            {
                name: 'chat',
                label: 'Chat',
                icon: 'chatbubble-outline' as const,
                route: '/(chat)',
                badge: unreadCount,
            },
            {
                name: 'profile',
                label: 'Configuración',
                icon: 'settings-outline' as const,
                route: '/(home)/settings',
            },
        ];
    }, [isSignedIn, isClient, unreadCount]);

    return (
        <View className="flex-1">
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            />
            <BottomNavigation tabs={navigationTabs} />
        </View>
    );
}
