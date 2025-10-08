import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Toggle like en una publicación
 * Si ya existe like, lo remueve; si no existe, lo crea
 */
export const toggleLike = mutation({
  args: {
    post_id: v.id("posts"),
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

    // 2. Verificar que la publicación existe y está publicada
    const post = await ctx.db.get(args.post_id);
    if (!post) throw new Error("Publicación no encontrada");
    if (post.status !== "PUBLISHED") {
      throw new Error("No puedes dar like a publicaciones no publicadas");
    }
    if (post.deleted_at) {
      throw new Error("Publicación eliminada");
    }

    // 3. Verificar si ya existe like
    const existingLike = await ctx.db
      .query("post_likes")
      .withIndex("by_post_user", (q) => 
        q.eq("post_id", args.post_id).eq("user_id", user._id)
      )
      .unique();

    if (existingLike) {
      // UNLIKE: Remover like existente
      await ctx.db.delete(existingLike._id);
      
      // Decrementar contador
      await ctx.db.patch(args.post_id, {
        likes_count: Math.max(0, post.likes_count - 1),
        updated_at: Date.now(),
      });



      // Incrementar contador
      await ctx.db.patch(args.post_id, {
        likes_count: post.likes_count + 1,
        updated_at: Date.now(),
      });

    }
  },
});