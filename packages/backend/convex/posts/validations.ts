// convex/posts/validations.ts
import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN PARA POSTS =====

// Esquema para crear una publicación
export const createPostSchema = z.object({
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

// ===== FUNCIÓN AUXILIAR PARA VALIDACIÓN =====
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

// ===== TIPOS DERIVADOS DE LOS ESQUEMAS =====
export type CreatePostData = z.infer<typeof createPostSchema>;
export type UpdatePostData = z.infer<typeof updatePostSchema>;
export type DeletePostData = z.infer<typeof deletePostSchema>;
export type GetPostData = z.infer<typeof getPostSchema>;
export type GetPostsFeedData = z.infer<typeof getPostsFeedSchema>;
export type GetTrainerPostsData = z.infer<typeof getTrainerPostsSchema>;
