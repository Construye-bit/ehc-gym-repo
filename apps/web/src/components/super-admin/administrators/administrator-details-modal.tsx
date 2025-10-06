import React from "react";
import { useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AdministratorDetailsModalProps {
    administratorId: Id<"administrators">;
    open: boolean;
    onClose: () => void;
}

export default function AdministratorDetailsModal({
    administratorId,
    open,
    onClose
}: AdministratorDetailsModalProps) {
    const administrator = useQuery(api.administrators.queries.getById, { administratorId });

    if (!administrator) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalles del Administrador</DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    {/* Datos de Usuario */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Datos de Usuario
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Nombre de usuario</p>
                                <p className="text-sm text-gray-900">{administrator.user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Correo electrónico</p>
                                <p className="text-sm text-gray-900">{administrator.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                                <p className="text-sm text-gray-900">{administrator.user?.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Datos Personales */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Datos Personales
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Nombre completo</p>
                                <p className="text-sm text-gray-900">
                                    {administrator.person?.name} {administrator.person?.last_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Tipo de documento</p>
                                <p className="text-sm text-gray-900">{administrator.person?.document_type}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Número de documento</p>
                                <p className="text-sm text-gray-900">{administrator.person?.document_number}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Fecha de nacimiento</p>
                                <p className="text-sm text-gray-900">
                                    {new Date(administrator.person?.born_date || "").toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Datos Laborales */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Datos Laborales
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Sede</p>
                                <p className="text-sm text-gray-900">{administrator.branch?.name || "No asignada"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Tipo de rol</p>
                                <p className="text-sm text-gray-900">
                                    {administrator.rol_type === "admin" ? "Administrador General" : "Administrador de Sede"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Estado</p>
                                <p className={`text-sm ${administrator.status === "active" ? "text-green-600" : "text-red-600"}`}>
                                    {administrator.status === "active" ? "Activo" : "Inactivo"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Fechas */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Información Adicional
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Fecha de creación</p>
                                <p className="text-sm text-gray-900">
                                    {new Date(administrator.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Última actualización</p>
                                <p className="text-sm text-gray-900">
                                    {new Date(administrator.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}