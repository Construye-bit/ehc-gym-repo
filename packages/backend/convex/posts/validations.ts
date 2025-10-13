// convex/posts/validations.ts
import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN PARA POSTS =====

// Esquema para crear una publicación
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(100, "El título no puede exceder 100 caracteres")
    .trim(),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .trim(),
  image_storage_id: z
    .string()
    .min(1, "El ID de la imagen es requerido")
    .optional(),
});

// Esquema para actualizar una publicación
export const updatePostSchema = z.object({
  postId: z.string().min(1, "El ID de la publicación es requerido"),
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(100, "El título no puede exceder 100 caracteres")
    .trim()
    .optional(),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .trim()
    .optional(),
  image_storage_id: z
    .string()
    .min(1, "El ID de la imagen es requerido")
    .optional(),
});

// Esquema para eliminar una publicación
export const deletePostSchema = z.object({
  postId: z.string().min(1, "El ID de la publicación es requerido"),
});

// Esquema para obtener una publicación
export const getPostSchema = z.object({
  postId: z.string().min(1, "El ID de la publicación es requerido"),
});

// Esquema para feed de publicaciones (paginación)
export const getPostsFeedSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1, "El límite debe ser al menos 1")
    .max(50, "El límite no puede exceder 50")
    .optional()
    .default(20),
  cursor: z.number().optional(),
});

// Esquema para obtener posts de un trainer específico
export const getTrainerPostsSchema = z.object({
  trainerId: z.string().min(1, "El ID del entrenador es requerido"),
  limit: z
    .number()
    .int()
    .min(1, "El límite debe ser al menos 1")
    .max(50, "El límite no puede exceder 50")
    .optional()
    .default(20),
  cursor: z.number().optional(),
});

// ===== TIPOS DERIVADOS DE LOS ESQUEMAS =====
export type CreatePostData = z.infer<typeof createPostSchema>;
export type UpdatePostData = z.infer<typeof updatePostSchema>;
export type DeletePostData = z.infer<typeof deletePostSchema>;
export type GetPostData = z.infer<typeof getPostSchema>;
export type GetPostsFeedData = z.infer<typeof getPostsFeedSchema>;
export type GetTrainerPostsData = z.infer<typeof getTrainerPostsSchema>;
