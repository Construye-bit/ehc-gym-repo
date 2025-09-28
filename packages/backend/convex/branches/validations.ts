import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN PARA BRANCHES =====

// Estados válidos para una sede
export const branchStatusSchema = z.enum([
    "ACTIVE",
    "INACTIVE",
    "UNDER_CONSTRUCTION",
    "TEMPORARILY_CLOSED"
], {
    message: "El estado debe ser ACTIVE, INACTIVE, UNDER_CONSTRUCTION o TEMPORARILY_CLOSED",
});

// Esquema para metadata de sede
export const branchMetadataSchema = z.object({
    has_parking: z.boolean().optional(),
    has_pool: z.boolean().optional(),
    has_sauna: z.boolean().optional(),
    has_spa: z.boolean().optional(),
    has_locker_rooms: z.boolean().optional(),
    wifi_available: z.boolean().optional(),
}).optional();

// Esquema para validar horarios (formato HH:MM)
export const timeFormatSchema = z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido. Use HH:MM (24 horas)");

// Esquema para crear una sede
export const createBranchSchema = z.object({
    name: z.string()
        .min(1, "El nombre de la sede es requerido")
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.0-9]+$/, "El nombre solo puede contener letras, números, espacios, guiones y puntos"),
    address_id: z.string().min(1, "La dirección es requerida"),
    phone: z.string()
        .regex(/^[0-9\s\-\+\(\)]{10,15}$/, "El número de teléfono no es válido (10-15 dígitos)")
        .optional(),
    email: z.string()
        .regex(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "El correo electrónico no es válido"
        )
        .max(100, "El correo electrónico no puede exceder 100 caracteres")
        .optional(),
    opening_time: timeFormatSchema,
    closing_time: timeFormatSchema,
    max_capacity: z.number()
        .min(1, "La capacidad máxima debe ser al menos 1")
        .max(10000, "La capacidad máxima no puede exceder 10000")
        .int("La capacidad debe ser un número entero"),
    manager_id: z.string().optional(),
    status: branchStatusSchema.optional().default("ACTIVE"),
    opening_date: z.number()
        .min(0, "La fecha de apertura debe ser válida")
        .optional(),
    metadata: branchMetadataSchema,
}).refine((data) => {
    // Validar que la hora de apertura sea anterior a la de cierre
    const [openHour, openMin] = data.opening_time.split(':').map(Number);
    const [closeHour, closeMin] = data.closing_time.split(':').map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    return openMinutes < closeMinutes;
}, {
    message: "La hora de apertura debe ser anterior a la hora de cierre",
    path: ["closing_time"]
});

// Esquema para actualizar una sede
export const updateBranchSchema = z.object({
    branchId: z.string().min(1, "ID de sede requerido"),
    name: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.0-9]+$/, "El nombre solo puede contener letras, números, espacios, guiones y puntos")
        .optional(),
    address_id: z.string().optional(),
    phone: z.string()
        .regex(/^[0-9\s\-\+\(\)]{10,15}$/, "El número de teléfono no es válido (10-15 dígitos)")
        .optional(),
    email: z.string()
        .regex(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "El correo electrónico no es válido"
        )
        .max(100, "El correo electrónico no puede exceder 100 caracteres")
        .optional(),
    opening_time: timeFormatSchema.optional(),
    closing_time: timeFormatSchema.optional(),
    max_capacity: z.number()
        .min(1, "La capacidad máxima debe ser al menos 1")
        .max(10000, "La capacidad máxima no puede exceder 10000")
        .int("La capacidad debe ser un número entero")
        .optional(),
    manager_id: z.string().optional(),
    status: branchStatusSchema.optional(),
    opening_date: z.number()
        .min(0, "La fecha de apertura debe ser válida")
        .optional(),
    metadata: branchMetadataSchema,
}).refine((data) => {
    // Validar horarios solo si ambos están presentes
    if (data.opening_time && data.closing_time) {
        const [openHour, openMin] = data.opening_time.split(':').map(Number);
        const [closeHour, closeMin] = data.closing_time.split(':').map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        return openMinutes < closeMinutes;
    }
    return true;
}, {
    message: "La hora de apertura debe ser anterior a la hora de cierre",
    path: ["closing_time"]
});

// Esquema para eliminar una sede
export const deleteBranchSchema = z.object({
    branchId: z.string().min(1, "ID de sede requerido"),
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
export type BranchStatus = z.infer<typeof branchStatusSchema>;
export type BranchMetadata = z.infer<typeof branchMetadataSchema>;
export type CreateBranchData = z.infer<typeof createBranchSchema>;
export type UpdateBranchData = z.infer<typeof updateBranchSchema>;
export type DeleteBranchData = z.infer<typeof deleteBranchSchema>;