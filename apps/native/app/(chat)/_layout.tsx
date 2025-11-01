import { Stack } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import { BottomNavigation } from "@/components/botton-navigation";
import { useAuth } from "@/hooks/use-auth";

export default function ChatRoutesLayout() {
    const { isClient } = useAuth();

    // Memorizar las tabs para evitar re-renderizados innecesarios
    const navigationTabs = useMemo(() => [
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
            badge: unreadCount, // ✨ Agregar contador de no leídos
        },
        {
            name: 'profile',
            label: 'Configuración',
            icon: 'settings-outline' as const,
            route: '/(home)/settings',
        },
    ], [isClient]);

    return (
        <View className="flex-1">
            <Stack
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
            <BottomNavigation tabs={navigationTabs} />
        </View>
    );
}
