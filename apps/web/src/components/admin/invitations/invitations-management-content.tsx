import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, Mail, Phone, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface InvitationsManagementContentProps {
    branchId?: Id<"branches">;
    isSuperAdmin?: boolean;
}

type InvitationStatus = "PENDING" | "REDEEMED" | "CANCELED" | "EXPIRED";

const PAGE_SIZE = 8;

const STATUS_COLORS: Record<InvitationStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs",
    REDEEMED: "bg-green-100 text-green-700 px-2 py-1 rounded text-xs",
    CANCELED: "bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs",
    EXPIRED: "bg-red-100 text-red-700 px-2 py-1 rounded text-xs",
};

const STATUS_LABELS: Record<InvitationStatus, string> = {
    PENDING: "Pendiente",
    REDEEMED: "Canjeada",
    CANCELED: "Cancelada",
    EXPIRED: "Expirada",
};

// Componente de fila de invitación
interface InvitationRowProps {
    invitation: any;
    index: number;
    onToggleStatus: (invitationId: Id<"invitations">, currentStatus: string) => void;
    isUpdating?: boolean;
}

const InvitationRow: React.FC<InvitationRowProps> = ({
    invitation,
    index,
    onToggleStatus,
    isUpdating = false,
}) => {
    const expired = invitation.expires_at < Date.now();
    const isPending = invitation.status === "PENDING" && !expired;
    const isRedeemed = invitation.status === "REDEEMED";
    const canTakeAction = isPending || isRedeemed;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <tr className="hover:bg-yellow-50 transition-colors">
            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
            <td className="px-4 py-3 text-sm text-gray-900">{invitation.invitee_name}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{invitation.invitee_document_number}</td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {invitation.invitee_email ? (
                    <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="truncate max-w-[150px]">{invitation.invitee_email}</span>
                    </div>
                ) : (
                    "-"
                )}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {invitation.invitee_phone ? (
                    <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {invitation.invitee_phone}
                    </div>
                ) : (
                    "-"
                )}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {formatDate(invitation.created_at)}
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className={expired ? "text-red-600 font-medium" : ""}>
                        {formatDate(invitation.expires_at)}
                        {expired && " ⚠️"}
                    </span>
                </div>
            </td>
            <td className="px-4 py-3 text-sm">
                <span className={STATUS_COLORS[invitation.status as InvitationStatus]}>
                    {STATUS_LABELS[invitation.status as InvitationStatus]}
                </span>
            </td>
            <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                    {isPending ? (
                        <Button
                            size="sm"
                            onClick={() => onToggleStatus(invitation._id, invitation.status)}
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Canjear
                        </Button>
                    ) : isRedeemed ? (
                        <Button
                            size="sm"
                            onClick={() => onToggleStatus(invitation._id, invitation.status)}
                            disabled={isUpdating}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold p-2"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    ) : (
                        <span className="text-xs text-gray-400">
                            {expired ? "Expirada" : "No disponible"}
                        </span>
                    )}
                </div>
            </td>
        </tr>
    );
};

// Componente de cabecera de tabla
const TableHeader: React.FC = () => {
    const headers = [
        "Ítem",
        "Nombre",
        "Documento",
        "Email",
        "Teléfono",
        "Fecha Creación",
        "Fecha Expiración",
        "Estado",
        "Acciones",
    ];

    return (
        <thead className="bg-gray-50">
            <tr>
                {headers.map((header, index) => (
                    <th
                        key={index}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                        {header}
                    </th>
                ))}
            </tr>
        </thead>
    );
};

// Componente de estado vacío
const EmptyState: React.FC<{ searchTerm: string }> = ({ searchTerm }) => (
    <tr>
        <td colSpan={9} className="px-4 py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
                <div className="text-gray-400 text-lg">📋</div>
                <p className="text-gray-500 text-sm">
                    {searchTerm
                        ? "No se encontraron invitaciones con ese criterio de búsqueda"
                        : "No hay invitaciones disponibles"}
                </p>
            </div>
        </td>
    </tr>
);

// Componente de estado de carga
const LoadingState: React.FC = () => (
    <>
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <tr key={i}>
                <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                <td className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
                <td className="px-4 py-3 text-center"><Skeleton className="h-8 w-16 mx-auto" /></td>
            </tr>
        ))}
    </>
);

// Componente de paginación
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    invitations: any[];
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    invitations,
}) => {
    return (
        <div className="flex justify-between items-center py-4 px-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
                <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="hover:bg-yellow-50 hover:border-yellow-200"
                >
                    Anterior
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="hover:bg-yellow-50 hover:border-yellow-200"
                >
                    Siguiente
                </Button>
            </div>

            <div className="text-sm text-gray-600">
                Página <span className="font-medium">{currentPage}</span> de{" "}
                <span className="font-medium">{totalPages}</span>
            </div>

            <div className="text-sm text-gray-500">
                Mostrando {Math.min((currentPage - 1) * PAGE_SIZE + 1, invitations.length)} -{" "}
                {Math.min(currentPage * PAGE_SIZE, invitations.length)} de {invitations.length}{" "}
                invitaciones
            </div>
        </div>
    );
};

// Componente principal
export function InvitationsManagementContent({
    branchId,
    isSuperAdmin = false,
}: InvitationsManagementContentProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingInvitationId, setUpdatingInvitationId] = useState<Id<"invitations"> | null>(null);

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
    const cancelInvitation = useMutation(api.invitations.mutations.cancelInvitation);

    // Filtrar invitaciones
    const filteredInvitations = useMemo(() => {
        if (!invitations) return [];

        const search = searchTerm.toLowerCase().trim();
        if (!search) return invitations;

        return invitations.filter((invitation) => {
            const name = invitation.invitee_name?.toLowerCase() || "";
            const document = invitation.invitee_document_number?.toLowerCase() || "";
            const email = invitation.invitee_email?.toLowerCase() || "";

            return name.includes(search) || document.includes(search) || email.includes(search);
        });
    }, [invitations, searchTerm]);

    const totalPages = Math.ceil(filteredInvitations.length / PAGE_SIZE);
    const currentInvitations = filteredInvitations.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleToggleStatus = async (invitationId: Id<"invitations">, currentStatus: string) => {
        try {
            setUpdatingInvitationId(invitationId);

            if (currentStatus === "PENDING") {
                // Cambiar a REDEEMED
                await redeemInvitation({
                    payload: { invitation_id: invitationId },
                });
                toast.success("Invitación canjeada exitosamente");
            } else if (currentStatus === "REDEEMED") {
                // Cambiar a CANCELED
                await cancelInvitation({
                    payload: { invitation_id: invitationId },
                });
                toast.success("Invitación cancelada exitosamente");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al actualizar la invitación");
        } finally {
            setUpdatingInvitationId(null);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="space-y-6">
            {/* Barra de búsqueda */}
            <Card className="p-4 shadow-sm border-0 bg-white">
                <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Buscar por nombre, documento o email..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="flex-1"
                    />
                </div>
            </Card>

            {/* Tabla */}
            <Card className="shadow-sm border-0 bg-white overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border-0">
                        <TableHeader />
                        <tbody className="bg-white divide-y divide-gray-100">
                            {invitations === undefined ? (
                                <LoadingState />
                            ) : currentInvitations.length > 0 ? (
                                currentInvitations.map((invitation, index) => (
                                    <InvitationRow
                                        key={invitation._id}
                                        invitation={invitation}
                                        index={(currentPage - 1) * PAGE_SIZE + index}
                                        onToggleStatus={handleToggleStatus}
                                        isUpdating={updatingInvitationId === invitation._id}
                                    />
                                ))
                            ) : (
                                <EmptyState searchTerm={searchTerm} />
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        invitations={filteredInvitations}
                    />
                )}
            </Card>
        </div>
    );
}
