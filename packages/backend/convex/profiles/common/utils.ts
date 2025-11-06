// convex/profiles/common/utils.ts
import { ConvexError } from "convex/values";
// La ruta a _generated cambia porque estamos un nivel más adentro
import { MutationCtx, QueryCtx } from "../../_generated/server";
import { Doc } from "../../_generated/dataModel";

/**
 * Obtiene el usuario autenticado (tabla 'users') basado en la identidad de Clerk.
 * Lanza un error si no está autenticado o no se encuentra en la BD.
 */
export const getAuthenticatedUser = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ message: "UNAUTHORIZED", code: 401 });
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
    .unique();

  if (!user) {
    throw new ConvexError({ message: "Usuario no encontrado.", code: 404 });
  }
  return user;
};

/**
 * Verifica si un usuario tiene el rol de ADMIN o SUPER_ADMIN.
 * Lanza un error 403 (FORBIDDEN) si no lo tiene.
 * Retorna el usuario si tiene el rol.
 */
export const ensureAdmin = async (ctx: QueryCtx | MutationCtx) => {
  const user = await getAuthenticatedUser(ctx);

  const adminRole = await ctx.db
    .query("role_assignments")
    .withIndex("by_user_active", (q) =>
      q.eq("user_id", user._id).eq("active", true)
    )
    .filter((q) =>
      q.or(q.eq(q.field("role"), "ADMIN"), q.eq(q.field("role"), "SUPER_ADMIN"))
    )
    .first();

  if (!adminRole) {
    throw new ConvexError({ message: "FORBIDDEN", code: 403 });
  }
  return user;
};

/**
 * Obtiene los datos del CLIENTE autenticado (user, client, person).
 * Lanza un error 403 (FORBIDDEN) si el usuario no es un CLIENTE.
 */
export const getAuthenticatedClientData = async (
  ctx: QueryCtx | MutationCtx
) => {
  const user = await getAuthenticatedUser(ctx);

  const client = await ctx.db
    .query("clients")
    .withIndex("by_user", (q) => q.eq("user_id", user._id))
    .filter((q) => q.eq(q.field("active"), true))
    .unique();

  if (!client) {
    throw new ConvexError({
      message: "FORBIDDEN: Perfil de cliente no encontrado o inactivo.",
      code: 403,
    });
  }

  const person = await ctx.db.get(client.person_id);
  if (!person) {
    throw new ConvexError({
      message: "NOT_FOUND: Datos personales del cliente no encontrados.",
      code: 404,
    });
  }

  return { user, client, person };
};

/**
 * Obtiene los datos del TRAINER autenticado (user, trainer, person).
 * Lanza un error 403 (FORBIDDEN) si el usuario no es un TRAINER.
 */
export const getAuthenticatedTrainerData = async (
  ctx: QueryCtx | MutationCtx
) => {
  const user = await getAuthenticatedUser(ctx);

  const trainer = await ctx.db
    .query("trainers")
    .withIndex("by_user", (q) => q.eq("user_id", user._id))
    .filter((q) => q.eq(q.field("status"), "ACTIVE"))
    .unique();

  if (!trainer) {
    throw new ConvexError({
      message: "FORBIDDEN: Perfil de entrenador no encontrado o inactivo.",
      code: 403,
    });
  }

  const person = await ctx.db.get(trainer.person_id);
  if (!person) {
    throw new ConvexError({
      message: "NOT_FOUND: Datos personales del entrenador no encontrados.",
      code: 404,
    });
  }

  return { user, trainer, person };
};