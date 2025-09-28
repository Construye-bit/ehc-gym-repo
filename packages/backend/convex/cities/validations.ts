import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN PARA CITIES =====

// Tipos válidos de ciudad
export const cityTypeSchema = z.enum(["CIUDAD", "MUNICIPIO", "PUEBLO"], {
    message: "El tipo debe ser CIUDAD, MUNICIPIO o PUEBLO",
});

// Esquema para crear una ciudad
export const createCitySchema = z.object({
    country: z.string()
        .min(1, "El país es requerido")
        .min(2, "El nombre del país debe tener al menos 2 caracteres")
        .max(100, "El nombre del país no puede exceder 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.]+$/, "El país solo puede contener letras, espacios, guiones y puntos"),
    state_region: z.string()
        .min(1, "El estado/región es requerido")
        .min(2, "El nombre del estado/región debe tener al menos 2 caracteres")
        .max(100, "El nombre del estado/región no puede exceder 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.]+$/, "El estado/región solo puede contener letras, espacios, guiones y puntos"),
    name: z.string()
        .min(1, "El nombre de la ciudad es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.]+$/, "El nombre solo puede contener letras, espacios, guiones y puntos"),
    type: cityTypeSchema,
    postal_code: z.string()
        .regex(/^[0-9A-Za-z\-\s]{3,10}$/, "El código postal debe tener entre 3-10 caracteres alfanuméricos")
        .optional(),
});

// Esquema para actualizar una ciudad
export const updateCitySchema = z.object({
    cityId: z.string().min(1, "ID de ciudad requerido"),
    country: z.string()
        .min(2, "El nombre del país debe tener al menos 2 caracteres")
        .max(100, "El nombre del país no puede exceder 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.]+$/, "El país solo puede contener letras, espacios, guiones y puntos")
        .optional(),
    state_region: z.string()
        .min(2, "El nombre del estado/región debe tener al menos 2 caracteres")
        .max(100, "El nombre del estado/región no puede exceder 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.]+$/, "El estado/región solo puede contener letras, espacios, guiones y puntos")
        .optional(),
    name: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.]+$/, "El nombre solo puede contener letras, espacios, guiones y puntos")
        .optional(),
    type: cityTypeSchema.optional(),
    postal_code: z.string()
        .regex(/^[0-9A-Za-z\-\s]{3,10}$/, "El código postal debe tener entre 3-10 caracteres alfanuméricos")
        .optional(),
});

// Esquema para eliminar una ciudad
export const deleteCitySchema = z.object({
    cityId: z.string().min(1, "ID de ciudad requerido"),
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
export type CityType = z.infer<typeof cityTypeSchema>;
export type CreateCityData = z.infer<typeof createCitySchema>;
export type UpdateCityData = z.infer<typeof updateCitySchema>;
export type DeleteCityData = z.infer<typeof deleteCitySchema>;