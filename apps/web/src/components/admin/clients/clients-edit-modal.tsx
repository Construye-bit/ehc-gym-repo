"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAction } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  } | null;
}

interface ClientEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

interface FormData {
  personName: string;
  personLastName: string;
  personBornDate: string;
  personDocumentType: string;
  personDocumentNumber: string;
  personPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  clientStatus: "ACTIVE" | "INACTIVE";
  isPaymentActive: boolean;
}

const DOCUMENT_TYPES = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "TI", label: "Tarjeta de Identidad" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "PASSPORT", label: "Pasaporte" },
];

/**
 * ClientEditModal
 * - Componente para editar un cliente existente
 * - Maneja formulario controlado con validaciones
 */
export function ClientEditModal({
  open,
  onOpenChange,
  client,
}: ClientEditModalProps) {
  const updateClientComplete = useAction(api.clients.mutations.updateClientComplete);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FormData>({
    personName: "",
    personLastName: "",
    personBornDate: "",
    personDocumentType: "CC",
    personDocumentNumber: "",
    personPhone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    clientStatus: "ACTIVE",
    isPaymentActive: false,
  });

  // Inicializar formulario con datos del cliente
  useEffect(() => {
    if (client && client.person) {
      setForm({
        personName: client.person.name || "",
        personLastName: client.person.last_name || "",
        personBornDate: client.person.born_date || "",
        personDocumentType: client.person.document_type || "CC",
        personDocumentNumber: client.person.document_number || "",
        personPhone: client.person.phone || "",
        emergencyContactName: client.emergency_contact?.name || "",
        emergencyContactPhone: client.emergency_contact?.phone || "",
        emergencyContactRelationship: client.emergency_contact?.relationship || "",
        clientStatus: client.status || "ACTIVE",
        isPaymentActive: client.is_payment_active || false,
      });
    }
  }, [client]);

  const handleChange = (field: keyof FormData, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const validateForm = (): boolean => {
    if (!form.personName?.trim()) {
      toast.error("El nombre es requerido");
      return false;
    }
    if (!form.personLastName?.trim()) {
      toast.error("El apellido es requerido");
      return false;
    }
    if (!form.personDocumentNumber?.trim()) {
      toast.error("El número de documento es requerido");
      return false;
    }
    if (!form.personPhone?.trim()) {
      toast.error("El teléfono es requerido");
      return false;
    }
    if (!form.personBornDate?.trim()) {
      toast.error("La fecha de nacimiento es requerida");
      return false;
    }
    if (!form.emergencyContactName?.trim()) {
      toast.error("El nombre del contacto de emergencia es requerido");
      return false;
    }
    if (!form.emergencyContactPhone?.trim()) {
      toast.error("El teléfono del contacto de emergencia es requerido");
      return false;
    }
    if (!form.emergencyContactRelationship?.trim()) {
      toast.error("La relación del contacto de emergencia es requerida");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!client) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateClientComplete({
        clientId: client._id,
        personalData: {
          personName: form.personName.trim(),
          personLastName: form.personLastName.trim(),
          personBornDate: form.personBornDate,
          personDocumentType: form.personDocumentType,
          personDocumentNumber: form.personDocumentNumber.trim(),
          personPhone: form.personPhone.trim(),
        },
        emergencyContact: {
          name: form.emergencyContactName.trim(),
          phone: form.emergencyContactPhone.trim(),
          relationship: form.emergencyContactRelationship.trim(),
        },
        clientStatus: form.clientStatus,
        isPaymentActive: form.isPaymentActive,
      });

      if (result.success) {
        toast.success(result.message, {
          duration: 4000,
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error al actualizar cliente:', error);

      let errorMessage = 'Error al actualizar el cliente';
      if (error instanceof Error) {
        if (error.message.includes('No autenticado')) {
          errorMessage = 'No tienes permisos para realizar esta acción';
        } else if (error.message.includes('No tienes permisos')) {
          errorMessage = 'No tienes permisos para editar este cliente';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Actualiza la información del cliente
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Datos Personales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Datos Personales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Nombre *</Label>
                <Input
                  value={form.personName}
                  onChange={(e) => handleChange("personName", e.target.value)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Apellido *</Label>
                <Input
                  value={form.personLastName}
                  onChange={(e) => handleChange("personLastName", e.target.value)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Tipo de Documento *</Label>
                <Select
                  value={form.personDocumentType}
                  onValueChange={(value) => handleChange("personDocumentType", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Número de Documento *</Label>
                <Input
                  value={form.personDocumentNumber}
                  onChange={(e) => handleChange("personDocumentNumber", e.target.value)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Teléfono *</Label>
                <Input
                  value={form.personPhone}
                  onChange={(e) => handleChange("personPhone", e.target.value)}
                  className="mt-1"
                  placeholder="300 123 4567"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Fecha de Nacimiento *</Label>
                <Input
                  type="date"
                  value={form.personBornDate}
                  onChange={(e) => handleChange("personBornDate", e.target.value)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Contacto de Emergencia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Nombre del Contacto *</Label>
                <Input
                  value={form.emergencyContactName}
                  onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Teléfono del Contacto *</Label>
                <Input
                  value={form.emergencyContactPhone}
                  onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                  className="mt-1"
                  placeholder="300 123 4567"
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Relación *</Label>
                <Input
                  value={form.emergencyContactRelationship}
                  onChange={(e) => handleChange("emergencyContactRelationship", e.target.value)}
                  className="mt-1"
                  placeholder="Ej: Padre, Madre, Hermano/a..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Estado del Cliente */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Estado del Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Estado *</Label>
                <Select
                  value={form.clientStatus}
                  onValueChange={(value: "ACTIVE" | "INACTIVE") => handleChange("clientStatus", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="is_payment_active"
                  checked={form.isPaymentActive}
                  onChange={(e) => handleChange("isPaymentActive", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={isSubmitting}
                />
                <Label htmlFor="is_payment_active" className="text-sm text-gray-700 cursor-pointer">
                  Pago activo
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <div className="flex gap-2 w-full justify-end">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
