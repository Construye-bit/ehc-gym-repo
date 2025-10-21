import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
  listMyConversationsSchema,
  getConversationSchema,
  validateWithZod,
} from "./validations";
import { ConversationNotFoundError } from "./errors";
import { getCurrentUser, assertConversationParticipant } from "./utils";

/**
 * Listar conversaciones del usuario actual
 * Ordenadas por último mensaje descendente
 */
export const listMine = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Validar entrada
    const validatedData = validateWithZod(
      listMyConversationsSchema,
      args,
      "listMine"
    );
    const limit = validatedData.limit!;

    // 2. Obtener usuario autenticado
    const user = await getCurrentUser(ctx);

    // 3. Buscar conversaciones como cliente
    let clientConversationsQuery = ctx.db
      .query("conversations")
      .withIndex("by_client_last_message", (q) =>
        q.eq("client_user_id", user._id)
      )
      .order("desc");

    if (validatedData.cursor !== undefined) {
      clientConversationsQuery = clientConversationsQuery.filter((q) =>
        q.lt(q.field("last_message_at"), validatedData.cursor!)
      );
    }

    const clientConversations = await clientConversationsQuery.take(limit);

    // 4. Buscar conversaciones como trainer
    let trainerConversationsQuery = ctx.db
      .query("conversations")
      .withIndex("by_trainer_last_message", (q) =>
        q.eq("trainer_user_id", user._id)
      )
      .order("desc");

    if (validatedData.cursor !== undefined) {
      trainerConversationsQuery = trainerConversationsQuery.filter((q) =>
        q.lt(q.field("last_message_at"), validatedData.cursor!)
      );
    }

    const trainerConversations = await trainerConversationsQuery.take(limit);

    // 5. Combinar y ordenar todas las conversaciones
    const allConversations = [...clientConversations, ...trainerConversations]
      .sort((a, b) => b.last_message_at - a.last_message_at)
      .slice(0, limit);

    // 6. Enriquecer con datos del otro participante
    const enrichedConversations = await Promise.all(
      allConversations.map(async (conversation) => {
        const isClient = conversation.client_user_id === user._id;
        const otherUserId = isClient
          ? conversation.trainer_user_id
          : conversation.client_user_id;

        const otherUser = await ctx.db.get(otherUserId);
        const otherPerson = otherUser
          ? await ctx.db
              .query("persons")
              .withIndex("by_user", (q) => q.eq("user_id", otherUser._id))
              .first()
          : null;

        // Contar mensajes no leídos
        const unreadCount = await ctx.db
          .query("messages")
          .withIndex("by_conversation_status", (q) =>
            q.eq("conversation_id", conversation._id).eq("status", "SENT")
          )
          .filter((q) => q.neq(q.field("author_user_id"), user._id))
          .collect()
          .then((msgs) => msgs.length);

        return {
          ...conversation,
          other_participant: {
            user_id: otherUserId,
            name: otherPerson
              ? `${otherPerson.name} ${otherPerson.last_name}`
              : "Usuario",
            role: isClient ? "TRAINER" : "CLIENT",
          },
          unread_count: unreadCount,
          my_role: isClient ? "CLIENT" : "TRAINER",
        };
      })
    );

    // 7. Retornar con cursor de paginación
    return {
      conversations: enrichedConversations,
      nextCursor:
        allConversations.length === limit
          ? allConversations[allConversations.length - 1].last_message_at
          : null,
    };
  },
});

/**
 * Obtener detalles de una conversación específica
 */
export const get = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // 1. Validar entrada
    const validatedData = validateWithZod(getConversationSchema, args, "get");

    // 2. Obtener usuario autenticado
    const user = await getCurrentUser(ctx);

    // 3. Verificar que es participante
    const conversation = await assertConversationParticipant(
      ctx,
      validatedData.conversationId as Id<"conversations">,
      user._id
    );

    // 4. Determinar rol del usuario
    const isClient = conversation.client_user_id === user._id;
    const otherUserId = isClient
      ? conversation.trainer_user_id
      : conversation.client_user_id;

    // 5. Obtener datos del otro participante
    const otherUser = await ctx.db.get(otherUserId);
    const otherPerson = otherUser
      ? await ctx.db
          .query("persons")
          .withIndex("by_user", (q) => q.eq("user_id", otherUser._id))
          .first()
      : null;

    // 6. Obtener cuota de mensajes si es cliente
    let messageQuota = null;
    if (isClient) {
      messageQuota = await ctx.db
        .query("message_quotas")
        .withIndex("by_conversation", (q) =>
          q.eq("conversation_id", conversation._id)
        )
        .first();
    }

    // 7. Retornar información completa
    return {
      ...conversation,
      other_participant: {
        user_id: otherUserId,
        name: otherPerson
          ? `${otherPerson.name} ${otherPerson.last_name}`
          : "Usuario",
        role: isClient ? "TRAINER" : "CLIENT",
      },
      my_role: isClient ? "CLIENT" : "TRAINER",
      message_quota: messageQuota
        ? {
            used_count: messageQuota.used_count,
            remaining: Math.max(0, 20 - messageQuota.used_count),
            reset_at: messageQuota.reset_at,
          }
        : null,
    };
  },
});
