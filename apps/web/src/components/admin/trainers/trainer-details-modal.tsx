import React from "react";
import { useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { User, MapPin, Phone, Mail, Calendar, Badge, Clock, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_STYLES, STATUS_LABELS, DOCUMENT_TYPE_LABELS } from "@/lib/trainer-constants";

interface RoleAssignment {
    _id: string;
    role: string;
}

interface TrainerDetailsModalProps {
    trainerId: Id<"trainers"> | null;
    isOpen: boolean;
    onClose: () => void;
}

const renderStatusBadge = (status: string | undefined) => {
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

export default function TrainerDetailsModal({ trainerId, isOpen, onClose }: TrainerDetailsModalProps) {
    // Solo ejecutar la query cuando el modal está abierto y hay un trainerId
    // Usar la query para admins que valida permisos
    const trainerDetails = useQuery(
        api.trainers.queries.getTrainerDetailsForAdmin,
        isOpen && trainerId ? { trainerId } : "skip"
    );

    if (!isOpen || !trainerId) return null;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateAge = (bornDate: string) => {
        const birth = new Date(bornDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader className="border-b border-gray-200 pb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        Detalles del Entrenador
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-6">
                    {trainerDetails === undefined ? (
                        <LoadingSkeleton />
                    ) : !trainerDetails ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No se encontraron detalles del entrenador</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Header con foto y info básica */}
                            <div className="flex items-start gap-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex-shrink-0">
                                    <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User size={32} className="text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {trainerDetails.person?.name} {trainerDetails.person?.last_name}
                                    </h3>
                                    <p className="text-gray-600 mt-1 font-medium">
                                        Código: {trainerDetails.employee_code}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3">
                                        {renderStatusBadge(trainerDetails?.status)}
                                        {trainerDetails.specialties.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Badge size={16} className="text-gray-600" />
                                                <span className="text-sm text-gray-600">
                                                    {trainerDetails.specialties.length} especialidad{trainerDetails.specialties.length !== 1 ? 'es' : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Información personal */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-gray-800 font-semibold">
                                            <User size={20} className="text-blue-600" />
                                            Información Personal
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Nombre Completo</label>
                                            <p className="text-gray-800 font-medium mt-1">
                                                {trainerDetails.person?.name} {trainerDetails.person?.last_name}
                                            </p>
                                        </div>
                                        {trainerDetails.person?.born_date && (
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Fecha de Nacimiento</label>
                                                <p className="text-gray-800 font-medium mt-1">
                                                    {trainerDetails.person.born_date}
                                                    <span className="text-gray-600 ml-2">
                                                        ({calculateAge(trainerDetails.person.born_date)} años)
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Documento</label>
                                            <p className="text-gray-800 font-medium mt-1">
                                                {(() => {
                                                    const documentType = trainerDetails.person?.document_type;
                                                    if (documentType && typeof documentType === 'string' && documentType in DOCUMENT_TYPE_LABELS) {
                                                        return DOCUMENT_TYPE_LABELS[documentType as keyof typeof DOCUMENT_TYPE_LABELS];
                                                    }
                                                    return documentType || 'Desconocido';
                                                })()}
                                                <br />
                                                <span className="font-mono text-gray-700">{trainerDetails.person?.document_number}</span>
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
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Correo Electrónico</label>
                                            <p className="text-gray-800 flex items-center gap-2 mt-1">
                                                <Mail size={16} className="text-green-600" />
                                                {trainerDetails.user?.email || "No registrado"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Teléfono</label>
                                            <p className="text-gray-800 flex items-center gap-2 mt-1">
                                                <Phone size={16} className="text-green-600" />
                                                {trainerDetails.person?.phone || "No registrado"}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Información laboral */}
                                <Card className="border border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-gray-800 font-semibold">
                                            <MapPin size={20} className="text-purple-600" />
                                            Información Laboral
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Sede Asignada</label>
                                            <p className="text-gray-800 font-medium mt-1">
                                                {trainerDetails.branch?.name || "No asignada"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Fecha de Contratación</label>
                                            <p className="text-gray-800 flex items-center gap-2 mt-1">
                                                <Calendar size={16} className="text-purple-600" />
                                                <span className="font-medium">{formatDate(trainerDetails.hire_date)}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Estado</label>
                                            <div className="mt-1">
                                                {renderStatusBadge(trainerDetails?.status)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Especialidades y roles */}
                                <Card className="border border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-gray-800 font-semibold">
                                            <Badge size={20} className="text-orange-600" />
                                            Especialidades y Roles
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Especialidades</label>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {trainerDetails.specialties.length > 0 ? (
                                                    trainerDetails.specialties.map((specialty: string, index: number) => (
                                                        <span
                                                            key={index}
                                                            className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-300"
                                                        >
                                                            {specialty}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-600 text-sm font-medium">No hay especialidades registradas</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Roles del Sistema</label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {trainerDetails.roles.length > 0 ? (
                                                    trainerDetails.roles.map((roleAssignment: RoleAssignment) => (
                                                        <span
                                                            key={roleAssignment._id}
                                                            className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-300"
                                                        >
                                                            {roleAssignment.role}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-600 text-sm font-medium">No hay roles asignados</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Información del sistema */}
                            {trainerDetails.person && (
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
                                                {formatDate(trainerDetails.person.created_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Última Actualización</label>
                                            <p className="text-gray-800 font-medium mt-1">
                                                {formatDate(trainerDetails.person.updated_at)}
                                            </p>
                                        </div>
                                        {trainerDetails.user && (
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">ID de Usuario (Clerk)</label>
                                                <p className="text-gray-700 font-mono text-sm mt-1 bg-gray-100 px-2 py-1 rounded">
                                                    {trainerDetails.user.clerk_id}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};