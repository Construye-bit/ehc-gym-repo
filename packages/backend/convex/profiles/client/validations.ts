import { z } from "zod";

export const timeRangeSchema = z.object({
    start: z.string().min(1), // "HH:mm"
    end: z.string().min(1),
});

export const routineTypeSchema = z.enum(["FUERZA", "CARDIO", "MIXTO", "MOVILIDAD"]);
export const goalSchema = z.enum(["BAJAR_PESO", "TONIFICAR", "GANAR_MASA", "RESISTENCIA"]);

export const upsertClientPreferencesSchema = z.object({
    client_id: z.string().min(1),
    preferred_time_range: z.optional(timeRangeSchema),
    routine_type: z.optional(routineTypeSchema),
    goal: z.optional(goalSchema),
    notes: z.optional(z.string().max(500)),
});

export const addHealthMetricSchema = z.object({
    client_id: z.string().min(1),
    measured_at: z.number().int().min(0),
    weight_kg: z.optional(z.number().min(0).max(500)),
    height_cm: z.optional(z.number().min(0).max(300)),
    bmi: z.optional(z.number().min(0).max(100)),
    body_fat_pct: z.optional(z.number().min(0).max(100)),
    notes: z.optional(z.string().max(500)),
});

export const listHealthMetricsSchema = z.object({
    client_id: z.string().min(1),
    from: z.optional(z.number().int().min(0)),
    to: z.optional(z.number().int().min(0)),
    limit: z.optional(z.number().int().min(1).max(200)),
});

export const addProgressSchema = z.object({
    client_id: z.string().min(1),
    kind: z.enum(["MEDICION", "HITO", "RUTINA"]),
    metric_key: z.optional(z.string().max(100)),
    metric_value: z.optional(z.number()),
    title: z.optional(z.string().max(120)),
    description: z.optional(z.string().max(1000)),
    recorded_at: z.number().int().min(0),
});

export const listProgressSchema = z.object({
    client_id: z.string().min(1),
    from: z.optional(z.number().int().min(0)),
    to: z.optional(z.number().int().min(0)),
    limit: z.optional(z.number().int().min(1).max(200)),
});

export const listMyContractsSchema = z.object({
    client_id: z.string().min(1),
    status: z.optional(z.enum(["ACTIVE", "INACTIVE", "BLOCKED"])),
    limit: z.optional(z.number().int().min(1).max(200)),
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
export const phoneSchema = z
    .string()
    .min(1, "El teléfono es requerido")
    .refine(
        (val) => /^[0-9\s\-\+\(\)]{10,15}$/.test(val),
        "El número de teléfono no es válido (10-15 dígitos)"
    );
    
export const updateMyPhoneSchema = z.object({
    client_id: z.string().min(1),
    phone: phoneSchema,
});


