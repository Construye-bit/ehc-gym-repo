import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import { toast } from "sonner";
import type { ClientFormData, FormErrors } from "@/lib/clients-types";
import { z } from "zod";
import { clientSchema } from "@/lib/validations/clients";

export function useClientForm(initialData?: Partial<ClientFormData>) {
  const [formData, setFormData] = useState<ClientFormData>({
    personName: initialData?.personName || "",
    personLastName: initialData?.personLastName || "",
    personDocumentType: initialData?.personDocumentType || "CC",
    personDocumentNumber: initialData?.personDocumentNumber || "",
    personPhone: initialData?.personPhone || "",
    email: initialData?.email || "",
    status: initialData?.status || "ACTIVE",
    isPaymentActive: initialData?.isPaymentActive || true,
    joinDate: initialData?.joinDate || new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const createClient = useMutation(api.clients.mutations.createClient);
  const updateClient = useMutation(api.clients.mutations.updateClient);

  const validateForm = () => {
    try {
      clientSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          newErrors[path as keyof ClientFormData] = issue.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija los errores del formulario");
      return;
    }

    setIsLoading(true);
    try {
      // Implementar lógica de creación/actualización
      toast.success("Cliente guardado exitosamente");
    } catch (error) {
      toast.error("Error al guardar el cliente");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    setFormData,
    handleSubmit,
  };
}