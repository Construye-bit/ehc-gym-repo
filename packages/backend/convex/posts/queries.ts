import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Obtener feed de publicaciones (paginado)
 * Solo muestra publicaciones PUBLISHED no eliminadas
 */
export const getFeed = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()), // published_at para paginación
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const identity = await ctx.auth.getUserIdentity();
    
    // Query principal
    let postsQuery = ctx.db
      .query("posts")
      .withIndex("by_status_published", (q) => 
        q.eq("status", "PUBLISHED")
      )
      .filter((q) => q.eq(q.field("deleted_at"), undefined))
      .order("desc");

    // Aplicar cursor si existe
    if (args.cursor !== undefined) {
      postsQuery = postsQuery.filter((q) => 
        q.lt(q.field("published_at"), args.cursor!)
      );
    }

    const posts = await postsQuery.take(limit);

    // Enriquecer con datos del entrenador y like status
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        // Obtener entrenador
        const trainer = await ctx.db.get(post.trainer_id);
        const person = trainer ? await ctx.db.get(trainer.person_id) : null;

        // Verificar si el usuario actual dio like
        let user_has_liked = false;
        if (identity) {
          const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .unique();
          
          if (user) {
            const like = await ctx.db
              .query("post_likes")
              .withIndex("by_post_user", (q) => 
                q.eq("post_id", post._id).eq("user_id", user._id)
              )
              .unique();
            
            user_has_liked = !!like;
          }
        }

        return {
          ...post,
          trainer_name: person 
            ? `${person.name} ${person.last_name}` 
            : "Entrenador",
          trainer_specialties: trainer?.specialties || [],
          user_has_liked,
        };
      })
    );

    return {
      posts: enrichedPosts,
      next_cursor: posts.length === limit 
        ? posts[posts.length - 1].published_at 
        : null,
    };
  },
});

/**
 * Obtener publicaciones de un entrenador específico
 */
export const getTrainerPosts = query({
  args: {
    trainer_id: v.id("trainers"),
    include_drafts: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    let postsQuery = ctx.db
      .query("posts")
      .withIndex("by_trainer_status", (q) => 
        q.eq("trainer_id", args.trainer_id)
      )
      .filter((q) => q.eq(q.field("deleted_at"), undefined));

    // Si no es el creador, solo mostrar PUBLISHED
    if (!args.include_drafts || !identity) {
      postsQuery = postsQuery.filter((q) => 
        q.eq(q.field("status"), "PUBLISHED")
      );
    }

    const posts = await postsQuery.order("desc").collect();

    // Verificar likes del usuario actual
    let userLikes = new Set<string>();
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
        .unique();
      
      if (user) {
        const likes = await ctx.db
          .query("post_likes")
          .withIndex("by_user", (q) => q.eq("user_id", user._id))
          .collect();
        
        userLikes = new Set(likes.map(like => like.post_id));
      }
    }

    return posts.map(post => ({
      ...post,
      user_has_liked: userLikes.has(post._id),
    }));
  },
});

/**
 * Obtener una publicación específica
 */
export const getPost = query({
  args: {
    post_id: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    const post = await ctx.db.get(args.post_id);
    if (!post) return null;

    // Verificar permisos de visibilidad
    if (post.status !== "PUBLISHED" || post.deleted_at) {
      // Solo el creador puede ver borradores/archivados
      if (!identity) return null;
      
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
        .unique();
      
      if (!user || post.user_id !== user._id) return null;
    }

    // Enriquecer datos
    const trainer = await ctx.db.get(post.trainer_id);
    const person = trainer ? await ctx.db.get(trainer.person_id) : null;

    let user_has_liked = false;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
        .unique();
      
      if (user) {
        const like = await ctx.db
          .query("post_likes")
          .withIndex("by_post_user", (q) => 
            q.eq("post_id", post._id).eq("user_id", user._id)
          )
          .unique();
        
        user_has_liked = !!like;
      }
    }

    return {
      ...post,
      trainer_name: person 
        ? `${person.name} ${person.last_name}` 
        : "Entrenador",
      trainer_specialties: trainer?.specialties || [],
      user_has_liked,
    };
  },
});

/**
 * Obtener usuarios que dieron like a una publicación
 */
export const getPostLikes = query({
  args: {
    post_id: v.id("posts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const likes = await ctx.db
      .query("post_likes")
      .withIndex("by_post", (q) => q.eq("post_id", args.post_id))
      .order("desc")
      .take(limit);

    const usersWithLikes = await Promise.all(
      likes.map(async (like) => {
        const user = await ctx.db.get(like.user_id);
        return {
          like_id: like._id,
          user_id: like.user_id,
          user_name: user?.name || "Usuario",
          user_email: user?.email,
          liked_at: like.created_at,
        };
      })
    );

    return usersWithLikes;
  },
});