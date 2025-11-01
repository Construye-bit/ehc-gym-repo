import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { Alert } from 'react-native';
import api from '@/api';

export function useInvitations() {
    const [cancelingId, setCancelingId] = useState<string | null>(null);

    // Obtener el perfil del cliente actual
    const clientProfile = useQuery(api.profiles.client.queries.getMyClientProfile);
    const clientId = clientProfile?.client?._id;

    // Query para obtener las invitaciones del cliente
    const invitations = useQuery(
        api.invitations.queries.listInvitationsByInviter,
        clientId ? { payload: { inviter_client_id: clientId } } : 'skip'
    );

    // Query para obtener el contador de invitaciones del mes
    const invitationCount = useQuery(
        api.invitations.queries.getMonthlyInvitationCount,
        clientId ? { payload: { inviter_client_id: clientId } } : 'skip'
    );

    // Mutation para cancelar una invitación
    const cancelInvitationMutation = useMutation(api.invitations.mutations.cancelInvitation);

    // Filtrar solo las invitaciones pendientes
    const pendingInvitations = invitations?.filter(
        (inv) => inv.status === 'PENDING' && inv.active === true
    ) || [];

    const cancelInvitation = async (invitationId: string) => {
        setCancelingId(invitationId);
        try {
            await cancelInvitationMutation({
                payload: {
                    invitation_id: invitationId
                }
            });

            Alert.alert(
                'Invitación cancelada',
                'La invitación ha sido cancelada exitosamente.',
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            console.error('Error cancelando invitación:', error);
            Alert.alert(
                'Error',
                error.message || 'No se pudo cancelar la invitación. Por favor, intenta de nuevo.',
                [{ text: 'OK' }]
            );
        } finally {
            setCancelingId(null);
        }
    };

    return {
        invitations: pendingInvitations,
        isLoading: invitations === undefined,
        cancelInvitation,
        cancelingId,
        invitationCount: invitationCount || { used: 0, max: 5, remaining: 5 },
    };
}
