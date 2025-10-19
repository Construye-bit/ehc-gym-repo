import { useRouter, Stack, usePathname } from "expo-router";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { BottomNavigation } from "@/components/botton-navigation";

export default function BlogRoutesLayout() {
    const { isSignedIn } = useClerkAuth();
    const { isTrainer, isClient, isAdmin, isSuperAdmin, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Si no está cargado, no hacer nada aún
        if (isLoading) return;

        // Si no está autenticado, redirigir al login
        if (!isSignedIn) {
            router.replace("/(auth)/sign-in");
            return;
        }

        // Redirigir según el rol del usuario
        // Evitar redirecciones si ya está en la página correcta
        if (isClient && !pathname?.includes('client-feed')) {
            router.replace("./client-feed");
        } else if (isTrainer && !pathname?.includes('trainer-feed')) {
            router.replace("./trainer-feed");
        } else if ((isAdmin || isSuperAdmin) && !pathname?.includes('trainer-feed')) {
            // Los admins pueden ver el feed de entrenadores
            router.replace("./trainer-feed");
        }
    }, [isSignedIn, isTrainer, isClient, isAdmin, isSuperAdmin, isLoading, router, pathname]);

    // Mostrar loading mientras se cargan los roles
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#EBB303" />
            </View>
        );
    }

    const navigationTabs = [
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
            route: '#',
        },
        {
            name: 'chat',
            label: 'Chat',
            icon: 'chatbubble-outline' as const,
            route: '/chat',
        },
        {
            name: 'profile',
            label: 'Configuración',
            icon: 'settings-outline' as const,
            route: '/(home)/settings',
        },
    ];

    return (
        <View className="flex-1">
            <Stack
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen name="trainer-feed" options={{ headerShown: false }} />
                <Stack.Screen name="client-feed" options={{ headerShown: false }} />
            </Stack>
            <BottomNavigation tabs={navigationTabs} />
        </View>
    );
}
