// convex/postLikes/mutations.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { toggleLikeSchema, validateWithZod } from './validations';

/**
 * Toggle like en una publicación (transaccional)
 * Si existe like -> eliminar (unlike)
 * Si no existe like -> crear (like)
 * Mantiene consistencia del contador likes_count
 */
export const toggleLike = mutation({
    args: {
        postId: v.id("posts"),
    },
    handler: async (ctx, args): Promise<{
        success: boolean;
        action: "liked" | "unliked";
        likesCount: number;
    }> => {
        try {
            // 1. Validar entrada
            const validatedData = validateWithZod(toggleLikeSchema, args, "toggleLike");

            // 2. Obtener usuario autenticado
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

            // 3. Verificar que la publicación existe y no está eliminada
            const post = await ctx.db.get(validatedData.postId as Id<"posts">);
            
            if (!post) {
                throw new Error("Publicación no encontrada");
            }

            if (post.deleted_at) {
                throw new Error("No se puede dar like a una publicación eliminada");
            }

            // 4. Verificar si ya existe un like (transaccional)
            const existingLike = await ctx.db
                .query("post_likes")
                .withIndex("by_post_user", (q) => 
                    q.eq("post_id", validatedData.postId as Id<"posts">)
                     .eq("user_id", user._id)
                )
                .unique();

            let action: "liked" | "unliked";
            let newLikesCount: number;

            if (existingLike) {
                // UNLIKE: Eliminar like y decrementar contador
                await ctx.db.delete(existingLike._id);
                newLikesCount = Math.max(0, post.likes_count - 1);
                action = "unliked";
            } else {
                // LIKE: Crear like e incrementar contador
                await ctx.db.insert("post_likes", {
                    post_id: validatedData.postId as Id<"posts">,
                    user_id: user._id,
                    created_at: Date.now(),
                });
                newLikesCount = post.likes_count + 1;
                action = "liked";
            }

            // 5. Actualizar contador en la publicación (atómico)
            await ctx.db.patch(validatedData.postId as Id<"posts">, {
                likes_count: newLikesCount,
                updated_at: Date.now(),
            });

            return {
                success: true,
                action,
                likesCount: newLikesCount,
            };

        } catch (error) {
            console.error("Error togglin like:", error);

            let errorMessage = "Error desconocido";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "string") {
                errorMessage = error;
            }

            throw new Error(`Error al procesar like: ${errorMessage}`);
        }
    },
});