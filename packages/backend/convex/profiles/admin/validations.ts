import { z } from "zod";

/**
 * Admin puede editar todo, pero acotamos patchs con campos conocidos.
 */

export const getUserProfileByIdSchema = z.object({
    user_id: z.string().min(1),
});

export const adminSetClientContractSchema = z.object({
    client_id: z.string().min(1),
    trainer_id: z.string().min(1),
    status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]),
    start_at: z.number().int().min(0),
    end_at: z.optional(z.number().int().min(0)),
    notes: z.optional(z.string().max(500)),
});

export const adminEditPersonSchema = z.object({
    person_id: z.string().min(1),
    patch: z
        .object({
            name: z.optional(z.string().min(1).max(50)),
            last_name: z.optional(z.string().min(1).max(50)),
            born_date: z.optional(z.string().min(1)),
            document_type: z.optional(z.enum(["CC", "TI", "CE", "PASSPORT"])),
            document_number: z.optional(
                z
                    .string()
                    .min(6)
                    .max(20)
                    .regex(/^[a-zA-Z0-9]+$/, "El documento solo puede contener letras y números")
            ),
            phone: z.optional(
                z
                    .string()
                    .refine(
                        (val) => /^[0-9\s\-\+\(\)]{10,15}$/.test(val),
                        "El número de teléfono no es válido (10-15 dígitos)"
                    )
            ),
        })
        .refine((obj) => Object.keys(obj).length > 0, {
            message: "patch no puede estar vacío",
            path: ["patch"],
        }),
});

const dayRange = z.object({
    start: z.string().min(1),
    end: z.string().min(1),
});
const workScheduleSchema = z.object({
    monday: z.optional(dayRange),
    tuesday: z.optional(dayRange),
    wednesday: z.optional(dayRange),
    thursday: z.optional(dayRange),
    friday: z.optional(dayRange),
    saturday: z.optional(dayRange),
    sunday: z.optional(dayRange),
});

export const adminEditTrainerSchema = z.object({
    trainer_id: z.string().min(1),
    patch: z
        .object({
            specialties: z.optional(z.array(z.string().min(1).max(50)).max(10)),
            work_schedule: z.optional(workScheduleSchema),
            status: z.optional(z.enum(["ACTIVE", "INACTIVE", "ON_VACATION"])),
        })
        .refine((obj) => Object.keys(obj).length > 0, {
            message: "patch no puede estar vacío",
            path: ["patch"],
        }),
});

export const adminSetRoleAssignmentSchema = z.object({
    user_id: z.string().min(1),
    role: z.enum(["CLIENT", "TRAINER", "ADMIN", "SUPER_ADMIN"]),
    branch_id: z.optional(z.string().min(1)),
    active: z.boolean(),
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
