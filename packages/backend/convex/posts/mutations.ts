// convex/posts/mutations.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import {
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
} from "./validations";
import validateWithZod from "../utils/validation";
import {
  PostNotFoundError,
  UnauthorizedPostActionError,
  InvalidPostDataError,
} from "./errors";
import {
  getCurrentUser,
  requireTrainerRole,
  getActiveTrainer,
  requirePostOwnership,
  getImageUrl,
} from "./utils";

/**
 * Crear nueva publicación
 * Solo trainers autenticados y activos pueden crear publicaciones
 */
export const createPost = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    image_storage_id: v.optional(v.id("_storage")),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    data: {
      postId: Id<"posts">;
      message: string;
    };
  }> => {
    try {
      // 1. Validar datos de entrada
      const validatedData = validateWithZod(
        createPostSchema,
        args,
        "createPost"
      );

      // 2. Obtener usuario autenticado
      const user = await getCurrentUser(ctx);

      // 3. Verificar que tiene rol de TRAINER activo
      await requireTrainerRole(ctx, user._id);

      // 4. Obtener registro de trainer (y verificar que esté ACTIVE)
      const trainer = await getActiveTrainer(ctx, user._id);

      // 5. Generar URL de imagen si existe
      const image_url = await getImageUrl(
        ctx,
        validatedData.image_storage_id as Id<"_storage"> | undefined
      );

      // 6. Crear publicación
      const now = Date.now();
      const postId = await ctx.db.insert("posts", {
        trainer_id: trainer._id,
        user_id: user._id,
        title: validatedData.title,
        description: validatedData.description,
        image_storage_id: validatedData.image_storage_id as
          | Id<"_storage">
          | undefined,
        image_url,
        likes_count: 0,
        published_at: now,
        created_at: now,
        updated_at: now,
      });

      return {
        success: true,
        data: {
          postId,
          message: "Publicación creada exitosamente",
        },
      };
    } catch (error) {
      console.error("Error creating post:", error);

      // Re-lanzar errores conocidos
      if (
        error instanceof UnauthorizedPostActionError ||
        error instanceof InvalidPostDataError
      ) {
        throw error;
      }

      // Manejo de errores estándar
      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(`Error al crear publicación: ${errorMessage}`);
    }
  },
});

/**
 * Actualizar publicación existente
 * Solo el creador puede editar su publicación
 */
export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    image_storage_id: v.optional(v.id("_storage")),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      // 1. Validar datos de entrada
      const validatedData = validateWithZod(
        updatePostSchema,
        args,
        "updatePost"
      );

      // 2. Obtener usuario autenticado
      const user = await getCurrentUser(ctx);

      // 3. Verificar propiedad de la publicación
      const post = await requirePostOwnership(
        ctx,
        validatedData.postId as Id<"posts">,
        user._id
      );

      // 4. Verificar que no esté eliminada
      if (post.deleted_at) {
        throw new InvalidPostDataError(
          "No se puede editar una publicación eliminada"
        );
      }

      // 5. Preparar actualización
      const updates: any = {
        updated_at: Date.now(),
      };

      if (validatedData.title !== undefined) {
        updates.title = validatedData.title;
      }

      if (validatedData.description !== undefined) {
        updates.description = validatedData.description;
      }

      if (validatedData.image_storage_id !== undefined) {
        updates.image_storage_id = validatedData.image_storage_id;
        updates.image_url = await getImageUrl(
          ctx,
          validatedData.image_storage_id as Id<"_storage">
        );
      }

      // 6. Actualizar publicación
      await ctx.db.patch(validatedData.postId as Id<"posts">, updates);

      return {
        success: true,
        message: "Publicación actualizada exitosamente",
      };
    } catch (error) {
      console.error("Error updating post:", error);

      if (
        error instanceof UnauthorizedPostActionError ||
        error instanceof InvalidPostDataError ||
        error instanceof PostNotFoundError
      ) {
        throw error;
      }

      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(`Error al actualizar publicación: ${errorMessage}`);
    }
  },
});

/**
 * Eliminar publicación (soft delete)
 * Solo el creador puede eliminar su publicación
 */
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      // 1. Validar datos de entrada
      const validatedData = validateWithZod(
        deletePostSchema,
        args,
        "deletePost"
      );

      // 2. Obtener usuario autenticado
      const user = await getCurrentUser(ctx);

      // 3. Verificar propiedad de la publicación
      await requirePostOwnership(
        ctx,
        validatedData.postId as Id<"posts">,
        user._id
      );

      // 4. Soft delete
      await ctx.db.patch(validatedData.postId as Id<"posts">, {
        deleted_at: Date.now(),
        updated_at: Date.now(),
      });

      return {
        success: true,
        message: "Publicación eliminada exitosamente",
      };
    } catch (error) {
      console.error("Error deleting post:", error);

      if (
        error instanceof UnauthorizedPostActionError ||
        error instanceof PostNotFoundError
      ) {
        throw error;
      }

      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(`Error al eliminar publicación: ${errorMessage}`);
    }
  },
});

/**
 * Generar URL de subida para imágenes
 * Solo trainers pueden generar URLs de subida
 */
export const generateUploadUrl = mutation({
  handler: async (ctx): Promise<string> => {
    try {
      // 1. Obtener usuario autenticado
      const user = await getCurrentUser(ctx);

      // 2. Verificar que tiene rol de TRAINER activo
      await requireTrainerRole(ctx, user._id);

      // 3. Generar y retornar URL de subida
      return await ctx.storage.generateUploadUrl();
    } catch (error) {
      console.error("Error generating upload URL:", error);

      if (error instanceof UnauthorizedPostActionError) {
        throw error;
      }

      throw new Error("Error al generar URL de subida");
    }
  },
});
