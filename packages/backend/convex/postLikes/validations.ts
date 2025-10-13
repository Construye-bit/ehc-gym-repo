// convex/postLikes/validations.ts
import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN PARA POST LIKES =====

// Esquema para toggle like (crear o eliminar like)
export const toggleLikeSchema = z.object({
    postId: z.string().min(1, "El ID de la publicación es requerido"),
});

// Esquema para verificar si usuario dio like
export const checkIfUserLikedSchema = z.object({
    postId: z.string().min(1, "El ID de la publicación es requerido"),
});

// Esquema para obtener contador de likes
export const getLikesCountSchema = z.object({
    postId: z.string().min(1, "El ID de la publicación es requerido"),
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
export type ToggleLikeData = z.infer<typeof toggleLikeSchema>;
export type CheckIfUserLikedData = z.infer<typeof checkIfUserLikedSchema>;
export type GetLikesCountData = z.infer<typeof getLikesCountSchema>;