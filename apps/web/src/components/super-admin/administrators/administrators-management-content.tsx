import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useAction } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Administrator } from "@/lib/administrator-types";
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
import AdministratorDetailsModal from "@/components/super-admin/administrators/administrator-details-modal";

// Interfaces and Types
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// Componente de paginación
function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    return (
        <div className="flex justify-center mt-6">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                    variant="outline"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                    Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => onPageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                            ${currentPage === page
                                ? 'z-10 bg-yellow-400 border-yellow-400 text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {page}
                    </Button>
                ))}
                <Button
                    variant="outline"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                    Siguiente
                </Button>
            </nav>
        </div>
    );
}

// Componente principal
export function AdministratorsManagementContent() {
    const administrators = useQuery(api.administrators.queries.getAllWithDetails, {}) ?? [];
    const deleteAdministratorAction = useAction(api.administrators.mutations.deleteAdministratorComplete);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingAdministratorId, setDeletingAdministratorId] = useState<Id<"administrators"> | null>(null);
    const [selectedAdministratorId, setSelectedAdministratorId] = useState<Id<"administrators"> | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const PAGE_SIZE = 8;
    const totalPages = Math.ceil(administrators.length / PAGE_SIZE);
    const currentAdministrators = administrators.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleViewAdministrator = (administrator: Administrator) => {
        setSelectedAdministratorId(administrator._id);
        setIsDetailsModalOpen(true);
    };

    const handleEditAdministrator = (administrator: Administrator) => {
        navigate({
            to: '/super-admin/administrators/edit',
            search: { administratorId: administrator._id }
        });
    };

    const handleDeleteAdministrator = async (administrator: Administrator) => {
        try {
            setDeletingAdministratorId(administrator._id);

            const result = await deleteAdministratorAction({
                administratorId: administrator._id
            });

            if (result.success) {
                toast.success(result.message, {
                    duration: 5000,
                });
            } else {
                throw new Error('La eliminación no fue exitosa');
            }
        } catch (error) {
            console.error('Error al eliminar administrador:', error);

            let errorMessage = 'Error al eliminar el administrador';
            if (error instanceof Error) {
                if (error.message.includes('No autenticado')) {
                    errorMessage = 'No tienes permisos para realizar esta acción';
                } else if (error.message) {
                    errorMessage = error.message;
                }
            }

            toast.error(errorMessage, {
                duration: 5000,
            });
        } finally {
            setDeletingAdministratorId(null);
        }
    };

    return (
        <div className="container mx-auto py-6 px-4">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Gestión de Administradores
                    </h1>
                    <p className="text-gray-600">
                        Administra y visualiza información de todos los administradores
                    </p>
                </div>
                <div>
                    <Link to="/super-admin/administrators/new">
                        <Button
                            size="lg"
                            className="mt-4 cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors"
                        >
                            + Agregar Nuevo Administrador
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tabla */}
            <Card className="shadow-sm border-0 bg-white overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border-0">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Documento
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Sede
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentAdministrators.map((administrator) => {
                                const isDeleting = deletingAdministratorId === administrator._id;
                                const statusColor = administrator.status === "active" ? "green" : "red";
                                const statusText = administrator.status === "active" ? "Activo" : "Inactivo";

                                return (
                                    <tr key={administrator._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {administrator.person?.name} {administrator.person?.last_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {administrator.user?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {administrator.person?.document_type} {administrator.person?.document_number}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {administrator.branch?.name || "No asignada"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {administrator.rol_type === "admin" ? "Administrador General" : "Administrador de Sede"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800`}>
                                                {statusText}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleViewAdministrator(administrator)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold p-2"
                                            >
                                                Ver detalles
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleEditAdministrator(administrator)}
                                                className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold p-2"
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <AlertDialog>
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
                                                            Esta acción eliminará permanentemente al administrador{" "}
                                                            <strong>{administrator.person?.name} {administrator.person?.last_name}</strong>{" "}
                                                            y todos sus datos asociados del sistema.
                                                            Esta acción no se puede deshacer.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteAdministrator(administrator)}
                                                            className="bg-red-500 hover:bg-red-600"
                                                        >
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Paginación */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Modal de detalles */}
            {selectedAdministratorId && (
                <AdministratorDetailsModal
                    administratorId={selectedAdministratorId}
                    open={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setSelectedAdministratorId(null);
                    }}
                />
            )}
        </div>
    );
}