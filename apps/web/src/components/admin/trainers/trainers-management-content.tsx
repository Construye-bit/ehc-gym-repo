import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useAction } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { Edit, Trash2, Loader2 } from "lucide-react";
import TrainerDetailsModal from "./trainer-details-modal";
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
import { toast } from "sonner";


// Tipos
interface Trainer {
    _id: Id<"trainers">;
    employee_code: string;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_VACATION';
    hire_date: number;
    person?: {
        name: string;
        last_name: string;
        document_type: string;
        document_number: string;
        phone?: string;
    } | null;
    branch?: {
        name: string;
    } | null;
}

type TrainerStatus = Trainer['status'];

// Constantes
const PAGE_SIZE = 8;
const STATUS_STYLES: Record<TrainerStatus, string> = {
    ACTIVE: "bg-green-100 text-green-700 px-2 py-1 rounded text-xs",
    ON_VACATION: "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs",
    INACTIVE: "bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
};

const STATUS_LABELS: Record<TrainerStatus, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    ON_VACATION: "De Vacaciones"
};


// Componente de fila de entrenador
interface TrainerRowProps {
    trainer: Trainer;
    onViewTrainer: (trainer: Trainer) => void;
    onEditTrainer: (trainer: Trainer) => void;
    onDeleteTrainer: (trainer: Trainer) => void;
    isDeleting?: boolean;
    deleteDialogOpen?: boolean;
    setDeleteDialogOpen?: (open: boolean) => void;
}

const TrainerRow: React.FC<TrainerRowProps> = ({
    trainer,
    onViewTrainer,
    onEditTrainer,
    onDeleteTrainer,
    isDeleting = false,
    deleteDialogOpen = false,
    setDeleteDialogOpen
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleDeleteClick = () => {
        setDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        onDeleteTrainer(trainer);
        setDialogOpen(false);
    };
    return (
        <tr key={trainer._id} className="hover:bg-yellow-50 transition-colors">
            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                {trainer.employee_code}
            </td>
            <td className="px-4 py-3 text-sm text-gray-900">
                {trainer.person ? `${trainer.person.name} ${trainer.person.last_name}` : "-"}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {trainer.person?.phone || "-"}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {trainer.branch ? trainer.branch.name : "-"}
            </td>
            <td className="px-4 py-3 text-sm">
                <span className={STATUS_STYLES[trainer.status]}>
                    {STATUS_LABELS[trainer.status]}
                </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {trainer.hire_date ? new Date(trainer.hire_date).toLocaleDateString('es-ES') : "-"}
            </td>
            <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                    <Button
                        onClick={() => onViewTrainer(trainer)}
                        size="sm"
                        variant="outline"
                        disabled={isDeleting}
                        className="hover:bg-blue-50 border-blue-200 disabled:opacity-50 text-black hover:text-gray-900"
                    >
                        Ver
                    </Button>
                    <Button
                        onClick={() => onEditTrainer(trainer)}
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
                                    Esta acción eliminará permanentemente al entrenador{" "}
                                    <strong>{trainer.person?.name} {trainer.person?.last_name}</strong>{" "}
                                    (Código: {trainer.employee_code}) y todos sus datos asociados del sistema.
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

// Componente de cabecera de tabla
const TableHeader: React.FC = () => {
    const headers = [
        "Código",
        "Nombre",
        "Teléfono",
        "Sede",
        "Estado",
        "Fecha de Contratación",
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

// Componente de estado vacío
const EmptyState: React.FC = () => (
    <tr>
        <td colSpan={7} className="px-4 py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
                <div className="text-gray-400 text-lg">📋</div>
                <p className="text-gray-500 text-sm">No hay entrenadores para mostrar</p>
            </div>
        </td>
    </tr>
);

// Componente de estado de carga
const LoadingState: React.FC = () => (
    <>
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <tr key={i}>
                <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                </td>
                <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                </td>
                <td className="px-4 py-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-4 py-3 text-right">
                    <Skeleton className="h-8 w-12 ml-auto" />
                </td>
            </tr>
        ))}
    </>
);

// Componente de paginación
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    trainers: Trainer[];
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    trainers,
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
                Mostrando {Math.min((currentPage - 1) * PAGE_SIZE + 1, trainers.length)} -{" "}
                {Math.min(currentPage * PAGE_SIZE, trainers.length)} de{" "}
                {trainers.length} entrenadores
            </div>
        </div>
    );
};

// Componente principal
export function TrainersManagementContent() {
    // Usar la query para admins que filtra por sede asignada
    const trainersData = useQuery(api.trainers.queries.getMyTrainersWithDetails, {});
    const trainers = trainersData ?? [];
    const deleteTrainerAction = useAction(api.trainers.mutations.deleteTrainerComplete);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingTrainerId, setDeletingTrainerId] = useState<Id<"trainers"> | null>(null);
    const [selectedTrainerId, setSelectedTrainerId] = useState<Id<"trainers"> | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const totalPages = Math.ceil(trainers.length / PAGE_SIZE);
    const currentTrainers = trainers.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleViewTrainer = (trainer: Trainer) => {
        setSelectedTrainerId(trainer._id);
        setIsDetailsModalOpen(true);
    };

    const handleEditTrainer = (trainer: Trainer) => {
        navigate({
            to: '/admin/trainers/edit',
            search: { trainerId: trainer._id }
        });
    };

    const handleDeleteTrainer = async (trainer: Trainer) => {
        try {
            setDeletingTrainerId(trainer._id);

            const result = await deleteTrainerAction({
                trainerId: trainer._id
            });

            if (result.success) {
                toast.success(result.message, {
                    duration: 5000,
                });
            } else {
                throw new Error('La eliminación no fue exitosa');
            }
        } catch (error) {
            console.error('Error al eliminar entrenador:', error);

            let errorMessage = 'Error al eliminar el entrenador';
            if (error instanceof Error) {
                if (error.message.includes('No autenticado')) {
                    errorMessage = 'No tienes permisos para realizar esta acción';
                } else if (error.message.includes('No tienes permisos')) {
                    errorMessage = 'No tienes permisos suficientes para eliminar entrenadores';
                } else if (error.message.includes('no encontrado')) {
                    errorMessage = 'El entrenador no fue encontrado';
                } else {
                    errorMessage = error.message;
                }
            }

            toast.error(errorMessage, {
                duration: 5000,
            });
        } finally {
            setDeletingTrainerId(null);
        }
    }; const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedTrainerId(null);
    };

    return (
        <div className="min-h-full w-full p-8 bg-gradient-to-br from-yellow-50 to-yellow-50">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Gestión de Entrenadores
                    </h1>
                    <p className="text-gray-600">
                        Administra y visualiza información de todos los entrenadores
                    </p>
                </div>
                <div>
                    <Link to="/admin/trainers/new">
                        <Button
                            size="lg"
                            className="mt-4 cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors"
                        >
                            + Agregar Nuevo Entrenador
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tabla */}
            <Card className="shadow-sm border-0 bg-white overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border-0">
                        <TableHeader />
                        <tbody className="bg-white divide-y divide-gray-100">
                            {trainersData === undefined ? (
                                <LoadingState />
                            ) : currentTrainers.length > 0 ? (
                                currentTrainers.map((trainer) => (
                                    <TrainerRow
                                        key={trainer._id}
                                        trainer={trainer}
                                        onViewTrainer={handleViewTrainer}
                                        onEditTrainer={handleEditTrainer}
                                        onDeleteTrainer={handleDeleteTrainer}
                                        isDeleting={deletingTrainerId === trainer._id}
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
                        trainers={trainers}
                    />
                )}
            </Card>

            {/* Modal de detalles del entrenador */}
            <TrainerDetailsModal
                trainerId={selectedTrainerId}
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
            />
        </div>
    );
}