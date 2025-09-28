import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN PARA PERSONS =====

// Tipos válidos de documento
export const documentTypeSchema = z.enum(["CC", "TI", "CE", "PASSPORT"], {
    message: "El tipo de documento debe ser CC, TI, CE o PASSPORT",
});

// Esquema para crear una persona
export const createPersonSchema = z.object({
    user_id: z.string().min(1, "ID de usuario requerido"),
    name: z.string()
        .min(1, "El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "El nombre solo puede contener letras y espacios"),
    last_name: z.string()
        .min(1, "El apellido es requerido")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "El apellido solo puede contener letras y espacios"),
    phone: z.string()
        .min(1, "El teléfono es requerido")
        .regex(/^[0-9\s\-\+\(\)]{10,15}$/, "El número de teléfono no es válido (10-15 dígitos)"),
    born_date: z.string()
        .min(1, "La fecha de nacimiento es requerida")
        .refine((date) => {
            const birthDate = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            return !isNaN(birthDate.getTime()) && age >= 16 && age <= 120;
        }, "La edad debe estar entre 16 y 120 años"),
    document_type: documentTypeSchema,
    document_number: z.string()
        .min(1, "El número de documento es requerido")
        .min(6, "El número de documento debe tener al menos 6 caracteres")
        .max(20, "El número de documento no puede exceder 20 caracteres")
        .regex(/^[a-zA-Z0-9]+$/, "El número de documento solo puede contener letras y números"),
});

// Esquema para actualizar una persona
export const updatePersonSchema = z.object({
    personId: z.string().min(1, "ID de persona requerido"),
    name: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "El nombre solo puede contener letras y espacios")
        .optional(),
    last_name: z.string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "El apellido solo puede contener letras y espacios")
        .optional(),
    phone: z.string()
        .regex(/^[0-9\s\-\+\(\)]{10,15}$/, "El número de teléfono no es válido (10-15 dígitos)")
        .optional(),
    born_date: z.string()
        .refine((date) => {
            const birthDate = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            return !isNaN(birthDate.getTime()) && age >= 16 && age <= 120;
        }, "La edad debe estar entre 16 y 120 años")
        .optional(),
    document_type: documentTypeSchema.optional(),
    document_number: z.string()
        .min(6, "El número de documento debe tener al menos 6 caracteres")
        .max(20, "El número de documento no puede exceder 20 caracteres")
        .regex(/^[a-zA-Z0-9]+$/, "El número de documento solo puede contener letras y números")
        .optional(),
    active: z.boolean().optional(),
});

// Esquema para eliminar/desactivar una persona
export const deletePersonSchema = z.object({
    personId: z.string().min(1, "ID de persona requerido"),
});

// Esquema para buscar persona por documento
export const findPersonByDocumentSchema = z.object({
    document_number: z.string()
        .min(1, "El número de documento es requerido")
        .min(6, "El número de documento debe tener al menos 6 caracteres")
        .max(20, "El número de documento no puede exceder 20 caracteres"),
});

// ===== FUNCIÓN AUXILIAR PARA VALIDACIÓN =====
export function validateWithZod<T>(schema: z.ZodSchema<T>, data: unknown, context: string): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(issue =>
                `${issue.path.join('.')}: ${issue.message}`
            ).join(', ');
            throw new Error(`Validación fallida en ${context}: ${errorMessages}`);
        }
        throw new Error(`Error de validación en ${context}: ${error}`);
    }
}

// ===== TIPOS DERIVADOS DE LOS ESQUEMAS =====
export type DocumentType = z.infer<typeof documentTypeSchema>;
export type CreatePersonData = z.infer<typeof createPersonSchema>;
export type UpdatePersonData = z.infer<typeof updatePersonSchema>;
export type DeletePersonData = z.infer<typeof deletePersonSchema>;
export type FindPersonByDocumentData = z.infer<typeof findPersonByDocumentSchema>;