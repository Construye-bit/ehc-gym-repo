import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Input, Button, PhoneInput, Select } from '@/components/ui';
import { useSendInvitation } from '@/hooks/use-send-invitation';
import { useActiveBranches } from '@/hooks/use-branches';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import { useState } from 'react';

export default function SendInvitationScreen() {
    const router = useRouter();
    const { sendInvitation, loading, fieldErrors, clearErrors } = useSendInvitation();
    const { branchOptions, isLoading: loadingBranches } = useActiveBranches();

    // Estados del formulario
    const [inviteeName, setInviteeName] = useState('');
    const [inviteeEmail, setInviteeEmail] = useState('');
    const [inviteePhone, setInviteePhone] = useState('');
    const [inviteeDocumentNumber, setInviteeDocumentNumber] = useState('');
    const [preferredBranchId, setPreferredBranchId] = useState('');

    const handleSubmit = async () => {
        const success = await sendInvitation({
            invitee_name: inviteeName,
            invitee_email: inviteeEmail,
            invitee_phone: inviteePhone,
            invitee_document_number: inviteeDocumentNumber,
            preferred_branch_id: preferredBranchId,
        });

        if (success) {
            // Limpiar el formulario y volver a la pantalla anterior
            setInviteeName('');
            setInviteeEmail('');
            setInviteePhone('');
            setInviteeDocumentNumber('');
            setPreferredBranchId('');
            router.back();
        }
    };

    const isFormValid = inviteeName.trim() && (inviteeEmail.trim() || inviteePhone.trim()) && inviteeDocumentNumber.trim() && preferredBranchId;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 px-4 py-6">
                    {/* Header informativo */}
                    <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <View className="flex-row items-start">
                            <Ionicons name="information-circle" size={24} color="#D97706" />
                            <View className="flex-1 ml-3">
                                <Text className="text-yellow-900 font-semibold mb-1">
                                    Invita a tus amigos
                                </Text>
                                <Text className="text-yellow-800 text-sm">
                                    Cada invitación es válida por 10 días.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Formulario */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-4">
                            Datos del invitado
                        </Text>

                        <Input
                            label="Nombre completo *"
                            value={inviteeName}
                            onChangeText={(text) => {
                                setInviteeName(text);
                                if (fieldErrors.invitee_name) clearErrors();
                            }}
                            placeholder="Ej: Juan Pérez"
                            error={fieldErrors.invitee_name}
                            autoCapitalize="words"
                            editable={!loading}
                        />

                        <Input
                            label="Correo electrónico *"
                            value={inviteeEmail}
                            onChangeText={(text) => {
                                setInviteeEmail(text);
                                if (fieldErrors.invitee_email) clearErrors();
                            }}
                            placeholder="ejemplo@correo.com"
                            error={fieldErrors.invitee_email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />

                        <PhoneInput
                            label="Número de Celular *"
                            value={inviteePhone}
                            onChangeText={(text) => {
                                setInviteePhone(text);
                                if (fieldErrors.invitee_phone) clearErrors();
                            }}
                            placeholder="3001234567"
                            error={fieldErrors.invitee_phone}
                            countryCode="+57"
                            editable={!loading}
                        />

                        <Input
                            label="Número de documento *"
                            value={inviteeDocumentNumber}
                            onChangeText={(text) => {
                                setInviteeDocumentNumber(text);
                                if (fieldErrors.invitee_document_number) clearErrors();
                            }}
                            placeholder="1234567890"
                            error={fieldErrors.invitee_document_number}
                            keyboardType="numeric"
                            editable={!loading}
                        />

                        <Select
                            label="Sede preferida *"
                            value={preferredBranchId}
                            onValueChange={(value) => {
                                setPreferredBranchId(value);
                                if (fieldErrors.preferred_branch_id) clearErrors();
                            }}
                            options={branchOptions}
                            placeholder={loadingBranches ? 'Cargando sedes...' : 'Selecciona una sede'}
                            error={fieldErrors.preferred_branch_id}
                        />
                    </View>

                    {/* Información adicional */}
                    <View className="bg-gray-50 rounded-xl p-4 mb-6">
                        <View className="flex-row items-start mb-3">
                            <Ionicons name="mail-outline" size={20} color="#6B7280" />
                            <View className="flex-1 ml-3">
                                <Text className="text-gray-700 text-sm">
                                    Se enviará un correo electrónico con el enlace de invitación
                                </Text>
                            </View>
                        </View>
                        <View className="flex-row items-start mb-3">
                            <Ionicons name="time-outline" size={20} color="#6B7280" />
                            <View className="flex-1 ml-3">
                                <Text className="text-gray-700 text-sm">
                                   Recuerdale a tú amigo llevar su documento de identidad 
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Botón de enviar fijo en la parte inferior */}
            <View className="px-4 py-4 bg-white border-t border-gray-100">
                <Button
                    onPress={handleSubmit}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={loading}
                    disabled={!isFormValid || loading || loadingBranches}
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="send" size={20} color="white" />
                        <Text className="text-white font-bold text-base ml-2">
                            {loading ? 'Enviando...' : 'Enviar invitación'}
                        </Text>
                    </View>
                </Button>
            </View>
        </KeyboardAvoidingView>
    );
}
