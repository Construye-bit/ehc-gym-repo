import { useUser, useClerk } from '@clerk/clerk-expo';
import { useLocalCredentials } from '@clerk/clerk-expo/local-credentials';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Button } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsPage() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    const { userOwnsCredentials, clearCredentials, biometricType } = useLocalCredentials();

    const handleRemoveCredentials = () => {
        Alert.alert(
            'Eliminar credenciales biométricas',
            '¿Estás seguro de que deseas eliminar tus credenciales guardadas? Necesitarás ingresar tu correo y contraseña la próxima vez.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearCredentials();
                            Alert.alert('Éxito', 'Credenciales biométricas eliminadas correctamente');
                        } catch (error) {
                            console.error('Error clearing credentials:', error);
                            Alert.alert('Error', 'No se pudieron eliminar las credenciales');
                        }
                    },
                },
            ]
        );
    };

    const handleSignOut = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            // Navigation is handled automatically by Clerk after successful sign out
                        } catch (error: any) {
                            console.error('Sign out failed:', error?.message || error);

                            Alert.alert(
                                'Error al Cerrar Sesión',
                                'No se pudo cerrar la sesión. Por favor, intenta nuevamente.',
                                [
                                    {
                                        text: 'OK',
                                        style: 'default',
                                    },
                                ]
                            );
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-8">
                {/* Header with Back Button */}
                <View className="flex-row items-center mb-6 py-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text variant="h2" className="text-2xl font-bold text-gray-900 flex-1">
                        Configuración
                    </Text>
                </View>

                {/* User Info Section */}
                <View className="mb-8">
                    <Text variant="p" color="tertiary" className="text-base">
                        {user?.emailAddresses[0]?.emailAddress}
                    </Text>
                </View>

                {/* Account Section */}
                <View className="mb-8">
                    <Text variant="h3" className="text-lg font-semibold text-gray-900 mb-4">
                        Cuenta
                    </Text>

                    <TouchableOpacity
                        className="bg-gray-50 rounded-lg p-4 mb-3 flex-row items-center justify-between"
                        onPress={() => {
                            router.push('/(profile)/edit-profile');
                        }}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="person-outline" size={20} color="#1f2937" />
                            <Text className="text-gray-900 ml-3 font-medium">
                                Editar Perfil
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-gray-50 rounded-lg p-4 mb-3 flex-row items-center justify-between"
                        onPress={() => {
                            router.push('/(home)/update-password');
                        }}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="key-outline" size={20} color="#1f2937" />
                            <Text className="text-gray-900 ml-3 font-medium">
                                Cambiar Contraseña
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    {/* Biometric Authentication Option */}
                    {userOwnsCredentials && biometricType && (
                        <TouchableOpacity
                            className="bg-gray-50 rounded-lg p-4 mb-3 flex-row items-center justify-between"
                            onPress={handleRemoveCredentials}
                        >
                            <View className="flex-row items-center flex-1">
                                <Ionicons
                                    name={biometricType === 'face-recognition' ? 'scan' : 'finger-print'}
                                    size={20}
                                    color="#1f2937"
                                />
                                <View className="ml-3 flex-1">
                                    <Text className="text-gray-900 font-medium">
                                        Autenticación Biométrica
                                    </Text>
                                    <Text className="text-green-600 text-xs mt-0.5">
                                        {biometricType === 'face-recognition' ? 'Face ID activado' : 'Huella dactilar activada'}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    )}

                    {!userOwnsCredentials && biometricType && (
                        <View className="bg-gray-50 rounded-lg p-4 mb-3">
                            <View className="flex-row items-start">
                                <Ionicons
                                    name={biometricType === 'face-recognition' ? 'scan' : 'finger-print'}
                                    size={20}
                                    color="#9ca3af"
                                />
                                <View className="ml-3 flex-1">
                                    <Text className="text-gray-900 font-medium mb-1">
                                        Autenticación Biométrica
                                    </Text>
                                    <Text className="text-gray-500 text-xs">
                                        No configurada. Inicia sesión con tu correo y contraseña para habilitarla.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Sign Out Section */}
                <Button
                    onPress={handleSignOut}
                    className="bg-gray-800"
                >
                    <View className="flex-row items-center justify-center gap-2">
                        <Ionicons name="log-out-outline" size={18} color="white" />
                        <Text className="text-white font-semibold">
                            CERRAR SESIÓN
                        </Text>
                    </View>
                </Button>
            </View>
        </ScrollView>
    );
}
