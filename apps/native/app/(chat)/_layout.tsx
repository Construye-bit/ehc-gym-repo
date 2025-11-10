import { Stack, useRouter, useSegments } from "expo-router";
import { useMemo, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { BottomNavigation } from "@/components/botton-navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-unread-count";
import api from "@/api";

export default function ChatRoutesLayout() {
    const router = useRouter();
    const segments = useSegments();
    const { isClient, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { unreadCount } = useUnreadCount();

    // Obtener el perfil del cliente actual para verificar el estado de pago
    const myClientProfile = useQuery(
        api.clients.queries.getMyClientProfile,
        isAuthenticated && isClient ? {} : "skip"
    );

    // Redireccionar según el estado de pago solo para la ruta de IA
    useEffect(() => {
        // No hacer nada si estamos cargando
        if (isAuthLoading) return;

        // Si no está autenticado o no es cliente, dejar que AuthGuard maneje esto
        if (!isAuthenticated || !isClient) return;

        // Esperar a que la query cargue
        if (myClientProfile === undefined) return;

        // Si no hay cliente (null), no podemos continuar
        if (myClientProfile === null) {
            console.warn("No se encontró perfil de cliente para el usuario actual");
            return;
        }

        const currentSegment = segments[segments.length - 1];

        // Solo validar el pago si el usuario está intentando acceder a la ruta de IA
        if (currentSegment === "ai") {
            // Si no tiene pago activo y está en la ruta de IA, redirigir a not-payment
            if (!myClientProfile.is_payment_active) {
                router.replace("/(chat)/not-payment");
            }
        }

        // Si tiene pago activo y está en la pantalla de not-payment, redirigir al chat principal
        if (myClientProfile.is_payment_active && currentSegment === "not-payment") {
            router.replace("/(chat)");
        }
    }, [myClientProfile, isAuthenticated, isAuthLoading, isClient, segments]);

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
    ], [isClient, unreadCount]);

    // Mostrar loading solo mientras se cargan los datos iniciales del cliente
    if (isAuthLoading || (isAuthenticated && isClient && myClientProfile === undefined)) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
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
