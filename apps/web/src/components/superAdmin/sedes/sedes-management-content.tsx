import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { SedeCard } from "./sede-card";
import { DeleteSedeConfirmDialog } from "./delete-sede-confirm-dialog";
import { AddSedeModal } from "./add-sede-modal";
import { EditSedeModal } from "./edit-sede-modal";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import { toast } from "sonner";
import { extractConvexErrorMessage } from "@/lib/error-utils";

type SedeData = {
    _id: string;
    name: string;
    departamento: string;
    ciudad: string;
    direccion: string;
    administrador: string;
    contacto: string;
    entrenadoresActivos: number;
    isActive: boolean;
    status: "ACTIVE" | "INACTIVE" | "UNDER_CONSTRUCTION" | "TEMPORARILY_CLOSED";
    opening_time: string;
    closing_time: string;
    max_capacity: number;
};

export function SedesManagementContent() {
    const [deletingSedeId, setDeletingSedeId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sedeToDelete, setSedeToDelete] = useState<SedeData | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSedeId, setEditingSedeId] = useState<string | null>(null);

    // Consumir la query real de branches
    const branchesData = useQuery(api.branches.queries.getAllWithDetails);

    // Mutación para eliminar sede
    const deleteBranchMutation = useMutation(api.branches.mutations.deleteBranch);

    // Transformar los datos de la query a la estructura esperada por el componente
    const sedes: SedeData[] = branchesData?.map(branch => ({
        _id: branch._id,
        name: branch.name,
        departamento: branch.city?.state_region || "No definido",
        ciudad: branch.city?.name || "No definida",
        direccion: branch.address?.main_address || "No definida",
        administrador: branch.manager?.name || "Sin asignar",
        contacto: branch.phone || branch.manager?.phone || "No disponible",
        entrenadoresActivos: branch.trainers?.length || 0,
        isActive: branch.status === "ACTIVE",
        status: branch.status,
        opening_time: branch.opening_time,
        closing_time: branch.closing_time,
        max_capacity: branch.max_capacity,
    })) || [];

    const handleAddSede = () => {
        setIsAddModalOpen(true);
    };

    const handleEditSede = (id: string) => {
        setEditingSedeId(id);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingSedeId(null);
    };

    const handleDeleteSede = (id: string) => {
        const sede = sedes.find(s => s._id === id);
        if (sede) {
            setSedeToDelete(sede);
            setDeleteDialogOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!sedeToDelete) return;

        setDeletingSedeId(sedeToDelete._id);
        try {
            await deleteBranchMutation({ branchId: sedeToDelete._id });
            toast.success("Sede eliminada exitosamente", {
                description: `La sede "${sedeToDelete.name}" ha sido eliminada correctamente.`
            });
            setDeleteDialogOpen(false);
            setSedeToDelete(null);
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

    // Estado de carga
    const isLoading = branchesData === undefined;
    const hasAnyDeletingOperation = deletingSedeId !== null; return (
        <>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8 animate-slide-in-left">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        SEDES DISPONIBLES
                    </h1>
                    <p className="text-xl text-gray-700 mb-6">
                        Administrador, Estas Son Las Sedes Disponibles Actualmente
                    </p>

                    {/* Add Sede Button */}
                    <Button
                        onClick={handleAddSede}
                        className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 disabled:hover:bg-gray-400 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 animate-scale-in"
                        disabled={isLoading || hasAnyDeletingOperation}
                    >
                        <Plus size={20} />
                        Añadir Sede
                    </Button>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
                        <span className="ml-2 text-gray-600">Cargando sedes...</span>
                    </div>
                ) : (
                    /* Sedes Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-in-right">
                        {sedes.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 text-lg">No hay sedes disponibles</p>
                            </div>
                        ) : (
                            sedes.map((sede, index) => (
                                <div
                                    key={sede._id}
                                    className="animate-fade-in-up"
                                    style={{
                                        animationDelay: `${index * 0.2}s`,
                                        animationFillMode: 'both'
                                    }}
                                >
                                    <SedeCard
                                        sede={{
                                            id: parseInt(sede._id.slice(-8), 16), // Convertir _id a número para compatibilidad
                                            name: sede.name,
                                            departamento: sede.departamento,
                                            ciudad: sede.ciudad,
                                            direccion: sede.direccion,
                                            administrador: sede.administrador,
                                            contacto: sede.contacto,
                                            entrenadoresActivos: sede.entrenadoresActivos,
                                            image: "", // Sin imagen de fondo
                                            isActive: sede.isActive
                                        }}
                                        onEdit={() => handleEditSede(sede._id)}
                                        onDelete={() => handleDeleteSede(sede._id)}
                                        isDeleting={deletingSedeId === sede._id}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* Delete Confirmation Dialog */}
            <DeleteSedeConfirmDialog
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                sedeName={sedeToDelete?.name || ""}
                onConfirm={handleConfirmDelete}
                isDeleting={deletingSedeId !== null}
            />

            {/* Add Sede Modal */}
            <AddSedeModal
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
            />

            {/* Edit Sede Modal */}
            {editingSedeId && (
                <EditSedeModal
                    isOpen={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    branchId={editingSedeId}
                />
            )}
        </>
    );
}