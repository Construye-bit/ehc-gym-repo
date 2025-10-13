import React from 'react';
import {
    View,
    Image,
    StatusBar,
    ScrollView,
    Linking,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function AdminRedirectScreen() {
    const { isSuperAdmin, isAdmin } = useAuth();
    const { signOut } = useClerk();
    const router = useRouter();

    const handleGoToWebsite = async () => {
        const webUrl = 'https://ehc-gym-repo-web.vercel.app/';
        const canOpen = await Linking.canOpenURL(webUrl);

        if (canOpen) {
            await Linking.openURL(webUrl);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace('/(auth)/sign-in');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >

                {/* Content Container */}
                <View className="flex-1 px-6 justify-between">
                    <View>
                        {/* Icon or Illustration */}
                        <View className="items-center mb-6">
                            <View className="w-24 h-24 rounded-full bg-yellow-100 items-center justify-center mb-4">
                                <Text className="text-5xl">🖥️</Text>
                            </View>
                        </View>

                        {/* Title */}
                        <Text
                            variant="h1"
                            align="center"
                            className="text-4xl font-bold text-gray-900 mb-4"
                            style={{ lineHeight: 48 }}
                        >
                            {isSuperAdmin ? 'Panel de Super Admin' : 'Panel de Administrador'}
                        </Text>

                        {/* Description */}
                        <Text
                            variant="p"
                            align="center"
                            className="text-lg text-gray-600 mb-8 px-4"
                            style={{ lineHeight: 28 }}
                        >
                            La aplicación móvil está diseñada exclusivamente para clientes y entrenadores.
                        </Text>

                        {/* Info Box */}
                        <View className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 mb-6">
                            <Text
                                variant="p"
                                align="center"
                                className="text-base text-gray-700 mb-2"
                                style={{ lineHeight: 24 }}
                            >
                                Para acceder a las funcionalidades de{' '}
                                <Text className="font-bold text-yellow-600">
                                    {isSuperAdmin ? 'Super Administrador' : 'Administrador'}
                                </Text>
                                , por favor utiliza la plataforma web.
                            </Text>
                        </View>

                        {/* Features List */}
                        <View className="mb-8 px-2">
                            <Text className="text-lg font-semibold text-gray-900 mb-3">
                                En la plataforma web podrás:
                            </Text>

                            <View className="space-y-3">
                                <View className="flex-row items-start">
                                    <Text className="text-yellow-500 text-xl mr-3">✓</Text>
                                    <Text className="flex-1 text-base text-gray-700">
                                        Gestionar usuarios y permisos
                                    </Text>
                                </View>

                                <View className="flex-row items-start mt-2">
                                    <Text className="text-yellow-500 text-xl mr-3">✓</Text>
                                    <Text className="flex-1 text-base text-gray-700">
                                        Administrar sedes y recursos
                                    </Text>
                                </View>

                                {isSuperAdmin && (
                                    <View className="flex-row items-start mt-2">
                                        <Text className="text-yellow-500 text-xl mr-3">✓</Text>
                                        <Text className="flex-1 text-base text-gray-700">
                                            Configuración avanzada del sistema
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="mt-6">
                        <Button
                            onPress={handleGoToWebsite}
                            className="mb-4"
                        >
                            IR AL SITIO WEB
                        </Button>

                        <Button
                            onPress={handleSignOut}
                            variant="outline"
                            className="border-2 border-gray-300"
                        >
                            <Text className="text-gray-700 font-semibold">
                                CERRAR SESIÓN
                            </Text>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
