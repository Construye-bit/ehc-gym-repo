import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Link } from "@tanstack/react-router";


// Tipos
interface Trainer {
    id: string;
    name: string;
    last_name: string;
    employee_code: string;
    phone: string;
    branch: string;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_VACATION';
    hire_date: string;
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

// Datos mock
const MOCK_TRAINERS: Trainer[] = Array.from({ length: 23 }).map((_, i) => ({
    id: `trainer_${i + 1}`,
    name: `Nombre ${i + 1}`,
    last_name: `Apellido ${i + 1}`,
    employee_code: `EMP${1000 + i}`,
    phone: `30012345${String(i).padStart(2, "0")}`,
    branch: `Sede ${((i % 3) + 1)}`,
    status: (["ACTIVE", "INACTIVE", "ON_VACATION"] as const)[i % 3],
    hire_date: "2023-01-01",
}));

// Componente de fila de entrenador
interface TrainerRowProps {
    trainer: Trainer;
    onViewTrainer: (trainer: Trainer) => void;
}

const TrainerRow: React.FC<TrainerRowProps> = ({ trainer, onViewTrainer }) => {
    return (
        <tr key={trainer.id} className="hover:bg-yellow-50 transition-colors">
            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                {trainer.employee_code}
            </td>
            <td className="px-4 py-3 text-sm text-gray-900">
                {trainer.name} {trainer.last_name}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {trainer.phone}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {trainer.branch}
            </td>
            <td className="px-4 py-3 text-sm">
                <span className={STATUS_STYLES[trainer.status]}>
                    {STATUS_LABELS[trainer.status]}
                </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                {new Date(trainer.hire_date).toLocaleDateString('es-ES')}
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
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
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
                Mostrando {Math.min((currentPage - 1) * PAGE_SIZE + 1, MOCK_TRAINERS.length)} -{" "}
                {Math.min(currentPage * PAGE_SIZE, MOCK_TRAINERS.length)} de{" "}
                {MOCK_TRAINERS.length} entrenadores
            </div>
        </div>
    );
};

// Componente principal
export function TrainersManagementContent() {
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const totalPages = Math.ceil(MOCK_TRAINERS.length / PAGE_SIZE);
    const currentTrainers = MOCK_TRAINERS.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleViewTrainer = (trainer: Trainer) => {
        console.log('Ver entrenador:', trainer);
        // Aquí iría la lógica para ver el detalle del entrenador
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setIsLoading(true);
            // Simular carga
            setTimeout(() => {
                setCurrentPage(page);
                setIsLoading(false);
            }, 300);
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
                            {isLoading ? (
                                <LoadingState />
                            ) : currentTrainers.length > 0 ? (
                                currentTrainers.map((trainer) => (
                                    <TrainerRow
                                        key={trainer.id}
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

                {/* Paginación */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </Card>
        </div>
    );
}