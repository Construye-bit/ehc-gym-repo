import React from "react";
import { useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { User, MapPin, Phone, Mail, Calendar, Clock, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdministratorDetailsModalProps {
    administratorId: Id<"admins">;
    open: boolean;
    onClose: () => void;
}

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

export default function AdministratorDetailsModal({
    administratorId,
    open,
    onClose
}: AdministratorDetailsModalProps) {
    const administrator = useQuery(api.admins.queries.getById, { administratorId });

    const formatDate = (timestamp: number | string) => {
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
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader className="border-b border-gray-200 pb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        Detalles del Administrador
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-6">
                    {!administrator ? (
                        <LoadingSkeleton />
                    ) : (
                        <div className="space-y-6">
                            {/* Header con foto y info básica */}
                            <div className="flex items-start gap-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex-shrink-0">
                                    <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center">
                                        <User size={32} className="text-purple-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {administrator.person?.name} {administrator.person?.last_name}
                                    </h3>
                                    <p className="text-gray-600 mt-1 font-medium">
                                        {administrator.user?.email}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            administrator.status === "active" 
                                                ? "bg-green-100 text-green-800" 
                                                : "bg-red-100 text-red-800"
                                        }`}>
                                            {administrator.status === "active" ? "Activo" : "Inactivo"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Grid de información */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Información Personal */}
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
                                                {administrator.person?.name} {administrator.person?.last_name || "N/A"}
                                            </p>
                                        </div>
                                        {administrator.person?.born_date && (
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Fecha de Nacimiento</label>
                                                <p className="text-gray-800 font-medium mt-1">
                                                    {new Date(administrator.person.born_date).toLocaleDateString('es-ES')}
                                                    <span className="text-gray-600 ml-2">
                                                        ({calculateAge(administrator.person.born_date)} años)
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Documento</label>
                                            <p className="text-gray-800 font-medium mt-1">
                                                {administrator.person?.document_type || "N/A"}
                                                <br />
                                                <span className="font-mono text-gray-700">{administrator.person?.document_number || "N/A"}</span>
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Información de Contacto */}
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
                                                {administrator.user?.email || "No registrado"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Teléfono</label>
                                            <p className="text-gray-800 flex items-center gap-2 mt-1">
                                                <Phone size={16} className="text-green-600" />
                                                {administrator.person?.phone || "No registrado"}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Información Laboral */}
                                <Card className="border border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-gray-800 font-semibold">
                                            <Building2 size={20} className="text-purple-600" />
                                            Información Laboral
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Sede Asignada</label>
                                            <p className="text-gray-800 font-medium mt-1 flex items-center gap-2">
                                                <MapPin size={16} className="text-purple-600" />
                                                {administrator.branch?.name || "No asignada"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Estado</label>
                                            <div className="mt-1">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    administrator.status === "active" 
                                                        ? "bg-green-100 text-green-800" 
                                                        : "bg-red-100 text-red-800"
                                                }`}>
                                                    {administrator.status === "active" ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Información del Sistema */}
                                <Card className="border border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-gray-800 font-semibold">
                                            <Clock size={20} className="text-indigo-600" />
                                            Información del Sistema
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Fecha de Creación</label>
                                            <p className="text-gray-800 font-medium mt-1 flex items-center gap-2">
                                                <Calendar size={16} className="text-indigo-600" />
                                                {administrator.created_at
                                                    ? formatDate(administrator.created_at)
                                                    : "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Última Actualización</label>
                                            <p className="text-gray-800 font-medium mt-1 flex items-center gap-2">
                                                <Calendar size={16} className="text-indigo-600" />
                                                {administrator.updated_at
                                                    ? formatDate(administrator.updated_at)
                                                    : "N/A"}
                                            </p>
                                        </div>
                                        {administrator.user && (
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Nombre de Usuario</label>
                                                <p className="text-gray-800 font-medium mt-1">
                                                    {administrator.user.name}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}