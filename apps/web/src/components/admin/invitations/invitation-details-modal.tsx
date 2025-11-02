import { useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { useEffect } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, User, Mail, Phone, FileText, Calendar, Clock, MapPin, AlertCircle } from "lucide-react";

interface InvitationDetailsModalProps {
    invitationId: Id<"invitations">;
    onClose: () => void;
    onRedeem?: (id: Id<"invitations">) => void;
}

type InvitationStatus = "PENDING" | "REDEEMED" | "CANCELED" | "EXPIRED";

const STATUS_COLORS: Record<InvitationStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    REDEEMED: "bg-green-100 text-green-800 border-green-300",
    CANCELED: "bg-gray-100 text-gray-800 border-gray-300",
    EXPIRED: "bg-red-100 text-red-800 border-red-300",
};

const STATUS_LABELS: Record<InvitationStatus, string> = {
    PENDING: "Pendiente",
    REDEEMED: "Canjeada",
    CANCELED: "Cancelada",
    EXPIRED: "Expirada",
};

export function InvitationDetailsModal({
    invitationId,
    onClose,
    onRedeem,
}: InvitationDetailsModalProps) {
    const invitation = useQuery(api.invitations.queries.getInvitationById, {
        payload: { invitation_id: invitationId },
    });

    const inviterClient = useQuery(
        api.clients.queries.getClientById,
        invitation?.inviter_client_id
            ? { payload: { client_id: invitation.inviter_client_id } }
            : "skip"
    );

    const preferredBranch = useQuery(
        api.branches.queries.getByIdForAdmin,
        invitation?.preferred_branch_id
            ? { branchId: invitation.preferred_branch_id }
            : "skip"
    );

    if (!invitation) {
        return (
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cargando...</DialogTitle>
                    </DialogHeader>
                    <div className="py-8 text-center text-gray-500">
                        Cargando detalles de la invitación...
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const expired = invitation.expires_at < Date.now();
    const canRedeem = invitation.status === "PENDING" && !expired;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Detalles de la Invitación</span>
                        <Badge className={`${STATUS_COLORS[invitation.status as InvitationStatus]} border`}>
                            {STATUS_LABELS[invitation.status as InvitationStatus]}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Información completa de la invitación
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Información del invitado */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">
                            Información del Invitado
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Nombre</p>
                                    <p className="font-medium">{invitation.invitee_name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Documento</p>
                                    <p className="font-medium">
                                        {invitation.invitee_document_number}
                                    </p>
                                </div>
                            </div>

                            {invitation.invitee_email && (
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{invitation.invitee_email}</p>
                                    </div>
                                </div>
                            )}

                            {invitation.invitee_phone && (
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Teléfono</p>
                                        <p className="font-medium">{invitation.invitee_phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información del invitador */}
                    {inviterClient && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">
                                Invitado por
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-medium">{inviterClient.person_name}</p>
                                <p className="text-sm text-gray-600">Cliente activo</p>
                            </div>
                        </div>
                    )}

                    {/* Sede preferida */}
                    {invitation.preferred_branch_id && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">
                                Sede Preferida
                            </h3>
                            {preferredBranch === undefined ? (
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>Cargando información de la sede...</span>
                                </div>
                            ) : preferredBranch === null ? (
                                <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>No se pudo cargar la información de la sede</span>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium">{preferredBranch.name}</p>
                                        {preferredBranch.address?.main_address && (
                                            <p className="text-sm text-gray-600">
                                                {preferredBranch.address.main_address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Fechas */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">
                            Información de Fechas
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Fecha de creación</p>
                                    <p className="font-medium">{formatDate(invitation.created_at)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Fecha de expiración</p>
                                    <p
                                        className={`font-medium ${expired ? "text-red-600" : ""
                                            }`}
                                    >
                                        {formatDate(invitation.expires_at)}
                                        {expired && " (Expirada)"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Token (solo para referencia) */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg border-b pb-2">Token</h3>
                        <div className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
                            {invitation.token}
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                    {canRedeem && onRedeem && (
                        <Button
                            onClick={() => {
                                onRedeem(invitationId);
                                onClose();
                            }}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Canjear Invitación
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
