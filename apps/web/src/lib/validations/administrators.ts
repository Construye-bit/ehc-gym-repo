import { z } from "zod";

// Esquema de datos de usuario
export const userDataSchema = z.object({
    userName: z.string().trim().min(1, "El nombre de usuario es requerido"),
    userEmail: z.string().trim().email("El correo electrónico no es válido"),
    userPhone: z.string().trim().min(1, "El número de teléfono es requerido"),
});

// Esquema de datos personales
export const personalDataSchema = z.object({
    personName: z.string().trim().min(1, "El nombre es requerido"),
    personLastName: z.string().trim().min(1, "El apellido es requerido"),
    personBornDate: z.string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe estar en formato YYYY-MM-DD")
        .refine((date) => !isNaN(Date.parse(date)), "La fecha no es válida"),
    personDocumentType: z.string().trim().min(1, "El tipo de documento es requerido"),
    personDocumentNumber: z.string().trim().min(1, "El número de documento es requerido"),
});

// Esquema de datos laborales
export const workDataSchema = z.object({
    branch: z.string().trim().min(1, "La sede es requerida"),
});

// Tipos de datos
export type UserData = z.infer<typeof userDataSchema>;
export type PersonalData = z.infer<typeof personalDataSchema>;
export type WorkData = z.infer<typeof workDataSchema>;