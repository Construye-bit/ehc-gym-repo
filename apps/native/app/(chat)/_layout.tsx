import { useRouter, Stack, usePathname } from "expo-router";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { useEffect, useRef, useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import { BottomNavigation } from "@/components/botton-navigation";

export default function ChatRoutesLayout() {
    const { isSignedIn } = useClerkAuth();
    const { isClient, isLoading } = useAuth();
    const { unreadCount } = useUnreadCount();
    const router = useRouter();
    const pathname = usePathname();
    const hasRedirected = useRef(false);
    const lastPathname = useRef(pathname);

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
    ], [isClient, unreadCount]); // ✨ Actualizar cuando cambie unreadCount

    useEffect(() => {
        // Si la ruta cambió, resetear el flag
        if (lastPathname.current !== pathname) {
            hasRedirected.current = false;
            lastPathname.current = pathname;
        }

        // Si no está cargado, no hacer nada aún
        if (isLoading) return;

        // Si no está autenticado, redirigir al login
        if (!isSignedIn) {
            if (!hasRedirected.current) {
                hasRedirected.current = true;
                router.replace("/(auth)/sign-in");
            }
            return;
        }
    }, [isSignedIn, isLoading, router, pathname]);

    // Mostrar loading mientras se cargan los roles
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#EBB303" />
            </View>
        );
    }

    // Guard: No renderizar UI autenticada si no está autenticado
    // Esto evita mostrar Stack/BottomNavigation mientras se redirige al login
    if (!isSignedIn) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#EBB303" />
            </View>
        );
    }

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
