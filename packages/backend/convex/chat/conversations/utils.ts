import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import {
  UnauthorizedConversationError,
  ConversationNotFoundError,
} from "./errors";

/**
 * Obtiene el usuario actual autenticado
 * Lanza error si no está autenticado
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new UnauthorizedConversationError("No autenticado");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
    .unique();

  if (!user) {
    throw new UnauthorizedConversationError("Usuario no encontrado");
  }

  return user;
}

/**
 * Verifica que el usuario sea cliente activo
 */
export async function requireClientRole(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
) {
  const clientRole = await ctx.db
    .query("role_assignments")
    .withIndex("by_user_role", (q) =>
      q.eq("user_id", userId).eq("role", "CLIENT")
    )
    .filter((q) => q.eq(q.field("active"), true))
    .first();

  if (!clientRole) {
    throw new UnauthorizedConversationError("Se requiere rol de CLIENTE");
  }

  return clientRole;
}

/**
 * Verifica que el usuario sea trainer activo
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
    throw new UnauthorizedConversationError("Se requiere rol de ENTRENADOR");
  }

  // Verificar que el trainer esté ACTIVE
  const trainer = await ctx.db
    .query("trainers")
    .withIndex("by_user", (q) => q.eq("user_id", userId))
    .filter((q) => q.eq(q.field("status"), "ACTIVE"))
    .first();

  if (!trainer) {
    throw new UnauthorizedConversationError(
      "Entrenador no encontrado o inactivo"
    );
  }

  return { role: trainerRole, trainer };
}

/**
 * Verifica que el usuario sea participante de la conversación
 */
export async function assertConversationParticipant(
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">,
  userId: Id<"users">
) {
  const conversation = await ctx.db.get(conversationId);

  if (!conversation) {
    throw new ConversationNotFoundError();
  }

  if (
    conversation.client_user_id !== userId &&
    conversation.trainer_user_id !== userId
  ) {
    throw new UnauthorizedConversationError(
      "No eres participante de esta conversación"
    );
  }

  return conversation;
}

/**
 * Verifica si un contrato está activo
 */
export function isContractActive(validUntil: number | undefined): boolean {
  if (!validUntil) return false;
  return validUntil > Date.now();
}

/**
 * Determina el rol del usuario en una conversación
 */
export function getUserRoleInConversation(
  conversation: { client_user_id: Id<"users">; trainer_user_id: Id<"users"> },
  userId: Id<"users">
): "CLIENT" | "TRAINER" | null {
  if (conversation.client_user_id === userId) return "CLIENT";
  if (conversation.trainer_user_id === userId) return "TRAINER";
  return null;
}