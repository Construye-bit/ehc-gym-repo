import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Alert } from 'react-native';
import api from '@/api';
import type { Id } from '@/api';

interface InvitationFormData {
    invitee_name: string;
    invitee_email: string;
    invitee_phone: string;
    invitee_document_number: string;
    preferred_branch_id: string;
}

interface FieldErrors {
    [key: string]: string;
}

export function useSendInvitation() {
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    // Obtener el perfil del cliente actual
    const clientProfile = useQuery(api.profiles.client.queries.getMyClientProfile);
    const clientId = clientProfile?.client?._id;

    // Mutation para enviar invitación
    const inviteFriendMutation = useMutation(api.invitations.mutations.inviteFriend);

    const validateForm = (data: InvitationFormData): boolean => {
        const errors: FieldErrors = {};

        // Validar nombre
        if (!data.invitee_name.trim()) {
            errors.invitee_name = 'El nombre es obligatorio';
        } else if (data.invitee_name.trim().length < 3) {
            errors.invitee_name = 'El nombre debe tener al menos 3 caracteres';
        } else if (data.invitee_name.trim().length > 100) {
            errors.invitee_name = 'El nombre no puede exceder 100 caracteres';
        }

        // Validar que al menos email o teléfono esté presente
        const hasEmail = data.invitee_email.trim().length > 0;
        const hasPhone = data.invitee_phone.trim().length > 0;

        if (!hasEmail || !hasPhone) {
            errors.invitee_email = 'El número de celular y correo son obligatorios';
            errors.invitee_phone = 'El número de celular y correo son obligatorios';
        }

        // Validar email si está presente
        if (hasEmail) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.invitee_email)) {
                errors.invitee_email = 'Email inválido';
            } else if (data.invitee_email.length > 100) {
                errors.invitee_email = 'El email no puede exceder 100 caracteres';
            }
        }

        // Validar teléfono si está presente
        if (hasPhone) {
            if (data.invitee_phone.length !== 10) {
                errors.invitee_phone = 'El teléfono debe tener 10 dígitos';
            }
        }

        // Validar número de documento
        if (!data.invitee_document_number.trim()) {
            errors.invitee_document_number = 'El número de documento es obligatorio';
        } else if (!/^[0-9]+$/.test(data.invitee_document_number.trim())) {
            errors.invitee_document_number = 'El número de documento solo puede contener números';
        } else if (data.invitee_document_number.trim().length > 20) {
            errors.invitee_document_number = 'El número de documento no puede exceder 20 caracteres';
        } else if (data.invitee_document_number.trim().length < 6) {
            errors.invitee_document_number = 'El número de documento debe tener al menos 6 caracteres';
        }

        // Validar sede
        if (!data.preferred_branch_id) {
            errors.preferred_branch_id = 'Debes seleccionar una sede';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const sendInvitation = async (data: InvitationFormData) => {
        if (!clientId) {
            Alert.alert('Error', 'No se pudo obtener la información del cliente');
            return false;
        }

        if (!validateForm(data)) {
            return false;
        }

        setLoading(true);
        setFieldErrors({});

        try {
            const result = await inviteFriendMutation({
                payload: {
                    inviter_client_id: clientId,
                    invitee_name: data.invitee_name.trim(),
                    invitee_email: data.invitee_email.trim() ? data.invitee_email.trim().toLowerCase() : undefined,
                    invitee_phone: data.invitee_phone.trim() ? `+57${data.invitee_phone}` : undefined,
                    invitee_document_number: data.invitee_document_number.trim(),
                    preferred_branch_id: data.preferred_branch_id,
                }
            });

            Alert.alert(
                '¡Invitación enviada!',
                `La invitación para ${data.invitee_name} ha sido enviada exitosamente. Expira en 10 días.`,
                [{ text: 'OK' }]
            );

            return true;
        } catch (error: any) {
            console.error('Error enviando invitación:', error);

            // Manejar errores específicos
            if (error.message?.includes('INVITATION_LIMIT_REACHED')) {
                Alert.alert(
                    'Límite alcanzado',
                    'Has alcanzado el límite de invitaciones para este mes (máximo 5).',
                    [{ text: 'OK' }]
                );
            } else if (error.message?.includes('PAYMENT_NOT_ACTIVE')) {
                Alert.alert(
                    'Pago requerido',
                    'Debes tener un pago activo para enviar invitaciones.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Error',
                    error.message || 'No se pudo enviar la invitación. Por favor, intenta de nuevo.',
                    [{ text: 'OK' }]
                );
            }

            return false;
        } finally {
            setLoading(false);
        }
    };

    const clearErrors = () => {
        setFieldErrors({});
    };

    return {
        sendInvitation,
        loading,
        fieldErrors,
        clearErrors,
        clientId,
    };
}
