import { Stack, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import api from "@/api";
import { useAuth } from "@/hooks/use-auth";

export default function InviteFriendRoutesLayout() {
    const router = useRouter();
    const segments = useSegments();
    const { isAuthenticated, isLoading: isAuthLoading, isClient } = useAuth();

    // Obtener el perfil del cliente actual (mucho más simple y directo)
    const myClientProfile = useQuery(
        api.clients.queries.getMyClientProfile,
        isAuthenticated && isClient ? {} : "skip"
    );

    // Redireccionar según el estado de pago
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

        // Si no tiene pago activo y no está ya en la pantalla de not-payment
        if (!myClientProfile.is_payment_active && currentSegment !== "not-payment") {
            router.replace("/(invite-friend)/not-payment");
        }

        // Si tiene pago activo y está en la pantalla de not-payment, redirigir al inicio
        if (myClientProfile.is_payment_active && currentSegment === "not-payment") {
            router.replace("/(invite-friend)/");
        }
    }, [myClientProfile, isAuthenticated, isAuthLoading, isClient, segments]);

    // Mostrar loading solo mientras se cargan los datos iniciales
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
                    headerShown: false,
                }}
            />
        </View>
    );
}
