import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle, XCircle, Clock, Calendar, Mail, Phone, User, MapPin } from "lucide-react";
import { toast } from "sonner";
import { InvitationDetailsModal } from "@/components/admin/invitations/invitation-details-modal";

interface InvitationsManagementContentProps {
    branchId?: Id<"branches">;
    isSuperAdmin?: boolean;
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

export function InvitationsManagementContent({ branchId, isSuperAdmin = false }: InvitationsManagementContentProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInvitationId, setSelectedInvitationId] = useState<Id<"invitations"> | null>(null);

    // Obtener invitaciones: todas si es super-admin, o de la sede específica
    const invitationsByBranch = useQuery(
        api.invitations.queries.listInvitationsByBranch,
        !isSuperAdmin && branchId ? { payload: { branch_id: branchId } } : "skip"
    );

    const allInvitations = useQuery(
        api.invitations.queries.listAllInvitations,
        isSuperAdmin ? {} : "skip"
    );

    const invitations = isSuperAdmin ? allInvitations : invitationsByBranch;

    // Mutation para canjear invitación
    const redeemInvitation = useMutation(api.invitations.mutations.redeemInvitation);

    // Filtrar invitaciones
    const filteredInvitations = useMemo(() => {
        if (!invitations) return [];

        const search = searchTerm.toLowerCase().trim();
        if (!search) return invitations;

        return invitations.filter((invitation) => {
            const name = invitation.invitee_name?.toLowerCase() || "";
            const document = invitation.invitee_document_number?.toLowerCase() || "";
            const email = invitation.invitee_email?.toLowerCase() || "";

            return (
                name.includes(search) ||
                document.includes(search) ||
                email.includes(search)
            );
        });
    }, [invitations, searchTerm]);

    // Estadísticas
    const stats = useMemo(() => {
        if (!invitations) return { total: 0, pending: 0, redeemed: 0, expired: 0 };

        return {
            total: invitations.length,
            pending: invitations.filter((i) => i.status === "PENDING").length,
            redeemed: invitations.filter((i) => i.status === "REDEEMED").length,
            expired: invitations.filter((i) => i.status === "EXPIRED").length,
        };
    }, [invitations]);

    const handleRedeem = async (invitationId: Id<"invitations">) => {
        try {
            await redeemInvitation({
                payload: { invitation_id: invitationId },
            });
            toast.success("Invitación canjeada exitosamente");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al canjear la invitación");
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const isExpired = (expiresAt: number) => {
        return expiresAt < Date.now();
    };

    return (
        <div className="space-y-6">

            {/* Barra de búsqueda */}
            <Card>
                <CardContent className="py-2">
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Buscar por nombre, documento o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Lista de invitaciones */}
            <div className="space-y-4">
                {filteredInvitations === undefined ? (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-center text-gray-500">Cargando invitaciones...</p>
                        </CardContent>
                    </Card>
                ) : filteredInvitations.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-center text-gray-500">
                                {searchTerm
                                    ? "No se encontraron invitaciones con ese criterio de búsqueda"
                                    : "No hay invitaciones disponibles"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredInvitations.map((invitation) => {
                        const expired = isExpired(invitation.expires_at);
                        const canRedeem = invitation.status === "PENDING" && !expired;

                        return (
                            <Card key={invitation._id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        {/* Información del invitado */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                                        <User className="w-5 h-5 text-gray-400" />
                                                        {invitation.invitee_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Doc: {invitation.invitee_document_number}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                {invitation.invitee_email && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Mail className="w-4 h-4" />
                                                        <span>{invitation.invitee_email}</span>
                                                    </div>
                                                )}
                                                {invitation.invitee_phone && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{invitation.invitee_phone}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>
                                                        Creada: {formatDate(invitation.created_at)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span
                                                        className={
                                                            expired ? "text-red-600 font-medium" : ""
                                                        }
                                                    >
                                                        Expira: {formatDate(invitation.expires_at)}
                                                        {expired && " (Expirada)"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex flex-col gap-2 md:w-48">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedInvitationId(invitation._id)
                                                }
                                                className="w-full"
                                            >
                                                Ver Detalles
                                            </Button>
                                            {canRedeem && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleRedeem(invitation._id)}
                                                    className="w-full bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Canjear
                                                </Button>
                                            )}
                                            {expired && invitation.status === "PENDING" && (
                                                <div className="text-xs text-red-600 text-center">
                                                    Esta invitación ha expirado
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Modal de detalles */}
            {selectedInvitationId && (
                <InvitationDetailsModal
                    invitationId={selectedInvitationId}
                    onClose={() => setSelectedInvitationId(null)}
                    onRedeem={handleRedeem}
                />
            )}
        </div>
    );
}
