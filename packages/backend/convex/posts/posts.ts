/**
 * Schema para el sistema de publicaciones del feed
 * 
 * Reglas de negocio:
 * - Solo entrenadores (TRAINER role) pueden crear, editar y eliminar publicaciones
 * - Todos los usuarios autenticados pueden ver publicaciones y dar likes
 * - No hay sistema de comentarios ni jerarquía por importancia
 * - Cada publicación puede tener una imagen (almacenada en Convex Storage)
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Tabla de publicaciones del feed
 * 
 * Campos:
 * - trainer_id: ID del entrenador que creó la publicación (FK -> trainers)
 * - user_id: ID del usuario asociado al entrenador (FK -> users) - para auditoría y validaciones
 * - description: Contenido textual de la publicación (max recomendado: 500-1000 chars)
 * - image_storage_id: ID del archivo en Convex Storage (null si no tiene imagen)
 * - image_url: URL generada del archivo (se regenera al consultar, puede expirar)
 * - status: Estado de la publicación
 *   * PUBLISHED: Visible en el feed para todos los usuarios
 *   * DRAFT: Borrador, solo visible para el creador
 *   * ARCHIVED: Oculta del feed pero mantenida en BD
 * - likes_count: Contador desnormalizado de likes (actualizado vía mutation)
 * - published_at: Timestamp de cuando se publicó (null si está en DRAFT)
 * - deleted_at: Soft delete timestamp (null si no está eliminado)
 * - created_at: Timestamp de creación del registro
 * - updated_at: Timestamp de última modificación
 * 
 * Índices críticos:
 * - by_status_published: Para feed principal (status + published_at DESC)
 * - by_trainer_status: Para panel del entrenador (ver sus propias publicaciones)
 * - by_post_user: Para validar duplicados de like
 */
export const postsTable = defineTable({
    trainer_id: v.id("trainers"),
    user_id: v.id("users"),
    description: v.string(),
    
    // Gestión de imagen
    image_storage_id: v.optional(v.id("_storage")),
    image_url: v.optional(v.string()),
    
    // Control de estado
    status: v.union(
        v.literal("PUBLISHED"),
        v.literal("DRAFT"),
        v.literal("ARCHIVED")
    ),
    
    // Métricas y timestamps
    likes_count: v.number(), // Inicializa en 0
    published_at: v.optional(v.number()),
    deleted_at: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
})
    // Índice principal para el feed público (status + fecha descendente)
    .index("by_status_published", ["status", "published_at"])
    
    // Índice para consultas de entrenador específico
    .index("by_trainer_status", ["trainer_id", "status"])
    
    // Índice para auditoría y búsquedas por usuario
    .index("by_user", ["user_id"])
    
    // Índice para consultas por estado general
    .index("by_status", ["status"])
    
    // Índice para ordenamiento cronológico de creación
    .index("by_created", ["created_at"])
    
    // Índice para soft deletes
    .index("by_deleted", ["deleted_at"]);

/**
 * Tipos TypeScript exportados para el frontend
 */

// Tipo base de la publicación (tal como está en DB)
export type Post = {
    _id: string; // Convex ID
    _creationTime: number; // Auto-generado por Convex
    trainer_id: string;
    user_id: string;
    description: string;
    image_storage_id?: string;
    image_url?: string;
    status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
    likes_count: number;
    published_at?: number;
    deleted_at?: number;
    created_at: number;
    updated_at: number;
};

// Tipo para crear una nueva publicación
export type CreatePostInput = {
    trainer_id: string;
    description: string;
    image_storage_id?: string;
    status?: "PUBLISHED" | "DRAFT"; // Por defecto DRAFT
};

// Tipo para actualizar una publicación existente
export type UpdatePostInput = {
    post_id: string;
    description?: string;
    image_storage_id?: string;
    status?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
};

// Tipo enriquecido con datos del entrenador (para UI)
export type PostWithTrainer = Post & {
    trainer_name: string;
    trainer_specialties: string[];
    user_has_liked: boolean; // Si el usuario actual dio like
};

// Tipo para filtros de búsqueda
export type PostFilters = {
    trainer_id?: string;
    status?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
    from_date?: number;
    to_date?: number;
};

/**
 * Validaciones de input (usar en mutations)
 */

export const validateDescription = (description: string): boolean => {
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 1000;
    
    if (!description || description.trim().length < MIN_LENGTH) {
        return false;
    }
    
    if (description.length > MAX_LENGTH) {
        return false;
    }
    
    return true;
};

export const validatePostStatus = (status: string): status is "PUBLISHED" | "DRAFT" | "ARCHIVED" => {
    return ["PUBLISHED", "DRAFT", "ARCHIVED"].includes(status);
};

/**
 * Constantes útiles
 */
export const POST_CONSTANTS = {
    MAX_DESCRIPTION_LENGTH: 1000,
    MIN_DESCRIPTION_LENGTH: 1,
    DEFAULT_STATUS: "DRAFT" as const,
    MAX_IMAGE_SIZE_MB: 5,
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
} as const;