import { Button } from "@/components/ui/button";
import { Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import SedeDetailsModal from "./sede-details-modal";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { extractConvexErrorMessage } from "@/lib/error-utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "@tanstack/react-router";

type SedeData = {
    _id: string;
    name: string;
    departamento: string;
    ciudad: string;
    direccion: string;
    telefono: string;
    email: string;
    max_capacity: number;
    opening_time: string;
    closing_time: string;
    status: "ACTIVE" | "INACTIVE" | "UNDER_CONSTRUCTION" | "TEMPORARILY_CLOSED";
    metadata: {
        has_parking?: boolean;
        has_pool?: boolean;
        has_sauna?: boolean;
        has_spa?: boolean;
        has_locker_rooms?: boolean;
        wifi_available?: boolean;
    };
    isActive: boolean;
};

type SedeStatus = SedeData['status'];

// Constantes
const PAGE_SIZE = 8;

const STATUS_STYLES: Record<SedeStatus, string> = {
    ACTIVE: "bg-green-100 text-green-700 px-2 py-1 rounded text-xs",
    INACTIVE: "bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs",
    UNDER_CONSTRUCTION: "bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs",
    TEMPORARILY_CLOSED: "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs"
};

const STATUS_LABELS: Record<SedeStatus, string> = {
    ACTIVE: "Activa",
    INACTIVE: "Inactiva",
    UNDER_CONSTRUCTION: "En Construcción",
    TEMPORARILY_CLOSED: "Cerrada Temporalmente"
};

// Componente de fila de sede
interface SedeRowProps {
    sede: SedeData;
    onView: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    isDeleting?: boolean;
}

const SedeRow: React.FC<SedeRowProps> = ({
    sede,
    onView,
    onEdit,
    onDelete,
    isDeleting = false,
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleConfirmDelete = () => {
        onDelete(sede._id);
        setDialogOpen(false);
    };

    return (
        <tr className="hover:bg-yellow-50 transition-colors">
            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                {sede.name}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {sede.ciudad}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {sede.departamento}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {sede.direccion}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {sede.telefono}
            </td>
            <td className="px-4 py-3 text-sm">
                <span className={STATUS_STYLES[sede.status]}>
                    {STATUS_LABELS[sede.status]}
                </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {sede.max_capacity}
            </td>
            <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                    <Button
                        onClick={() => onView(sede._id)}
                        size="sm"
                        variant="outline"
                        disabled={isDeleting}
                        className="hover:bg-blue-50 border-blue-200 disabled:opacity-50 text-black hover:text-gray-900"
                    >
                        Ver
                    </Button>
                    <Button
                        onClick={() => onEdit(sede._id)}
                        size="sm"
                        disabled={isDeleting}
                        className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 disabled:hover:bg-gray-400 text-gray-900 font-semibold p-2"
                    >
                        <Edit size={16} />
                    </Button>
                    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                disabled={isDeleting}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:hover:bg-red-300 text-white font-semibold p-2"
                            >
                                {isDeleting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción eliminará permanentemente la sede{" "}
                                    <strong>{sede.name}</strong>{" "}
                                    y todos sus datos asociados del sistema.
                                    Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirmDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </td>
        </tr>
    );
};

// ...existing code... (TableHeader, EmptyState, LoadingState, Pagination sin cambios)

const TableHeader: React.FC = () => {
    const headers = [
        "Nombre",
        "Ciudad",
        "Departamento",
        "Dirección",
        "Teléfono",
        "Estado",
        "Capacidad",
        "Acciones"
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

const EmptyState: React.FC = () => (
    <tr>
        <td colSpan={8} className="px-4 py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
                <div className="text-gray-400 text-lg">🏢</div>
                <p className="text-gray-500 text-sm">No hay sedes para mostrar</p>
            </div>
        </td>
    </tr>
);

const LoadingState: React.FC = () => (
    <>
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <tr key={i}>
                <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-3">
                    <Skeleton className="h-4 w-40" />
                </td>
                <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                </td>
                <td className="px-4 py-3 text-center">
                    <Skeleton className="h-8 w-12 ml-auto" />
                </td>
            </tr>
        ))}
    </>
);

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    sedes: SedeData[];
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    sedes,
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
                Mostrando {Math.min((currentPage - 1) * PAGE_SIZE + 1, sedes.length)} -{" "}
                {Math.min(currentPage * PAGE_SIZE, sedes.length)} de{" "}
                {sedes.length} sedes
            </div>
        </div>
    );
};

export function SedesManagementContent() {
    const navigate = useNavigate();
    const [deletingSedeId, setDeletingSedeId] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSedeId, setSelectedSedeId] = useState<Id<"branches"> | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const branchesData = useQuery(api.branches.queries.getAllWithDetails);
    const deleteBranchMutation = useMutation(api.branches.mutations.deleteBranch);

    const sedes: SedeData[] = branchesData?.map(branch => ({
        _id: branch._id,
        name: branch.name,
        departamento: branch.city?.state_region || "No definido",
        ciudad: branch.city?.name || "No definida",
        direccion: branch.address?.main_address || "No definida",
        telefono: branch.phone || "No disponible",
        email: branch.email || "No disponible",
        max_capacity: branch.max_capacity || 0,
        opening_time: branch.opening_time || "No definido",
        closing_time: branch.closing_time || "No definido",
        status: branch.status,
        metadata: branch.metadata || {},
        isActive: branch.status === "ACTIVE",
    })) || [];

    const handleAddSede = () => {
        navigate({ to: '/super-admin/sedes/new' });
    };

    const handleViewSede = (id: string) => {
        setSelectedSedeId(id as Id<"branches">);
        setIsDetailsModalOpen(true);
    };

    const handleEditSede = (id: string) => {
        navigate({
            to: '/super-admin/sedes/edit',
            search: { branchId: id }
        });
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedSedeId(null);
    };

    const handleDeleteSede = async (id: string) => {
        setDeletingSedeId(id);
        try {
            await deleteBranchMutation({ branchId: id });
            toast.success("Sede eliminada exitosamente", {
                description: `La sede ha sido eliminada correctamente.`
            });
        } catch (error) {
            console.error("Error al eliminar sede:", error);

            const errorMessage = extractConvexErrorMessage(error, "Ocurrió un error al intentar eliminar la sede. Por favor, inténtalo de nuevo.");

            toast.error("Error al eliminar sede", {
                description: errorMessage
            });
        } finally {
            setDeletingSedeId(null);
        }
    };

    const isLoading = branchesData === undefined;

    const cities = useMemo(() => {
        const uniqueCities = new Set(sedes.map(sede => sede.ciudad));
        return Array.from(uniqueCities).sort();
    }, [sedes]);

    const filteredSedes = useMemo(() => {
        if (selectedCity === "all") {
            return sedes;
        }
        return sedes.filter(sede => sede.ciudad === selectedCity);
    }, [sedes, selectedCity]);

    const totalPages = Math.ceil(filteredSedes.length / PAGE_SIZE);
    const currentSedes = filteredSedes.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <>
            <div className="min-h-full w-full p-8 bg-gradient-to-br from-yellow-50 to-yellow-50">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Gestión de Sedes
                        </h1>
                        <p className="text-gray-600">
                            Administra y visualiza información de todas las sedes
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-black">
                        <Select
                            value={selectedCity}
                            onValueChange={setSelectedCity}
                        >
                            <SelectTrigger className="w-64 bg-white border-gray-300">
                                <SelectValue placeholder="Filtrar por ciudad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las ciudades</SelectItem>
                                {cities.map((city) => (
                                    <SelectItem key={city} value={city}>
                                        {city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handleAddSede}
                            size="lg"
                            className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors"
                        >
                            <Plus size={20} className="mr-2" />
                            Agregar Nueva Sede
                        </Button>
                    </div>
                </div>

                {/* Tabla */}
                <Card className="shadow-sm border-0 bg-white overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border-0">
                            <TableHeader />
                            <tbody className="bg-white divide-y divide-gray-100">
                                {isLoading ? (
                                    <LoadingState />
                                ) : currentSedes.length > 0 ? (
                                    currentSedes.map((sede) => (
                                        <SedeRow
                                            key={sede._id}
                                            sede={sede}
                                            onView={handleViewSede}
                                            onEdit={handleEditSede}
                                            onDelete={handleDeleteSede}
                                            isDeleting={deletingSedeId === sede._id}
                                        />
                                    ))
                                ) : (
                                    <EmptyState />
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            sedes={filteredSedes}
                        />
                    )}
                </Card>
            </div>

            <SedeDetailsModal
                branchId={selectedSedeId}
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
            />
        </>
    );
}