import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Crear nueva publicación
 * Validaciones:
 * - Usuario debe ser entrenador (role TRAINER)
 * - Descripción no vacía y <= 1000 chars
 */
export const createPost = mutation({
  args: {
    description: v.string(),
    image_storage_id: v.optional(v.id("_storage")),
    status: v.optional(v.union(v.literal("PUBLISHED"), v.literal("DRAFT"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    // 1. Obtener usuario
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .unique();
    
    if (!user) throw new Error("Usuario no encontrado");

    // 2. Verificar que es entrenador
    const trainerRole = await ctx.db
      .query("role_assignments")
      .withIndex("by_user_role", (q) => 
        q.eq("user_id", user._id).eq("role", "TRAINER")
      )
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!trainerRole) {
      throw new Error("Solo entrenadores pueden crear publicaciones");
    }

    // 3. Obtener registro de entrenador
    const trainer = await ctx.db
      .query("trainers")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .filter((q) => q.eq(q.field("status"), "ACTIVE"))
      .first();

    if (!trainer) {
      throw new Error("Entrenador no encontrado o inactivo");
    }

    // 4. Validar descripción
    if (!args.description || args.description.trim().length === 0) {
      throw new Error("La descripción no puede estar vacía");
    }
    if (args.description.length > 1000) {
      throw new Error("La descripción no puede exceder 1000 caracteres");
    }

    // 5. Generar URL de imagen si existe storage_id
    let image_url: string | undefined;
    if (args.image_storage_id !== undefined) {
      const url = await ctx.storage.getUrl(args.image_storage_id);
      if (url) {
        image_url = url;
      }
    }

    // 6. Crear publicación
    const now = Date.now();
    const status = args.status || "DRAFT";
    
    const postId = await ctx.db.insert("posts", {
      trainer_id: trainer._id,
      user_id: user._id,
      description: args.description.trim(),
      image_storage_id: args.image_storage_id,
      image_url, // Ahora TypeScript sabe que es string | undefined
      status,
      likes_count: 0,
      published_at: status === "PUBLISHED" ? now : undefined,
      created_at: now,
      updated_at: now,
    });

    return postId;
  },
});

/**
 * Actualizar publicación existente
 * Solo el creador puede editar
 */
export const updatePost = mutation({
  args: {
    post_id: v.id("posts"),
    description: v.optional(v.string()),
    image_storage_id: v.optional(v.id("_storage")),
    status: v.optional(v.union(
      v.literal("PUBLISHED"),
      v.literal("DRAFT"),
      v.literal("ARCHIVED")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    // 1. Obtener usuario
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .unique();
    
    if (!user) throw new Error("Usuario no encontrado");

    // 2. Obtener publicación
    const post = await ctx.db.get(args.post_id);
    if (!post) throw new Error("Publicación no encontrada");

    // 3. Verificar que el usuario es el creador
    if (post.user_id !== user._id) {
      throw new Error("Solo puedes editar tus propias publicaciones");
    }

    // 4. Preparar actualización
    const updates: any = {
      updated_at: Date.now(),
    };

    if (args.description !== undefined) {
      if (args.description.trim().length === 0) {
        throw new Error("La descripción no puede estar vacía");
      }
      if (args.description.length > 1000) {
        throw new Error("La descripción no puede exceder 1000 caracteres");
      }
      updates.description = args.description.trim();
    }

    if (args.image_storage_id !== undefined) {
      updates.image_storage_id = args.image_storage_id;
      updates.image_url = await ctx.storage.getUrl(args.image_storage_id);
    }

    if (args.status !== undefined) {
      updates.status = args.status;
      // Si se publica por primera vez
      if (args.status === "PUBLISHED" && !post.published_at) {
        updates.published_at = Date.now();
      }
    }

    // 5. Actualizar
    await ctx.db.patch(args.post_id, updates);

    return { success: true };
  },
});

/**
 * Eliminar publicación (soft delete)
 * Solo el creador o admins pueden eliminar
 */
export const deletePost = mutation({
  args: {
    post_id: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .unique();
    
    if (!user) throw new Error("Usuario no encontrado");

    const post = await ctx.db.get(args.post_id);
    if (!post) throw new Error("Publicación no encontrada");

    // Verificar permisos (creador o admin)
    const isOwner = post.user_id === user._id;
    const adminRole = await ctx.db
      .query("role_assignments")
      .withIndex("by_user_active", (q) => 
        q.eq("user_id", user._id).eq("active", true)
      )
      .filter((q) => {
        const role = q.field("role");
        return q.or(
          q.eq(role, "ADMIN"),
          q.eq(role, "SUPER_ADMIN")
        );
      })
      .first();

    if (!isOwner && !adminRole) {
      throw new Error("No tienes permisos para eliminar esta publicación");
    }

    // Soft delete
    await ctx.db.patch(args.post_id, {
      deleted_at: Date.now(),
      status: "ARCHIVED",
      updated_at: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Generar URL de subida para imágenes
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");

    // Verificar que es entrenador
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .unique();
    
    if (!user) throw new Error("Usuario no encontrado");

    const trainerRole = await ctx.db
      .query("role_assignments")
      .withIndex("by_user_role", (q) => 
        q.eq("user_id", user._id).eq("role", "TRAINER")
      )
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!trainerRole) {
      throw new Error("Solo entrenadores pueden subir imágenes");
    }

    return await ctx.storage.generateUploadUrl();
  },
});