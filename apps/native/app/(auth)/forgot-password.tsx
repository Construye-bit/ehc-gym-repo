import { Ionicons } from '@expo/vector-icons';
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, Input, Text } from '@/components/ui';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { signIn, isLoaded } = useSignIn();

    const [emailAddress, setEmailAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [fieldError, setFieldError] = useState<string | undefined>();

    const validateForm = () => {
        if (!emailAddress || emailAddress.trim().length === 0) {
            setFieldError('El correo electrónico es obligatorio');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailAddress.trim())) {
            setFieldError('Por favor ingresa un correo electrónico válido');
            return false;
        }

        setFieldError(undefined);
        return true;
    };

    const onForgotPasswordPress = async () => {
        // Validate form
        if (!validateForm()) {
            return;
        }

        if (!isLoaded) return;

        setLoading(true);

        try {
            // Create a password reset request
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: emailAddress.trim(),
            });

            setEmailSent(true);
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));

            if (err.errors && err.errors[0]) {
                const errorMessage = err.errors[0].message;
                setFieldError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const clearFieldError = () => {
        setFieldError(undefined);
    };

    const handleGoBack = () => {
        router.back();
    };

    // Handle automatic navigation after email is sent
    useEffect(() => {
        if (emailSent) {
            const timer = setTimeout(() => {
                router.push({
                    pathname: './reset-password',
                    params: { email: emailAddress.trim() }
                });
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [emailSent, emailAddress, router]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View className="px-5 pt-6 pb-4">
                    <TouchableOpacity
                        className="mb-6 w-10 h-10 justify-center items-center bg-gray-100 rounded-full"
                        onPress={handleGoBack}
                    >
                        <Ionicons name="arrow-back" size={20} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View className="flex-1 justify-center px-5 pb-8">
                    <View className="mb-8">
                        <Text
                            variant="h1"
                            className="text-4xl font-bold text-gray-900 mb-4"
                        >
                            {emailSent ? '¡Código Enviado!' : '¿Olvidaste tu contraseña?'}
                        </Text>
                        <Text
                            variant="p"
                            color="tertiary"
                            className="text-lg text-gray-600 leading-6"
                        >
                            {emailSent
                                ? 'Hemos enviado un código de recuperación a tu correo electrónico.'
                                : 'No te preocupes, ingresa tu correo electrónico y te enviaremos un código para recuperar tu contraseña.'
                            }
                        </Text>
                    </View>

                    {!emailSent && (
                        <View>
                            {/* Email Input */}
                            <Input
                                label="Correo Electrónico"
                                value={emailAddress}
                                onChangeText={(text) => {
                                    setEmailAddress(text);
                                    if (fieldError) {
                                        clearFieldError();
                                    }
                                }}
                                placeholder="ejemplo@correo.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                error={fieldError}
                            />

                            {/* Submit Button */}
                            <Button
                                onPress={onForgotPasswordPress}
                                disabled={loading}
                                isLoading={loading}
                                className="mt-6"
                            >
                                {loading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}
                            </Button>
                        </View>
                    )}

                    {emailSent && (
                        <View>
                            {/* Success Message */}
                            <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="checkmark-circle" size={24} color="#059669" />
                                    <Text className="ml-2 text-green-800 font-semibold text-base">
                                        Código enviado
                                    </Text>
                                </View>
                                <Text className="text-green-700">
                                    Revisa tu bandeja de entrada y busca el código de 6 dígitos.
                                </Text>
                            </View>

                            {/* Navigation Button */}
                            <Button
                                onPress={() => router.push({
                                    pathname: './reset-password',
                                    params: { email: emailAddress.trim() }
                                })}
                                className="mt-4"
                            >
                                CONTINUAR
                            </Button>
                        </View>
                    )}

                    {/* Footer Links */}
                    <View className="flex-row justify-center items-center mt-8 pt-6 border-t border-gray-100">
                        <Text variant="p" color="tertiary" className="text-base text-gray-600">
                            ¿Recordaste tu contraseña?{' '}
                        </Text>
                        <Link href="./sign-in" asChild>
                            <TouchableOpacity>
                                <Text variant="p" className="text-base text-yellow-500 font-semibold">
                                    Iniciar sesión
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
