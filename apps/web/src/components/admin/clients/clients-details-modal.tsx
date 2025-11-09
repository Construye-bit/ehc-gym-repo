"use client";

import React from "react";
import { User, MapPin, Phone, Mail, Calendar, Building2, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";

interface Client {
  _id: Id<"clients">;
  status: 'ACTIVE' | 'INACTIVE';
  is_payment_active: boolean;
  join_date: number;
  person?: {
    name: string;
    last_name: string;
    document_type: string;
    document_number: string;
    phone?: string;
    born_date: string;
  } | null;
  user?: {
    email: string;
  } | null;
  branches: Array<{
    _id: Id<"branches">;
    name: string;
  }>;
}

interface ClientDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
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

/**
 * ClientDetailModal
 * - Componente stateless que muestra los datos del cliente recibidos por props
 */
export function ClientDetailModal({
  open,
  onOpenChange,
  client,
}: ClientDetailModalProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Detalle del Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {!client ? (
            <LoadingSkeleton />
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
                    {client.person ? `${client.person.name} ${client.person.last_name}` : "Sin nombre"}
                  </h3>
                  <p className="text-gray-600 mt-1 font-medium">
                    {client.user?.email || "Sin correo"}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      client.status === "ACTIVE" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {client.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </span>
                    {client.branches.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-600">
                          {client.branches.length} sede{client.branches.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
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
                        {client.person ? `${client.person.name} ${client.person.last_name}` : "N/A"}
                      </p>
                    </div>
                    {client.person?.born_date && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Fecha de Nacimiento</label>
                        <p className="text-gray-800 font-medium mt-1">
                          {new Date(client.person.born_date).toLocaleDateString('es-ES')}
                          <span className="text-gray-600 ml-2">
                            ({calculateAge(client.person.born_date)} años)
                          </span>
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Documento</label>
                      <p className="text-gray-800 font-medium mt-1">
                        {client.person?.document_type || "N/A"}
                        <br />
                        <span className="font-mono text-gray-700">{client.person?.document_number || "N/A"}</span>
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
                        {client.user?.email || "No registrado"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Teléfono</label>
                      <p className="text-gray-800 flex items-center gap-2 mt-1">
                        <Phone size={16} className="text-green-600" />
                        {client.person?.phone || "No registrado"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Información de Membresía */}
                <Card className="border border-gray-200 bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-800 font-semibold">
                      <CreditCard size={20} className="text-purple-600" />
                      Información de Membresía
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Fecha de Ingreso</label>
                      <p className="text-gray-800 flex items-center gap-2 mt-1">
                        <Calendar size={16} className="text-purple-600" />
                        <span className="font-medium">{formatDate(client.join_date)}</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pago Activo</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          client.is_payment_active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {client.is_payment_active ? "Sí" : "No"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Estado</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          client.status === "ACTIVE" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {client.status === "ACTIVE" ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sedes Asignadas */}
                <Card className="border border-gray-200 bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-800 font-semibold">
                      <Building2 size={20} className="text-orange-600" />
                      Sedes Asignadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Sede(s)</label>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {client.branches.length > 0 ? (
                          client.branches.map((branch) => (
                            <span
                              key={branch._id}
                              className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-300"
                            >
                              {branch.name}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-600 text-sm font-medium">No hay sedes asignadas</p>
                        )}
                      </div>
                    </div>
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
