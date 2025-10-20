// convex/postLikes/validations.ts
import { z } from "zod";
import { validateWithZod } from "../utils/validation";

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

// ===== TIPOS DERIVADOS DE LOS ESQUEMAS =====
export type ToggleLikeData = z.infer<typeof toggleLikeSchema>;
export type CheckIfUserLikedData = z.infer<typeof checkIfUserLikedSchema>;
export type GetLikesCountData = z.infer<typeof getLikesCountSchema>;