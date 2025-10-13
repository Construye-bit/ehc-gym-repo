import { useUser } from '@clerk/clerk-expo';
import { useLocalCredentials } from '@clerk/clerk-expo/local-credentials';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, Button, PasswordInput } from '@/components/ui';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function UpdatePasswordPage() {
    const { user } = useUser();
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { userOwnsCredentials, setCredentials } = useLocalCredentials();

    const changePassword = async () => {
        if (!user) {
            Alert.alert('Error', 'Sesión no válida. Por favor, inicia sesión nuevamente.');
            return;
        }

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            await user.updatePassword({
                currentPassword: currentPassword,
                newPassword: newPassword,
            });

            // Update biometric credentials if they exist
            if (userOwnsCredentials) {
                try {
                    await setCredentials({
                        password: newPassword,
                    });
                } catch (credErr) {
                    console.error('Failed to update biometric credentials:', credErr);
                    // Password was updated successfully, just biometric sync failed
                }
            }

            Alert.alert(
                'Éxito',
                'Tu contraseña ha sido actualizada correctamente',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );

            // Clear fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            console.error('Password update failed:', err.message || err.errors?.[0]?.message);

            let errorMessage = 'No se pudo actualizar la contraseña';

            if (err.errors && err.errors[0]) {
                const errorCode = err.errors[0].code;
                if (errorCode === 'form_password_incorrect') {
                    errorMessage = 'La contraseña actual es incorrecta';
                } else if (errorCode === 'form_param_value_invalid') {
                    errorMessage = 'La nueva contraseña no es válida';
                }
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-white"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="px-6 py-8">
                    {/* Header with Back Button */}
                    <View className="flex-row items-center justify-self-center mb-6 py-4">
                        <TouchableOpacity onPress={() => router.back()} className="mr-3">
                            <Ionicons name="arrow-back" size={24} color="#1f2937" />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text variant="h2" className="text-2xl font-bold text-gray-900 mb-2">
                                Cambiar Contraseña
                            </Text>
                        </View>
                    </View>

                    <Text variant="p" color="tertiary" className="text-base mb-6">
                        Actualiza tu contraseña para mantener tu cuenta segura
                    </Text>

                    {/* Current Password */}
                    <PasswordInput
                        label="Contraseña Actual"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="••••••••"
                    />

                    {/* New Password */}
                    <PasswordInput
                        label="Nueva Contraseña"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="••••••••"
                    />

                    {/* Confirm Password */}
                    <PasswordInput
                        label="Confirmar Nueva Contraseña"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="••••••••"
                    />

                    {/* Password Requirements */}
                    <View className="bg-gray-50 rounded-lg p-4 mb-6">
                        <Text className="text-gray-700 font-medium mb-2">
                            Requisitos de contraseña:
                        </Text>
                        <View className="flex-row items-start mb-1">
                            <Text className="text-gray-600">• </Text>
                            <Text className="text-gray-600 flex-1">
                                Mínimo 8 caracteres
                            </Text>
                        </View>
                        <View className="flex-row items-start mb-1">
                            <Text className="text-gray-600">• </Text>
                            <Text className="text-gray-600 flex-1">
                                Se recomienda incluir letras, números y símbolos
                            </Text>
                        </View>
                    </View>

                    {/* Update Button */}
                    <Button
                        onPress={changePassword}
                        disabled={loading}
                        isLoading={loading}
                    >
                        ACTUALIZAR CONTRASEÑA
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
