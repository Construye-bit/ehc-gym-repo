// convex/postLikes/queries.ts
import { query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import {
    checkIfUserLikedSchema,
    getLikesCountSchema,
    validateWithZod
} from './validations';

/**
 * Verificar si el usuario actual dio like a una publicación
 * Requiere autenticación
 */
export const checkIfUserLiked = query({
    args: {
        postId: v.id("posts"),
    },
    handler: async (ctx, args): Promise<boolean> => {
        // 1. Validar entrada
        const validatedData = validateWithZod(checkIfUserLikedSchema, args, "checkIfUserLiked");

        // 2. Obtener usuario autenticado
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return false; // Usuario no autenticado = no ha dado like
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .unique();

        if (!user) {
            return false;
        }

        // 3. Buscar like
        const like = await ctx.db
            .query("post_likes")
            .withIndex("by_post_user", (q) => 
                q.eq("post_id", validatedData.postId as Id<"posts">)
                 .eq("user_id", user._id)
            )
            .unique();

        return !!like;
    },
});

/**
 * Obtener contador de likes de una publicación
 * No requiere autenticación (público)
 */
export const getLikesCount = query({
    args: {
        postId: v.id("posts"),
    },
    handler: async (ctx, args): Promise<number> => {
        // 1. Validar entrada
        const validatedData = validateWithZod(getLikesCountSchema, args, "getLikesCount");

        // 2. Obtener publicación
        const post = await ctx.db.get(validatedData.postId as Id<"posts">);

        if (!post) {
            throw new Error("Publicación no encontrada");
        }

        // 3. Retornar contador (ya está desnormalizado)
        return post.likes_count;
    },
});

/**
 * Obtener historial de likes del usuario actual
 * Útil para mostrar "mis likes" o actividad del usuario
 */
export const getUserLikeHistory = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 50;

        // 1. Obtener usuario autenticado
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .unique();

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // 2. Obtener likes del usuario ordenados por fecha
        const likes = await ctx.db
            .query("post_likes")
            .withIndex("by_user_created", (q) => 
                q.eq("user_id", user._id)
            )
            .order("desc")
            .take(limit);

        // 3. Enriquecer con información de las publicaciones
        const enrichedLikes = await Promise.all(
            likes.map(async (like) => {
                const post = await ctx.db.get(like.post_id);
                
                if (!post || post.deleted_at) {
                    return null; // Post eliminado
                }

                const trainer = await ctx.db.get(post.trainer_id);
                const person = trainer ? await ctx.db.get(trainer.person_id) : null;

                return {
                    like_id: like._id,
                    liked_at: like.created_at,
                    post: {
                        _id: post._id,
                        description: post.description,
                        image_url: post.image_url,
                        likes_count: post.likes_count,
                        published_at: post.published_at,
                        trainer_name: person 
                            ? `${person.name} ${person.last_name}` 
                            : "Entrenador",
                    },
                };
            })
        );

        // 4. Filtrar posts eliminados (null)
        return enrichedLikes.filter(item => item !== null);
    },
});