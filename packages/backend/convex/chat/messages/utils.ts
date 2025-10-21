import { MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

/**
 * Obtener o crear cuota de mensajes para una conversación
 */
export async function getOrCreateQuota(
  ctx: MutationCtx,
  conversationId: Id<"conversations">
) {
  let quota = await ctx.db
    .query("message_quotas")
    .withIndex("by_conversation", (q) => q.eq("conversation_id", conversationId))
    .first();

  if (!quota) {
    const now = Date.now();
    const resetAt = now + 30 * 24 * 60 * 60 * 1000; // 30 días

    const quotaId = await ctx.db.insert("message_quotas", {
      conversation_id: conversationId,
      used_count: 0,
      reset_at: resetAt,
      created_at: now,
      updated_at: now,
    });

    quota = await ctx.db.get(quotaId);
  }

  return quota!;
}

/**
 * Incrementar contador de mensajes usados
 */
export async function incrementQuota(
  ctx: MutationCtx,
  quotaId: Id<"message_quotas">
) {
  const quota = await ctx.db.get(quotaId);
  if (!quota) return;

  await ctx.db.patch(quotaId, {
    used_count: quota.used_count + 1,
    updated_at: Date.now(),
  });
}

/**
 * Verificar si un contrato está activo
 */
export function isContractActive(validUntil: number | undefined): boolean {
  if (!validUntil) return false;
  return validUntil > Date.now();
}