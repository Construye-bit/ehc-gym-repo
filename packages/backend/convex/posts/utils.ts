import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { UnauthorizedPostActionError } from "./errors";

/**
 * Obtiene el usuario actual autenticado
 * Lanza error si no está autenticado
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new UnauthorizedPostActionError("No autenticado");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
    .unique();

  if (!user) {
    throw new UnauthorizedPostActionError("Usuario no encontrado");
  }

  return user;
}

/**
 * Verifica que el usuario tenga rol de TRAINER activo
 * Lanza error si no cumple
 */
export async function requireTrainerRole(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
) {
  const trainerRole = await ctx.db
    .query("role_assignments")
    .withIndex("by_user_role", (q) =>
      q.eq("user_id", userId).eq("role", "TRAINER")
    )
    .filter((q) => q.eq(q.field("active"), true))
    .first();

  if (!trainerRole) {
    throw new UnauthorizedPostActionError("Se requiere rol de TRAINER");
  }

  return trainerRole;
}

/**
 * Obtiene el registro de trainer asociado al usuario
 * Verifica que el trainer esté ACTIVE
 */
export async function getActiveTrainer(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
) {
  const trainer = await ctx.db
    .query("trainers")
    .withIndex("by_user", (q) => q.eq("user_id", userId))
    .filter((q) => q.eq(q.field("status"), "ACTIVE"))
    .first();

  if (!trainer) {
    throw new UnauthorizedPostActionError(
      "Entrenador no encontrado o inactivo"
    );
  }

  return trainer;
}

/**
 * Verifica que el usuario sea el creador de la publicación
 */
export async function requirePostOwnership(
  ctx: QueryCtx | MutationCtx,
  postId: Id<"posts">,
  userId: Id<"users">
) {
  const post = await ctx.db.get(postId);

  if (!post) {
    throw new UnauthorizedPostActionError("Publicación no encontrada");
  }

  if (post.user_id !== userId) {
    throw new UnauthorizedPostActionError(
      "Solo puedes editar tus propias publicaciones"
    );
  }

  return post;
}

/**
 * Genera URL pública de una imagen desde storage
 */
export async function getImageUrl(
  ctx: QueryCtx | MutationCtx,
  storageId: Id<"_storage"> | undefined
): Promise<string | undefined> {
  if (!storageId) return undefined;

  const url = await ctx.storage.getUrl(storageId);
  return url || undefined;
}
