import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";


// Tipos
interface Trainer {
    _id: string;
    employee_code: string;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_VACATION';
    hire_date: number;
    person?: {
        name: string;
        last_name: string;
        document_type: string;
        document_number: string;
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
}

const TrainerRow: React.FC<TrainerRowProps> = ({ trainer, onViewTrainer }) => {
    return (
        <tr key={trainer._id} className="hover:bg-yellow-50 transition-colors">
            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                {trainer.employee_code}
            </td>
            <td className="px-4 py-3 text-sm text-gray-900">
                {trainer.person ? `${trainer.person.name} ${trainer.person.last_name}` : "-"}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {trainer.person ? trainer.person.document_number : "-"}
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
            <td className="px-4 py-3 text-right">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewTrainer(trainer)}
                    className="hover:bg-yellow-50 hover:border-yellow-200"
                >
                    Ver
                </Button>
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
        "Fecha de Ingreso",
        ""
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
    const trainers = useQuery(api.trainers.queries.getAllWithDetails, {}) ?? [];
    console.log("Entrenadores desde Convex:", trainers);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 8;
    const totalPages = Math.ceil(trainers.length / PAGE_SIZE);
    const currentTrainers = trainers.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleViewTrainer = (trainer: Trainer) => {
        console.log('Ver entrenador:', trainer);
        // Aquí iría la lógica para ver el detalle del entrenador
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
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
            <Card className="shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <TableHeader />
                        <tbody className="bg-white divide-y divide-gray-100">
                            {trainers === undefined ? (
                                <LoadingState />
                            ) : currentTrainers.length > 0 ? (
                                currentTrainers.map((trainer) => (
                                    <TrainerRow
                                        key={trainer._id}
                                        trainer={trainer}
                                        onViewTrainer={handleViewTrainer}
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
        </div>
    );
}