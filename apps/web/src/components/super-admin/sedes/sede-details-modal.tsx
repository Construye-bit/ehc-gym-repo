import React from "react";
import { useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { MapPin, Phone, Mail, Clock, Users, Building2, Wifi, Car, Waves, Wind, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SedeDetailsModalProps {
    branchId: Id<"branches"> | null;
    isOpen: boolean;
    onClose: () => void;
}

const STATUS_STYLES = {
    ACTIVE: "bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium",
    INACTIVE: "bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium",
    UNDER_CONSTRUCTION: "bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium",
    TEMPORARILY_CLOSED: "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium"
};

const STATUS_LABELS = {
    ACTIVE: "Activa",
    INACTIVE: "Inactiva",
    UNDER_CONSTRUCTION: "En Construcción",
    TEMPORARILY_CLOSED: "Cerrada Temporalmente"
};

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

export default function SedeDetailsModal({ branchId, isOpen, onClose }: SedeDetailsModalProps) {
    const branchDetails = useQuery(
        api.branches.queries.getById,
        isOpen && branchId ? { branchId } : "skip"
    );

    if (!isOpen || !branchId) return null;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (time: string) => {
        return time || "No definido";
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader className="border-b border-gray-200 pb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        Detalles de la Sede
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-6">
                    {branchDetails === undefined ? (
                        <LoadingSkeleton />
                    ) : !branchDetails ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No se encontraron detalles de la sede</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Header con info básica */}
                            <div className="flex items-start gap-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex-shrink-0">
                                    <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <Building2 size={32} className="text-yellow-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {branchDetails.name}
                                    </h3>
                                    <p className="text-gray-600 mt-1 font-medium flex items-center gap-2">
                                        <MapPin size={16} />
                                        {branchDetails.city?.name}, {branchDetails.city?.state_region}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3">
                                        {(() => {
                                            const status = branchDetails?.status;
                                            const statusStyle = (status && status in STATUS_STYLES)
                                                ? STATUS_STYLES[status as keyof typeof STATUS_STYLES]
                                                : "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium";
                                            const statusLabel = (status && status in STATUS_LABELS)
                                                ? STATUS_LABELS[status as keyof typeof STATUS_LABELS]
                                                : status || 'Desconocido';

                                            return (
                                                <span className={statusStyle}>
                                                    {statusLabel}
                                                </span>
                                            );
                                        })()}
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-gray-600" />
                                            <span className="text-sm text-gray-600">
                                                Capacidad: {branchDetails.max_capacity} personas
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Información de ubicación */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-gray-800 font-semibold">
                                            <MapPin size={20} className="text-blue-600" />
                                            Ubicación
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Dirección Principal</label>
                                            <p className="text-gray-800 font-medium mt-1">
                                                {branchDetails.address?.main_address || "No definida"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Ciudad</label>
                                            <p className="text-gray-800 font-medium mt-1">
                                                {branchDetails.city?.name || "No definida"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Departamento</label>
                                            <p className="text-gray-800 font-medium mt-1">
                                                {branchDetails.city?.state_region || "No definido"}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Información de contacto */}
                                <Card className="border border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-gray-800 font-semibold">
                                            <Phone size={20} className="text-green-600" />
                                            Información de Contacto
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Teléfono</label>
                                            <p className="text-gray-800 flex items-center gap-2 mt-1">
                                                <Phone size={16} className="text-green-600" />
                                                <span className="font-medium">{branchDetails.phone || "No registrado"}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Correo Electrónico</label>
                                            <p className="text-gray-800 flex items-center gap-2 mt-1">
                                                <Mail size={16} className="text-green-600" />
                                                <span className="font-medium">{branchDetails.email || "No registrado"}</span>
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Horarios y capacidad */}
                                <Card className="border border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-gray-800 font-semibold">
                                            <Clock size={20} className="text-purple-600" />
                                            Horarios y Capacidad
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Horario de Apertura</label>
                                            <p className="text-gray-800 font-medium mt-1">
                                                {formatTime(branchDetails.opening_time)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Horario de Cierre</label>
                                            <p className="text-gray-800 font-medium mt-1">
                                                {formatTime(branchDetails.closing_time)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Capacidad Máxima</label>
                                            <p className="text-gray-800 flex items-center gap-2 mt-1">
                                                <Users size={16} className="text-purple-600" />
                                                <span className="font-medium">{branchDetails.max_capacity} personas</span>
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Amenidades */}
                                <Card className="border border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-gray-800 font-semibold">
                                            <Sparkles size={20} className="text-orange-600" />
                                            Amenidades
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-3">
                                            {branchDetails.metadata?.has_parking && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Car size={16} className="text-blue-600" />
                                                    <span className="text-gray-700">Parqueadero</span>
                                                </div>
                                            )}
                                            {branchDetails.metadata?.has_pool && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Waves size={16} className="text-blue-600" />
                                                    <span className="text-gray-700">Piscina</span>
                                                </div>
                                            )}
                                            {branchDetails.metadata?.has_sauna && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Wind size={16} className="text-orange-600" />
                                                    <span className="text-gray-700">Sauna</span>
                                                </div>
                                            )}
                                            {branchDetails.metadata?.has_spa && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Sparkles size={16} className="text-purple-600" />
                                                    <span className="text-gray-700">Spa</span>
                                                </div>
                                            )}
                                            {branchDetails.metadata?.wifi_available && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Wifi size={16} className="text-green-600" />
                                                    <span className="text-gray-700">WiFi</span>
                                                </div>
                                            )}
                                        </div>
                                        {!branchDetails.metadata?.has_parking && 
                                         !branchDetails.metadata?.has_pool && 
                                         !branchDetails.metadata?.has_sauna && 
                                         !branchDetails.metadata?.has_spa && 
                                         !branchDetails.metadata?.wifi_available && (
                                            <p className="text-gray-600 text-sm font-medium">No hay amenidades registradas</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Información del sistema */}
                            <Card className="border border-gray-200 bg-white shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-gray-800 font-semibold">
                                        <Clock size={20} className="text-indigo-600" />
                                        Información del Sistema
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Fecha de Creación</label>
                                        <p className="text-gray-800 font-medium mt-1">
                                            {formatDate(branchDetails._creationTime)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">ID de la Sede</label>
                                        <p className="text-gray-700 font-mono text-sm mt-1 bg-gray-100 px-2 py-1 rounded">
                                            {branchDetails._id}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}