import { useRouter, Stack } from "expo-router";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

export default function HomeRoutesLayout() {
    const { isSignedIn } = useClerkAuth();
    const { isAdmin, isSuperAdmin, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Si no está cargado, no hacer nada aún
        if (isLoading) return;

        // Si no está autenticado, redirigir al login
        if (!isSignedIn) {
            router.replace("/(auth)/sign-in");
            return;
        }

        // Si es admin o super admin, redirigir a la pantalla especial
        if (isAdmin || isSuperAdmin) {
            router.replace("/(home)/admin-redirect");
        }
    }, [isSignedIn, isAdmin, isSuperAdmin, isLoading, router]);

    // Mostrar loading mientras se cargan los roles
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#FF9500" />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}
