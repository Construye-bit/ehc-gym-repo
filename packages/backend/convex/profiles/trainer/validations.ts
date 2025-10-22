import { z } from "zod";

/**
 * Phone simple (permite +() - espacios, 10-15 dígitos)
 */
export const phoneSchema = z
    .string()
    .min(1, "El teléfono es requerido")
    .refine(
        (val) => /^[0-9\s\-\+\(\)]{10,15}$/.test(val),
        "El número de teléfono no es válido (10-15 dígitos)"
    );

export const specialtiesSchema = z
    .array(z.string().min(1).max(50))
    .min(1, "Al menos una especialidad")
    .max(10, "Máximo 10 especialidades");

const dayRange = z.object({
    start: z.string().min(1, "Inicio requerido"), // "HH:mm"
    end: z.string().min(1, "Fin requerido"),
});

export const workScheduleSchema = z.object({
    monday: z.optional(dayRange),
    tuesday: z.optional(dayRange),
    wednesday: z.optional(dayRange),
    thursday: z.optional(dayRange),
    friday: z.optional(dayRange),
    saturday: z.optional(dayRange),
    sunday: z.optional(dayRange),
});

/**
 * Payloads
 */
export const updateTrainerSpecialtiesSchema = z.object({
    trainer_id: z.string().min(1),
    specialties: specialtiesSchema,
});

export const updateTrainerScheduleSchema = z.object({
    trainer_id: z.string().min(1),
    work_schedule: workScheduleSchema,
});

export const updateMyPhoneSchema = z.object({
    trainer_id: z.string().min(1),
    phone: phoneSchema,
});

/**
 * Helper estándar
 */
export function validateWithZod<T>(schema: z.ZodSchema<T>, data: unknown, context: string): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const msg = error.issues
                .map((i) => `${i.path.join(".")}: ${i.message}`)
                .join(", ");
            throw new Error(`Validación fallida en ${context}: ${msg}`);
        }
        throw new Error(`Error de validación en ${context}: ${String(error)}`);
    }
}
