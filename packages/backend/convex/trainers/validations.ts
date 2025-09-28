import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN PARA TRAINERS =====

// Esquema para datos de usuario
export const userDataSchema = z.object({
    userName: z.string()
        .min(1, "El nombre de usuario es requerido")
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(50, "El nombre de usuario no puede exceder 50 caracteres")
        .regex(/^[a-zA-Z0-9_]+$/, "El nombre de usuario solo puede contener letras, números y guiones bajos"),
    userEmail: z.string()
        .min(1, "El correo electrónico es requerido")
        .regex(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "El correo electrónico no es válido"
        )
        .max(100, "El correo electrónico no puede exceder 100 caracteres"),
    userPhone: z.string()
        .refine(
            (val) => !val || val === "" || /^[0-9\s\-\+\(\)]{10,15}$/.test(val),
            "El número de teléfono no es válido (10-15 dígitos)"
        )
        .optional(),
});

// Esquema para datos personales
export const personalDataSchema = z.object({
    personName: z.string()
        .min(1, "El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "El nombre solo puede contener letras y espacios"),
    personLastName: z.string()
        .min(1, "El apellido es requerido")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "El apellido solo puede contener letras y espacios"),
    personBornDate: z.string()
        .min(1, "La fecha de nacimiento es requerida")
        .refine((date) => {
            const birthDate = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            return !isNaN(birthDate.getTime()) && age >= 16 && age <= 80;
        }, "La edad debe estar entre 16 y 80 años"),
    personDocumentType: z.enum(["CC", "TI", "CE", "PASSPORT"], {
        message: "El tipo de documento debe ser CC, TI, CE o PASSPORT",
    }),
    personDocumentNumber: z.string()
        .min(1, "El número de documento es requerido")
        .min(6, "El número de documento debe tener al menos 6 caracteres")
        .max(20, "El número de documento no puede exceder 20 caracteres")
        .regex(/^[a-zA-Z0-9]+$/, "El número de documento solo puede contener letras y números"),
});

// Esquema para datos laborales
export const workDataSchema = z.object({
    branch: z.string()
        .min(1, "La sede es requerida")
        .max(100, "El nombre de la sede no puede exceder 100 caracteres"),
    specialties: z.array(z.string()
        .min(1, "Las especialidades no pueden estar vacías")
        .max(50, "Cada especialidad no puede exceder 50 caracteres"))
        .max(10, "No se pueden agregar más de 10 especialidades")
        .default([]),
});

// ===== ESQUEMAS DE VALIDACIÓN PARA BASE DE DATOS =====

// Esquema para validar datos de creación de usuario en DB
export const createUserSchema = z.object({
    clerk_id: z.string().min(1, "clerk_id es requerido"),
    name: z.string()
        .min(1, "El nombre es requerido")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    email: z.string()
        .regex(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "El correo electrónico no es válido"
        )
        .max(100, "El correo electrónico no puede exceder 100 caracteres"),
});

// Esquema para validar datos de creación de persona en DB
export const createPersonSchema = z.object({
    user_id: z.string().min(1, "user_id es requerido"),
    name: z.string()
        .min(1, "El nombre es requerido")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "El nombre solo puede contener letras y espacios"),
    last_name: z.string()
        .min(1, "El apellido es requerido")
        .max(50, "El apellido no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "El apellido solo puede contener letras y espacios"),
    born_date: z.string().min(1, "La fecha de nacimiento es requerida"),
    document_type: z.enum(["CC", "TI", "CE", "PASSPORT"]),
    document_number: z.string()
        .min(6, "El número de documento debe tener al menos 6 caracteres")
        .max(20, "El número de documento no puede exceder 20 caracteres")
        .regex(/^[a-zA-Z0-9]+$/, "El número de documento solo puede contener letras y números"),
    phone: z.string()
        .refine(
            (val) => !val || val === "" || /^[0-9\s\-\+\(\)]{10,15}$/.test(val),
            "El número de teléfono no es válido"
        )
        .optional(),
});

// Esquema para validar datos de creación de trainer en DB
export const createTrainerSchema = z.object({
    person_id: z.string().min(1, "person_id es requerido"),
    user_id: z.string().min(1, "user_id es requerido"),
    branch_id: z.string().min(1, "branch_id es requerido"),
    employee_code: z.string()
        .min(1, "El código de empleado es requerido")
        .regex(/^TR\d{4}$/, "El código de empleado debe tener el formato TR####"),
    specialties: z.array(z.string()).max(10, "No se pueden agregar más de 10 especialidades"),
});

// ===== ESQUEMAS DE VALIDACIÓN PARA ROLES Y PERMISOS =====

// Esquema para validar roles
export const roleSchema = z.enum(["SUPER_ADMIN", "ADMIN", "TRAINER", "USER"], {
    message: "El rol debe ser SUPER_ADMIN, ADMIN, TRAINER o USER",
});

// Esquema para validar contexto de usuario (sin _id por compatibilidad con Convex)
export const userContextSchema = z.object({
    _id: z.any(), // Se mantiene como any para compatibilidad con Id<"users">
    clerk_id: z.string().min(1, "clerk_id requerido"),
    name: z.string().min(1, "Nombre de usuario requerido"),
    email: z.string().email("Email válido requerido"),
    active: z.boolean(),
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
export type UserData = z.infer<typeof userDataSchema>;
export type PersonalData = z.infer<typeof personalDataSchema>;
export type WorkData = z.infer<typeof workDataSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type CreatePersonData = z.infer<typeof createPersonSchema>;
export type CreateTrainerData = z.infer<typeof createTrainerSchema>;
export type ValidRole = z.infer<typeof roleSchema>;
export type UserContext = z.infer<typeof userContextSchema>;
