"use client";

import React, { useState, useEffect } from "react";
import { User, CreditCard, Heart, Save, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { useAction } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { toast } from "sonner";

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
 * - Componente para editar un cliente existente con formato de pasos
 * - Maneja formulario controlado con validaciones
 */
export function ClientEditModal({
  open,
  onOpenChange,
  client,
}: ClientEditModalProps) {
  const updateClientComplete = useAction(api.clients.mutations.updateClientComplete);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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
      setCurrentStep(1); // Reset step when opening
    }
  }, [client, open]);

  const handleChange = (field: keyof FormData, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
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
    } else if (step === 2) {
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
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!client) return;

    // Validar todos los pasos
    for (let step = 1; step <= 2; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormSection
            icon={<User size={20} />}
            title="Datos Personales"
            description="Información personal del cliente"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Nombre" required>
                <Input
                  className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                  placeholder="Juan"
                  value={form.personName}
                  onChange={(e) => handleChange("personName", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Apellido" required>
                <Input
                  className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                  placeholder="Pérez"
                  value={form.personLastName}
                  onChange={(e) => handleChange("personLastName", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Tipo de Documento" required>
                <Select
                  value={form.personDocumentType}
                  onValueChange={(value) => handleChange("personDocumentType", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400">
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
              </FormField>

              <FormField label="Número de Documento" required>
                <Input
                  className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                  placeholder="12345678"
                  value={form.personDocumentNumber}
                  onChange={(e) => handleChange("personDocumentNumber", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Teléfono" required>
                <Input
                  className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                  placeholder="300 123 4567"
                  value={form.personPhone}
                  onChange={(e) => handleChange("personPhone", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Fecha de Nacimiento" required>
                <Input
                  type="date"
                  className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400"
                  value={form.personBornDate}
                  onChange={(e) => handleChange("personBornDate", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          </FormSection>
        );

      case 2:
        return (
          <FormSection
            icon={<Heart size={20} />}
            title="Contacto de Emergencia"
            description="Información del contacto en caso de emergencia"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Nombre del Contacto" required>
                <Input
                  className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                  placeholder="María Pérez"
                  value={form.emergencyContactName}
                  onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Teléfono del Contacto" required>
                <Input
                  className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                  placeholder="300 123 4567"
                  value={form.emergencyContactPhone}
                  onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Relación" required>
                <Input
                  className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                  placeholder="Ej: Padre, Madre, Hermano/a..."
                  value={form.emergencyContactRelationship}
                  onChange={(e) => handleChange("emergencyContactRelationship", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          </FormSection>
        );

      case 3:
        return (
          <FormSection
            icon={<CreditCard size={20} />}
            title="Estado del Cliente"
            description="Configuración del estado y membresía"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Estado" required>
                <Select
                  value={form.clientStatus}
                  onValueChange={(value: "ACTIVE" | "INACTIVE") => handleChange("clientStatus", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Pago activo">
                <div className="flex items-center gap-3 h-10">
                  <input
                    type="checkbox"
                    id="is_payment_active"
                    checked={form.isPaymentActive}
                    onChange={(e) => handleChange("isPaymentActive", e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="is_payment_active" className="text-sm text-gray-700 cursor-pointer">
                    El cliente tiene el pago activo
                  </label>
                </div>
              </FormField>
            </div>
          </FormSection>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-yellow-50">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Editar Cliente
          </DialogTitle>
          <p className="text-gray-600 mt-1">
            Paso {currentStep} de {totalSteps}: {
              currentStep === 1 ? 'Datos Personales' :
                currentStep === 2 ? 'Contacto de Emergencia' : 'Estado del Cliente'
            }
          </p>
        </DialogHeader>

        <div className="mt-6">
          {/* Progress Steps */}
          <div className="mb-6">
            <ProgressSteps currentStep={currentStep} totalSteps={totalSteps} />
          </div>

          {/* Form Content */}
          <div className="mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrev}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 border-yellow-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-900 transition-colors"
                    >
                      <ArrowLeft size={16} />
                      Anterior
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                    className="border-yellow-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-900 transition-colors"
                  >
                    Cancelar
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600"
                    >
                      Siguiente
                      <ArrowRight size={16} />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 disabled:bg-gray-400 disabled:border-gray-400"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Actualizar Cliente
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
