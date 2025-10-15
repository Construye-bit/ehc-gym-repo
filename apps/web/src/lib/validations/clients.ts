import { z } from "zod";

export const clientSchema = z.object({
    personName: z.string().trim().min(1, "El nombre es requerido"),
    personLastName: z.string().trim().min(1, "El apellido es requerido"),
    personDocumentType: z.enum(["CC", "TI", "CE", "PASSPORT"], {
        message: "El tipo de documento es requerido",
    }),
    personDocumentNumber: z.string().trim().min(1, "El número de documento es requerido"),
    personPhone: z.string().trim().min(1, "El teléfono es requerido"),
    email: z.string().trim().email("El correo electrónico no es válido"),
    status: z.enum(["ACTIVE", "INACTIVE"], {
        message: "El estado es requerido",
    }),
    isPaymentActive: z.boolean(),
    joinDate: z.string().min(1, "La fecha de ingreso es requerida"),
    endDate: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
