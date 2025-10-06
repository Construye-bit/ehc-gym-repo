import { z } from "zod";

// Esquema de datos de usuario
export const userDataSchema = z.object({
    userName: z.string().min(1, "El nombre de usuario es requerido"),
    userEmail: z.string().email("El correo electrónico no es válido"),
    userPhone: z.string().min(1, "El número de teléfono es requerido"),
});

// Esquema de datos personales
export const personalDataSchema = z.object({
    personName: z.string().min(1, "El nombre es requerido"),
    personLastName: z.string().min(1, "El apellido es requerido"),
    personBornDate: z.string().min(1, "La fecha de nacimiento es requerida"),
    personDocumentType: z.string().min(1, "El tipo de documento es requerido"),
    personDocumentNumber: z.string().min(1, "El número de documento es requerido"),
});

// Esquema de datos laborales
export const workDataSchema = z.object({
    branch: z.string().min(1, "La sede es requerida"),
    rolType: z.string().min(1, "El tipo de rol es requerido"),
});

// Tipos de datos
export type UserData = z.infer<typeof userDataSchema>;
export type PersonalData = z.infer<typeof personalDataSchema>;
export type WorkData = z.infer<typeof workDataSchema>;