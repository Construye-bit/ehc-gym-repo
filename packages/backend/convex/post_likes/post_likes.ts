/**
 * Schema para el sistema de likes de publicaciones
 * 
 * Reglas de negocio:
 * - Cualquier usuario autenticado puede dar like a publicaciones PUBLISHED
 * - Un usuario solo puede dar like una vez por publicación
 * - El like se puede remover (unlike)
 * - Cada like/unlike actualiza el contador en posts.likes_count
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Tabla de likes en publicaciones
 * 
 * Campos:
 * - post_id: ID de la publicación (FK -> posts)
 * - user_id: ID del usuario que dio like (FK -> users)
 * - created_at: Timestamp de cuando se dio el like
 * 
 * Restricciones:
 * - Combinación (post_id + user_id) debe ser única
 * - Se valida en mutation antes de insertar
 * 
 * Índices críticos:
 * - by_post_user: Para verificar si ya existe like (prevenir duplicados)
 * - by_post: Para contar likes por publicación
 * - by_user_created: Para historial de likes del usuario
 */
export const postLikesTable = defineTable({
    post_id: v.id("posts"),
    user_id: v.id("users"),
    created_at: v.number(),
})
    // Índice compuesto para verificación de duplicados (CRÍTICO)
    // Usado en: checkIfUserLikedPost, preventDuplicateLikes
    .index("by_post_user", ["post_id", "user_id"])
    
    // Índice para obtener todos los likes de una publicación
    // Usado en: getLikesByPost, getUsersWhoLiked
    .index("by_post", ["post_id"])
    
    // Índice para historial de likes del usuario (ordenado por fecha)
    // Usado en: getUserLikeHistory, getUserLikedPosts
    .index("by_user_created", ["user_id", "created_at"])
    
    // Índice simple por usuario
    // Usado en: getAllUserLikes
    .index("by_user", ["user_id"]);

/**
 * Tipos TypeScript exportados para el frontend
 */

// Tipo base del like (tal como está en DB)
export type PostLike = {
    _id: string; // Convex ID
    _creationTime: number; // Auto-generado por Convex
    post_id: string;
    user_id: string;
    created_at: number;
};

// Tipo para crear un like
export type CreateLikeInput = {
    post_id: string;
    user_id: string;
};

// Tipo para remover un like
export type RemoveLikeInput = {
    post_id: string;
    user_id: string;
};

// Tipo enriquecido con datos del usuario (para UI)
export type PostLikeWithUser = PostLike & {
    user_name: string;
    user_email: string;
};

// Tipo para respuesta de like/unlike
export type LikeActionResponse = {
    success: boolean;
    action: "liked" | "unliked";
    new_likes_count: number;
};

/**
 * Validaciones de input
 */

export const validateLikeInput = (post_id: string, user_id: string): boolean => {
    if (!post_id || !user_id) {
        return false;
    }
    
    // Validación básica de formato de ID de Convex (empieza con letra)
    const convexIdPattern = /^[a-z][a-z0-9]{15,}$/;
    
    if (!convexIdPattern.test(post_id) || !convexIdPattern.test(user_id)) {
        return false;
    }
    
    return true;
};

/**
 * Constantes útiles
 */
export const LIKE_CONSTANTS = {
    MAX_LIKES_PER_USER_PER_DAY: 500, // Límite anti-spam
    CACHE_TTL_SECONDS: 60, // TTL para cache de likes count
} as const;

/**
 * Utilidades para queries comunes
 */

// Helper para verificar si un usuario ya dio like (usar en mutations)
export const buildLikeCheckQuery = (post_id: string, user_id: string) => ({
    post_id,
    user_id,
});

// Helper para obtener likes de un usuario en un período
export const buildUserLikesInPeriod = (
    user_id: string,
    from_timestamp: number,
    to_timestamp: number
) => ({
    user_id,
    created_at_gte: from_timestamp,
    created_at_lte: to_timestamp,
});