import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN PARA TRAINERS (FRONTEND) =====

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
            (val) => val === "" || /^[0-9\s\-\+\(\)]{10,15}$/.test(val),
            "El número de teléfono no es válido (10-15 dígitos)"
        ),
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
        message: "El tipo de documento es requerido",
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
        .min(1, "La sede es requerida"),
    specialties: z.array(z.string())
        .default([])
        .refine(
            (specialties) => specialties.length <= 10,
            "No se pueden agregar más de 10 especialidades"
        ),
});

// ===== TIPOS DERIVADOS DE LOS ESQUEMAS =====
export type UserData = z.infer<typeof userDataSchema>;
export type PersonalData = z.infer<typeof personalDataSchema>;
export type WorkData = z.infer<typeof workDataSchema>;