import { query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import {
  getPostSchema,
  getPostsFeedSchema,
  getTrainerPostsSchema,
  validateWithZod,
} from "./validations";
import { PostNotFoundError } from "./errors";

/**
 * Obtener una publicación específica por ID
 * Incluye información del trainer y si el usuario actual dio like
 */
export const getPost = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // 1. Validar entrada
    const validatedData = validateWithZod(getPostSchema, args, "getPost");

    // 2. Obtener publicación
    const post = await ctx.db.get(validatedData.postId as Id<"posts">);

    if (!post || post.deleted_at) {
      throw new PostNotFoundError();
    }

    // 3. Obtener información del trainer
    const trainer = await ctx.db.get(post.trainer_id);
    const person = trainer ? await ctx.db.get(trainer.person_id) : null;

    // 4. Verificar si el usuario actual dio like
    let user_has_liked = false;
    const identity = await ctx.auth.getUserIdentity();

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

    // 5. Retornar publicación enriquecida
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
 * Obtener feed de publicaciones (paginado)
 * Ordenado por fecha de publicación descendente
 */
export const getPostsFeed = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Validar entrada con defaults
    const validatedData = validateWithZod(
      getPostsFeedSchema,
      args,
      "getPostsFeed"
    );
    const limit = validatedData.limit;

    // 2. Obtener usuario actual (si está autenticado)
    const identity = await ctx.auth.getUserIdentity();
    let currentUser = null;

    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
        .unique();
    }

    // 3. Query principal con paginación
    let postsQuery = ctx.db
      .query("posts")
      .withIndex("by_published")
      .filter((q) => q.eq(q.field("deleted_at"), undefined))
      .order("desc");

    // Aplicar cursor si existe
    if (validatedData.cursor !== undefined) {
      postsQuery = postsQuery.filter((q) =>
        q.lt(q.field("published_at"), validatedData.cursor!)
      );
    }

    const posts = await postsQuery.take(limit);

    // 4. Obtener likes del usuario actual (batch para evitar N+1)
    let userLikes = new Set<string>();
    if (currentUser) {
      const likes = await ctx.db
        .query("post_likes")
        .withIndex("by_user", (q) => q.eq("user_id", currentUser._id))
        .collect();

      userLikes = new Set(likes.map((like) => like.post_id));
    }

    // 5. Enriquecer publicaciones con información del trainer
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const trainer = await ctx.db.get(post.trainer_id);
        const person = trainer ? await ctx.db.get(trainer.person_id) : null;

        return {
          ...post,
          trainer_name: person
            ? `${person.name} ${person.last_name}`
            : "Entrenador",
          trainer_specialties: trainer?.specialties || [],
          user_has_liked: userLikes.has(post._id),
        };
      })
    );

    // 6. Retornar con cursor de paginación
    return {
      posts: enrichedPosts,
      nextCursor:
        posts.length === limit ? posts[posts.length - 1].published_at : null,
    };
  },
});

/**
 * Obtener publicaciones de un trainer específico (paginado)
 * Ordenado por fecha de creación descendente
 */
export const getTrainerPosts = query({
  args: {
    trainerId: v.id("trainers"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Validar entrada
    const validatedData = validateWithZod(
      getTrainerPostsSchema,
      args,
      "getTrainerPosts"
    );
    const limit = validatedData.limit;

    // 2. Verificar que el trainer existe
    const trainer = await ctx.db.get(validatedData.trainerId as Id<"trainers">);
    if (!trainer) {
      throw new Error("Entrenador no encontrado");
    }

    // 3. Obtener usuario actual (si está autenticado)
    const identity = await ctx.auth.getUserIdentity();
    let currentUser = null;

    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
        .unique();
    }

    // 4. Query de publicaciones del trainer con paginación
    let postsQuery = ctx.db
      .query("posts")
      .withIndex("by_trainer", (q) =>
        q.eq("trainer_id", validatedData.trainerId as Id<"trainers">)
      )
      .filter((q) => q.eq(q.field("deleted_at"), undefined))
      .order("desc");

    // Aplicar cursor si existe
    if (validatedData.cursor !== undefined) {
      postsQuery = postsQuery.filter((q) =>
        q.lt(q.field("published_at"), validatedData.cursor!)
      );
    }

    const posts = await postsQuery.take(limit);

    // 5. Obtener likes del usuario actual
    let userLikes = new Set<string>();
    if (currentUser) {
      const likes = await ctx.db
        .query("post_likes")
        .withIndex("by_user", (q) => q.eq("user_id", currentUser._id))
        .collect();

      userLikes = new Set(likes.map((like) => like.post_id));
    }

    // 6. Enriquecer publicaciones
    const person = await ctx.db.get(trainer.person_id);
    const trainerName = person
      ? `${person.name} ${person.last_name}`
      : "Entrenador";

    const enrichedPosts = posts.map((post) => ({
      ...post,
      trainer_name: trainerName,
      trainer_specialties: trainer.specialties || [],
      user_has_liked: userLikes.has(post._id),
    }));

    // 7. Retornar con cursor de paginación
    return {
      posts: enrichedPosts,
      nextCursor:
        posts.length === limit ? posts[posts.length - 1].published_at : null,
    };
  },
});

/**
 * Obtener detalles completos de una publicación
 * Incluye toda la información del trainer y estadísticas
 */
export const getPostDetails = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // 1. Obtener publicación
    const post = await ctx.db.get(args.postId);

    if (!post || post.deleted_at) {
      throw new PostNotFoundError();
    }

    // 2. Obtener información completa del trainer
    const trainer = await ctx.db.get(post.trainer_id);
    if (!trainer) {
      throw new Error("Entrenador no encontrado");
    }

    const person = await ctx.db.get(trainer.person_id);
    const user = person ? await ctx.db.get(person.user_id) : null;
    const branch = trainer.branch_id
      ? await ctx.db.get(trainer.branch_id)
      : null;

    // 3. Verificar si el usuario actual dio like
    let user_has_liked = false;
    const identity = await ctx.auth.getUserIdentity();

    if (identity) {
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
        .unique();

      if (currentUser) {
        const like = await ctx.db
          .query("post_likes")
          .withIndex("by_post_user", (q) =>
            q.eq("post_id", post._id).eq("user_id", currentUser._id)
          )
          .unique();

        user_has_liked = !!like;
      }
    }

    // 4. Retornar información completa
    return {
      ...post,
      trainer: {
        _id: trainer._id,
        employee_code: trainer.employee_code,
        specialties: trainer.specialties,
        status: trainer.status,
      },
      person: person
        ? {
            name: person.name,
            last_name: person.last_name,
          }
        : null,
      user: user
        ? {
            name: user.name,
            email: user.email,
          }
        : null,
      branch: branch
        ? {
            name: branch.name,
          }
        : null,
      user_has_liked,
    };
  },
});
