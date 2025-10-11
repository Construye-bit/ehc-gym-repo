import { Ionicons } from '@expo/vector-icons';
import { useSignIn } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {
    Button,
    CodeInput,
    PasswordInput,
    Text,
} from '@/components/ui';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { signIn, setActive, isLoaded } = useSignIn();
    const { email } = useLocalSearchParams<{ email: string }>();

    const [step, setStep] = useState<'verify' | 'success'>('verify');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{
        code?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    const validateForm = () => {
        const errors: {
            code?: string;
            newPassword?: string;
            confirmPassword?: string;
        } = {};

        if (!code || code.length !== 6) {
            errors.code = 'El código debe tener 6 dígitos';
        }

        if (!newPassword || newPassword.length < 8) {
            errors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
        } else if (newPassword.length > 128) {
            errors.newPassword = 'La contraseña es demasiado larga (máximo 128 caracteres)';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Confirma tu nueva contraseña';
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleResetPassword = async () => {
        // Clear previous field errors
        setFieldErrors({});

        // Validate form
        if (!validateForm()) {
            return;
        }

        if (!isLoaded || !email) {
            return;
        }

        setLoading(true);

        try {
            // Attempt to reset the password
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code: code,
                password: newPassword,
            });

            if (result.status === 'complete') {
                // Set the active session
                await setActive({ session: result.createdSessionId });
                
                setStep('success');

                // Navigate to home after a delay (the _layout will handle the redirect)
                setTimeout(() => {
                    router.replace('/');
                }, 2000);
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));

            if (err.errors && err.errors[0]) {
                const errorMessage = err.errors[0].message;
                const errorCode = err.errors[0].code;

                if (errorCode === 'form_code_incorrect' || errorCode === 'verification_failed') {
                    setFieldErrors({ code: 'Código de verificación incorrecto' });
                } else if (errorMessage.toLowerCase().includes('password')) {
                    setFieldErrors({ newPassword: errorMessage });
                } else {
                    setFieldErrors({ code: errorMessage });
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!isLoaded || !email) {
            return;
        }

        setResendLoading(true);

        try {
            // Create a new password reset request
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: email,
            });

            setCode(''); // Clear the code input
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
        } finally {
            setResendLoading(false);
        }
    };

    const clearFieldError = (field: 'code' | 'newPassword' | 'confirmPassword') => {
        setFieldErrors(prev => ({
            ...prev,
            [field]: undefined,
        }));
    };

    const handleGoBack = () => {
        router.back();
    };

    const renderVerifyCodeStep = () => (
        <SafeAreaView className="flex-1 bg-yellow-700">
            <StatusBar backgroundColor="#a16207" barStyle="light-content" />
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                {/* Header */}
                <View className="bg-yellow-700 px-5 pt-6 pb-8">
                    <TouchableOpacity
                        className="mb-5 w-10 h-10 justify-center"
                        onPress={handleGoBack}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    <Text variant="h1" className="text-white text-3xl font-bold mb-2">
                        Verifica tu correo electrónico
                    </Text>

                    <Text className="text-white opacity-80 text-base">
                        Enviamos un código a{' '}
                        <Text className="text-white font-medium">
                            {email}
                        </Text>
                    </Text>
                    <Text className="text-white opacity-80 text-base mt-1">
                        Ingresa el código de 6 dígitos que recibiste.
                    </Text>
                </View>

                {/* Form */}
                <ScrollView
                    className="flex-1 bg-white rounded-t-3xl px-5 pt-8"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 60 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <CodeInput
                        length={6}
                        value={code}
                        onChangeText={(text) => {
                            setCode(text);
                            if (fieldErrors.code) {
                                clearFieldError('code');
                            }
                        }}
                        autoFocus={true}
                        error={fieldErrors.code}
                    />

                    <PasswordInput
                        label="Nueva contraseña"
                        value={newPassword}
                        onChangeText={(text) => {
                            setNewPassword(text);
                            if (fieldErrors.newPassword) {
                                clearFieldError('newPassword');
                            }
                        }}
                        placeholder="••••••••"
                        error={fieldErrors.newPassword}
                    />

                    <PasswordInput
                        label="Confirmar nueva contraseña"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (fieldErrors.confirmPassword) {
                                clearFieldError('confirmPassword');
                            }
                        }}
                        placeholder="••••••••"
                        error={fieldErrors.confirmPassword}
                    />

                    <Button
                        onPress={handleResetPassword}
                        disabled={loading}
                        isLoading={loading}
                        className="mt-6 mb-6"
                    >
                        {loading ? 'CAMBIANDO...' : 'CAMBIAR CONTRASEÑA'}
                    </Button>

                    <TouchableOpacity
                        onPress={handleResendCode}
                        disabled={resendLoading || loading}
                        className="flex-row items-center justify-center py-3"
                    >
                        <Text variant="p" color="tertiary">
                            ¿No recibiste el correo?{' '}
                        </Text>
                        <Text
                            variant="p"
                            className={`font-medium ${resendLoading || loading
                                ? 'text-gray-400'
                                : 'text-yellow-500'
                                }`}
                        >
                            {resendLoading ? 'Enviando...' : 'Reenviar'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );

    const renderSuccessStep = () => (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}
            >
                <View className="py-10">
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
                            <Ionicons name="checkmark" size={40} color="#10B981" />
                        </View>

                        <Text variant="h1" className="text-3xl font-bold text-gray-900 mb-4 text-center">
                            Contraseña cambiada
                        </Text>

                        <Text variant="p" color="tertiary" className="text-base text-gray-600 leading-6 text-center">
                            Tu contraseña fue cambiada exitosamente.{'\n'}
                            Ya puedes acceder a tu cuenta.
                        </Text>
                    </View>

                    <Button
                        onPress={() => router.replace('/')}
                        className="mt-4"
                    >
                        CONTINUAR
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );

    return (
        <>
            {step === 'verify' && renderVerifyCodeStep()}
            {step === 'success' && renderSuccessStep()}
        </>
    );
}
