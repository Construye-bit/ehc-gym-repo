"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAction, useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";

interface ClientCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * ClientCreateModal
 * - Formulario completo para crear un nuevo cliente
 * - Crea el usuario en Clerk, persona, contacto de emergencia y vincula a la sede
 * - Envía credenciales por email
 */
export function ClientCreateModal({ open, onOpenChange, onSuccess }: ClientCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Query para obtener las sedes disponibles
  const branches = useQuery(api.branches.queries.getMyBranchesWithDetails);

  // Action para crear el cliente
  const createClient = useAction(api.clients.mutations.createClientComplete);

  // Estado del formulario
  const [form, setForm] = useState({
    // Datos personales
    personName: "",
    personLastName: "",
    personBornDate: "",
    personDocumentType: "CC" as "CC" | "TI" | "CE" | "PASSPORT",
    personDocumentNumber: "",
    personPhone: "",
    personEmail: "",
    // Contacto de emergencia
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    // Sede
    branchId: "" as Id<"branches"> | "",
  });

  useEffect(() => {
    if (!open) {
      // Resetear form cuando se cierre
      setForm({
        personName: "",
        personLastName: "",
        personBornDate: "",
        personDocumentType: "CC",
        personDocumentNumber: "",
        personPhone: "",
        personEmail: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelationship: "",
        branchId: "",
      });
    }
  }, [open]);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    // Validaciones de datos personales
    if (!form.personName.trim()) {
      toast.error("El nombre es requerido");
      return false;
    }

    if (!form.personLastName.trim()) {
      toast.error("El apellido es requerido");
      return false;
    }

    if (!form.personBornDate) {
      toast.error("La fecha de nacimiento es requerida");
      return false;
    }

    if (!form.personDocumentNumber.trim()) {
      toast.error("El número de documento es requerido");
      return false;
    }

    if (!form.personPhone.trim()) {
      toast.error("El teléfono es requerido");
      return false;
    }

    // Validación de email
    if (!form.personEmail.trim()) {
      toast.error("El email es requerido");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.personEmail)) {
      toast.error("El email no es válido");
      return false;
    }

    // Validaciones de contacto de emergencia
    if (!form.emergencyContactName.trim()) {
      toast.error("El nombre del contacto de emergencia es requerido");
      return false;
    }

    if (!form.emergencyContactPhone.trim()) {
      toast.error("El teléfono del contacto de emergencia es requerido");
      return false;
    }

    if (!form.emergencyContactRelationship.trim()) {
      toast.error("La relación del contacto de emergencia es requerida");
      return false;
    }

    // Validación de sede
    if (!form.branchId) {
      toast.error("Debes seleccionar una sede");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await createClient({
        personalData: {
          personName: form.personName.trim(),
          personLastName: form.personLastName.trim(),
          personBornDate: form.personBornDate,
          personDocumentType: form.personDocumentType,
          personDocumentNumber: form.personDocumentNumber.trim(),
          personPhone: form.personPhone.trim(),
          personEmail: form.personEmail.trim().toLowerCase(),
        },
        emergencyContact: {
          name: form.emergencyContactName.trim(),
          phone: form.emergencyContactPhone.trim(),
          relationship: form.emergencyContactRelationship.trim(),
        },
        branchId: form.branchId as Id<"branches">,
      });

      if (result.success) {
        toast.success(`¡Cliente creado exitosamente!`, {
          description: `${form.personName} ${form.personLastName} ha sido agregado al sistema. Se han enviado las credenciales por email.`,
        });

        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("Error al crear cliente:", error);
      toast.error(error.message || "Ocurrió un error inesperado al crear el cliente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nuevo cliente</DialogTitle>
          <DialogDescription>
            Completa todos los datos del cliente. Se creará su cuenta y recibirá sus credenciales por email.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Sección: Datos Personales */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Datos Personales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Nombre *</Label>
                <Input
                  value={form.personName}
                  onChange={(e) => handleChange("personName", e.target.value)}
                  className="mt-1"
                  placeholder="Juan"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Apellido *</Label>
                <Input
                  value={form.personLastName}
                  onChange={(e) => handleChange("personLastName", e.target.value)}
                  className="mt-1"
                  placeholder="Pérez"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Fecha de Nacimiento *</Label>
                <Input
                  type="date"
                  value={form.personBornDate}
                  onChange={(e) => handleChange("personBornDate", e.target.value)}
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Tipo de Documento *</Label>
                <Select
                  value={form.personDocumentType}
                  onValueChange={(value) => handleChange("personDocumentType", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Número de Documento *</Label>
                <Input
                  value={form.personDocumentNumber}
                  onChange={(e) => handleChange("personDocumentNumber", e.target.value)}
                  className="mt-1"
                  placeholder="1234567890"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Teléfono *</Label>
                <Input
                  value={form.personPhone}
                  onChange={(e) => handleChange("personPhone", e.target.value)}
                  className="mt-1"
                  placeholder="3001234567"
                  disabled={isLoading}
                />
              </div>

              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Email *</Label>
                <Input
                  type="email"
                  value={form.personEmail}
                  onChange={(e) => handleChange("personEmail", e.target.value)}
                  className="mt-1"
                  placeholder="cliente@ejemplo.com"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Sección: Contacto de Emergencia */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Contacto de Emergencia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Nombre Completo *</Label>
                <Input
                  value={form.emergencyContactName}
                  onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                  className="mt-1"
                  placeholder="María Pérez"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Teléfono *</Label>
                <Input
                  value={form.emergencyContactPhone}
                  onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                  className="mt-1"
                  placeholder="3009876543"
                  disabled={isLoading}
                />
              </div>

              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Relación *</Label>
                <Input
                  value={form.emergencyContactRelationship}
                  onChange={(e) => handleChange("emergencyContactRelationship", e.target.value)}
                  className="mt-1"
                  placeholder="Madre, Esposo/a, Hermano/a, etc."
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Sección: Sede */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Asignación de Sede</h3>
            <div>
              <Label className="text-xs text-gray-500">Sede *</Label>
              <Select
                value={form.branchId}
                onValueChange={(value) => handleChange("branchId", value)}
                disabled={isLoading || !branches || branches.length === 0}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona una sede" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((branch: any) => (
                    <SelectItem key={branch._id} value={branch._id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full justify-end">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creando..." : "Crear Cliente"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
