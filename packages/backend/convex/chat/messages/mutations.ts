import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { sendMessageSchema, markAsReadSchema, validateWithZod } from "./validations";
import {
  MessageBlockedError,
  FreeMessagesExhaustedError,
  InvalidMessageError,
} from "./errors";
import { getCurrentUser, assertConversationParticipant } from "../conversations/utils";
import { getOrCreateQuota, incrementQuota, isContractActive } from "./utils";

/**
 * Enviar mensaje en una conversación
 * Valida bloqueos, cuotas y contratos
 */
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    data: {
      messageId: Id<"messages">;
      message: string;
    };
  }> => {
    try {
      // 1. Validar datos de entrada
      const validatedData = validateWithZod(sendMessageSchema, args, "send");

      // 2. Obtener usuario autenticado
      const user = await getCurrentUser(ctx);

      // 3. Verificar que es participante de la conversación
      const conversation = await assertConversationParticipant(
        ctx,
        validatedData.conversationId as Id<"conversations">,
        user._id
      );

      // 4. Verificar si la conversación está bloqueada
      if (conversation.status === "BLOCKED") {
        throw new MessageBlockedError(
          "La conversación está bloqueada. Has agotado tus mensajes gratuitos."
        );
      }

      // 5. Determinar rol del usuario
      const isClient = conversation.client_user_id === user._id;
      const isTrainer = conversation.trainer_user_id === user._id;

      // 6. ENTRENADORES: pueden enviar siempre
      if (isTrainer) {
        const now = Date.now();
        const messageId = await ctx.db.insert("messages", {
          conversation_id: conversation._id,
          author_user_id: user._id,
          text: validatedData.text,
          status: "SENT",
          created_at: now,
        });

        // Actualizar conversación
        await ctx.db.patch(conversation._id, {
          last_message_at: now,
          last_message_text: validatedData.text.substring(0, 100),
          updated_at: now,
        });

        return {
          success: true,
          data: {
            messageId,
            message: "Mensaje enviado exitosamente",
          },
        };
      }

      // 7. CLIENTES: verificar contratos y cuotas
      if (isClient) {
        // 7.1. Verificar si tiene contrato activo
        const hasActiveContract = isContractActive(
          conversation.contract_valid_until
        );

        if (hasActiveContract) {
          // Cliente con contrato activo: puede enviar
          const now = Date.now();
          const messageId = await ctx.db.insert("messages", {
            conversation_id: conversation._id,
            author_user_id: user._id,
            text: validatedData.text,
            status: "SENT",
            created_at: now,
          });

          // Actualizar conversación
          await ctx.db.patch(conversation._id, {
            last_message_at: now,
            last_message_text: validatedData.text.substring(0, 100),
            updated_at: now,
          });

          return {
            success: true,
            data: {
              messageId,
              message: "Mensaje enviado exitosamente",
            },
          };
        }

        // 7.2. Cliente sin contrato: verificar cuota
        const quota = await getOrCreateQuota(ctx, conversation._id);

        if (quota.used_count >= 20) {
          // Agotó mensajes gratuitos: bloquear conversación
          await ctx.db.patch(conversation._id, {
            status: "BLOCKED",
            updated_at: Date.now(),
          });

          throw new FreeMessagesExhaustedError();
        }

        // 7.3. Cliente con mensajes disponibles: enviar
        const now = Date.now();
        const messageId = await ctx.db.insert("messages", {
          conversation_id: conversation._id,
          author_user_id: user._id,
          text: validatedData.text,
          status: "SENT",
          created_at: now,
        });

        // Incrementar cuota
        await incrementQuota(ctx, quota._id);

        // Actualizar conversación
        await ctx.db.patch(conversation._id, {
          last_message_at: now,
          last_message_text: validatedData.text.substring(0, 100),
          updated_at: now,
        });

        return {
          success: true,
          data: {
            messageId,
            message: "Mensaje enviado exitosamente",
          },
        };
      }

      throw new Error("Rol no reconocido");
    } catch (error) {
      console.error("Error in send:", error);

      if (
        error instanceof MessageBlockedError ||
        error instanceof FreeMessagesExhaustedError ||
        error instanceof InvalidMessageError
      ) {
        throw error;
      }

      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(`Error al enviar mensaje: ${errorMessage}`);
    }
  },
});

/**
 * Marcar mensajes como leídos en una conversación
 */
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    updatedCount: number;
  }> => {
    try {
      // 1. Validar datos de entrada
      const validatedData = validateWithZod(markAsReadSchema, args, "markAsRead");

      // 2. Obtener usuario autenticado
      const user = await getCurrentUser(ctx);

      // 3. Verificar que es participante
      await assertConversationParticipant(
        ctx,
        validatedData.conversationId as Id<"conversations">,
        user._id
      );

      // 4. Obtener mensajes no leídos del otro usuario
      const unreadMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversation_status", (q) =>
          q
            .eq("conversation_id", validatedData.conversationId as Id<"conversations">)
            .eq("status", "SENT")
        )
        .filter((q) => q.neq(q.field("author_user_id"), user._id))
        .collect();

      // 5. Marcar como leídos
      const now = Date.now();
      await Promise.all(
        unreadMessages.map((msg) =>
          ctx.db.patch(msg._id, {
            status: "READ",
            read_at: now,
          })
        )
      );

      // 6. Actualizar timestamp de lectura en conversación
      const conversation = await ctx.db.get(
        validatedData.conversationId as Id<"conversations">
      );
      const isClient = conversation?.client_user_id === user._id;

      await ctx.db.patch(validatedData.conversationId as Id<"conversations">, {
        ...(isClient
          ? { client_last_read_at: now }
          : { trainer_last_read_at: now }),
        updated_at: now,
      });

      return {
        success: true,
        updatedCount: unreadMessages.length,
      };
    } catch (error) {
      console.error("Error in markAsRead:", error);

      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(`Error al marcar mensajes como leídos: ${errorMessage}`);
    }
  },
});