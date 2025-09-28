import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN PARA ADDRESSES =====

// Esquema para coordenadas geográficas
export const coordinatesSchema = z.object({
    latitude: z.number()
        .min(-90, "La latitud debe estar entre -90 y 90 grados")
        .max(90, "La latitud debe estar entre -90 y 90 grados"),
    longitude: z.number()
        .min(-180, "La longitud debe estar entre -180 y 180 grados")
        .max(180, "La longitud debe estar entre -180 y 180 grados"),
});

// Esquema para crear una dirección
export const createAddressSchema = z.object({
    city_id: z.string().min(1, "La ciudad es requerida"),
    main_address: z.string()
        .min(1, "La dirección principal es requerida")
        .min(10, "La dirección debe tener al menos 10 caracteres")
        .max(200, "La dirección no puede exceder 200 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.#0-9,]+$/, "La dirección contiene caracteres no válidos"),
    reference: z.string()
        .max(150, "La referencia no puede exceder 150 caracteres")
        .optional(),
    latitude: z.number()
        .min(-90, "La latitud debe estar entre -90 y 90 grados")
        .max(90, "La latitud debe estar entre -90 y 90 grados")
        .optional(),
    longitude: z.number()
        .min(-180, "La longitud debe estar entre -180 y 180 grados")
        .max(180, "La longitud debe estar entre -180 y 180 grados")
        .optional(),
}).refine((data) => {
    // Si se proporciona una coordenada, ambas deben estar presentes
    const hasLat = data.latitude !== undefined;
    const hasLon = data.longitude !== undefined;
    return (hasLat && hasLon) || (!hasLat && !hasLon);
}, {
    message: "Debe proporcionar tanto latitud como longitud, o ninguna de las dos",
    path: ["longitude"]
});

// Esquema para actualizar una dirección
export const updateAddressSchema = z.object({
    addressId: z.string().min(1, "ID de dirección requerido"),
    city_id: z.string().optional(),
    main_address: z.string()
        .min(10, "La dirección debe tener al menos 10 caracteres")
        .max(200, "La dirección no puede exceder 200 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.#0-9,]+$/, "La dirección contiene caracteres no válidos")
        .optional(),
    reference: z.string()
        .max(150, "La referencia no puede exceder 150 caracteres")
        .optional(),
    latitude: z.number()
        .min(-90, "La latitud debe estar entre -90 y 90 grados")
        .max(90, "La latitud debe estar entre -90 y 90 grados")
        .optional(),
    longitude: z.number()
        .min(-180, "La longitud debe estar entre -180 y 180 grados")
        .max(180, "La longitud debe estar entre -180 y 180 grados")
        .optional(),
    active: z.boolean().optional(),
}).refine((data) => {
    // Si se proporciona una coordenada en la actualización, validar consistencia
    const hasLat = data.latitude !== undefined;
    const hasLon = data.longitude !== undefined;

    // Si se actualiza una coordenada, debe actualizarse la otra también
    if (hasLat || hasLon) {
        return hasLat && hasLon;
    }
    return true;
}, {
    message: "Si actualiza las coordenadas, debe proporcionar tanto latitud como longitud",
    path: ["longitude"]
});

// Esquema para eliminar una dirección
export const deleteAddressSchema = z.object({
    addressId: z.string().min(1, "ID de dirección requerido"),
});

// Esquema para desactivar una dirección
export const deactivateAddressSchema = z.object({
    addressId: z.string().min(1, "ID de dirección requerido"),
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
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type CreateAddressData = z.infer<typeof createAddressSchema>;
export type UpdateAddressData = z.infer<typeof updateAddressSchema>;
export type DeleteAddressData = z.infer<typeof deleteAddressSchema>;
export type DeactivateAddressData = z.infer<typeof deactivateAddressSchema>;