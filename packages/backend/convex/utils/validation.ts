// convex/utils/validation.ts
import { z } from "zod";

/**
 * Función auxiliar para validar datos con Zod
 * Lanza errores descriptivos cuando la validación falla
 */
export function validateWithZod<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context: string
): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join(", ");
            throw new Error(`Validación fallida en ${context}: ${errorMessages}`);
        }
        throw new Error(`Error de validación en ${context}: ${error}`);
    }
}