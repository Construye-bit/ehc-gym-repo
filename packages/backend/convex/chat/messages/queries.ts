import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getMessagesSchema, validateWithZod } from "./validations";
import {
  getCurrentUser,
  assertConversationParticipant,
} from "../conversations/utils";

/**
 * Obtener mensajes de una conversación (paginado)
 * Ordenados por fecha descendente (más recientes primero)
 */
export const get = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Validar entrada
    const validatedData = validateWithZod(getMessagesSchema, args, "get");
    const limit = validatedData.limit!;

    // 2. Obtener usuario autenticado
    const user = await getCurrentUser(ctx);

    // 3. Verificar que es participante
    await assertConversationParticipant(
      ctx,
      validatedData.conversationId as Id<"conversations">,
      user._id
    );

    // 4. Query de mensajes con paginación
    let messagesQuery = ctx.db
      .query("messages")
      .withIndex("by_conversation_created", (q) =>
        q.eq(
          "conversation_id",
          validatedData.conversationId as Id<"conversations">
        )
      )
      .order("desc");

    // Aplicar cursor si existe
    if (validatedData.cursor !== undefined) {
      messagesQuery = messagesQuery.filter((q) =>
        q.lt(q.field("created_at"), validatedData.cursor!)
      );
    }

    const messages = await messagesQuery.take(limit);

    // 5. Enriquecer mensajes con información del autor
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db.get(message.author_user_id);
        const authorPerson = author
          ? await ctx.db
              .query("persons")
              .withIndex("by_user", (q) => q.eq("user_id", author._id))
              .first()
          : null;

        return {
          ...message,
          author: {
            user_id: message.author_user_id,
            name: authorPerson
              ? `${authorPerson.name} ${authorPerson.last_name}`
              : "Usuario",
          },
          is_mine: message.author_user_id === user._id,
        };
      })
    );

    // 6. Retornar con cursor de paginación
    return {
      messages: enrichedMessages,
      nextCursor:
        messages.length === limit
          ? messages[messages.length - 1].created_at
          : null,
    };
  },
});
