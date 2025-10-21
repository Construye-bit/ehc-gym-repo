import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
  createOrGetConversationSchema,
  markContractSchema,
  validateWithZod,
} from "./validations";
import {
  ConversationNotFoundError,
  UnauthorizedConversationError,
  InvalidContractError,
} from "./errors";
import {
  getCurrentUser,
  requireClientRole,
  requireTrainerRole,
  assertConversationParticipant,
} from "./utils";

/**
 * Crear o reusar conversación entre cliente y entrenador
 * Solo clientes pueden iniciar conversaciones
 */
export const createOrGet = mutation({
  args: {
    trainerId: v.id("trainers"),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    data: {
      conversationId: Id<"conversations">;
      isNew: boolean;
      message: string;
    };
  }> => {
    try {
      // 1. Validar datos de entrada
      const validatedData = validateWithZod(
        createOrGetConversationSchema,
        args,
        "createOrGet"
      );

      // 2. Obtener usuario autenticado
      const user = await getCurrentUser(ctx);

      // 3. Verificar que tiene rol de CLIENTE
      await requireClientRole(ctx, user._id);

      // 4. Obtener trainer y su user_id
      const trainer = await ctx.db.get(
        validatedData.trainerId as Id<"trainers">
      );
      if (!trainer) {
        throw new Error("Entrenador no encontrado");
      }

      if (trainer.status !== "ACTIVE") {
        throw new Error("El entrenador no está disponible");
      }

      if (!trainer.user_id) {
        throw new Error("El entrenador no tiene cuenta de usuario");
      }

      // 5. Buscar conversación existente
      const existingConversation = await ctx.db
        .query("conversations")
        .withIndex("by_client_trainer", (q) =>
          q
            .eq("client_user_id", user._id)
            .eq("trainer_user_id", trainer.user_id!)
        )
        .first();

      // 6. Si existe, retornarla
      if (existingConversation) {
        return {
          success: true,
          data: {
            conversationId: existingConversation._id,
            isNew: false,
            message: "Conversación existente recuperada",
          },
        };
      }

      // 7. Si no existe, crear nueva conversación
      const now = Date.now();
      const conversationId = await ctx.db.insert("conversations", {
        client_user_id: user._id,
        trainer_user_id: trainer.user_id,
        status: "OPEN",
        last_message_at: now,
        created_at: now,
        updated_at: now,
      });

      return {
        success: true,
        data: {
          conversationId,
          isNew: true,
          message: "Conversación creada exitosamente",
        },
      };
    } catch (error) {
      console.error("Error in createOrGet:", error);

      if (
        error instanceof UnauthorizedConversationError ||
        error instanceof Error
      ) {
        throw error;
      }

      throw new Error("Error al crear o recuperar conversación");
    }
  },
});

/**
 * Marcar contrato en conversación
 * Solo el entrenador puede marcar contratos
 */
export const markContract = mutation({
  args: {
    conversationId: v.id("conversations"),
    valid_until: v.number(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      // 1. Validar datos de entrada
      const validatedData = validateWithZod(
        markContractSchema,
        args,
        "markContract"
      );

      // 2. Obtener usuario autenticado
      const user = await getCurrentUser(ctx);

      // 3. Verificar que tiene rol de TRAINER
      await requireTrainerRole(ctx, user._id);

      // 4. Verificar que es participante de la conversación
      const conversation = await assertConversationParticipant(
        ctx,
        validatedData.conversationId as Id<"conversations">,
        user._id
      );

      // 5. Verificar que el usuario es el TRAINER de la conversación
      if (conversation.trainer_user_id !== user._id) {
        throw new UnauthorizedConversationError(
          "Solo el entrenador puede marcar contratos"
        );
      }

      // 6. Validar que la fecha es futura
      const now = Date.now();
      if (validatedData.valid_until <= now) {
        throw new InvalidContractError(
          "La fecha de expiración debe ser futura"
        );
      }

      // 7. Actualizar conversación
      await ctx.db.patch(validatedData.conversationId as Id<"conversations">, {
        status: "CONTRACTED",
        contract_valid_until: validatedData.valid_until,
        updated_at: now,
      });

      return {
        success: true,
        message: "Contrato marcado exitosamente",
      };
    } catch (error) {
      console.error("Error in markContract:", error);

      if (
        error instanceof UnauthorizedConversationError ||
        error instanceof InvalidContractError ||
        error instanceof ConversationNotFoundError
      ) {
        throw error;
      }

      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(`Error al marcar contrato: ${errorMessage}`);
    }
  },
});
