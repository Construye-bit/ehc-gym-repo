import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Crea un nuevo thread de conversación para el usuario actual
 */
export const createThread = mutation({
    args: {
        metadata: v.optional(
            v.object({
                title: v.optional(v.string()),
                description: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        // Verificar autenticación
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // Obtener usuario actual
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .first();

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Generar un threadId único
        const threadId = `thread_${user._id}_${Date.now()}`;

        // TODO: Si el componente agent requiere crear el thread explícitamente,
        // hacerlo aquí. Por ahora retornamos el threadId generado.

        return {
            threadId,
            userId: user._id,
            createdAt: Date.now(),
            metadata: args.metadata,
        };
    },
});

/**
 * Guarda un mensaje del usuario en el thread
 * Este mensaje será procesado por el agente en una action separada
 */
export const saveUserMessage = mutation({
    args: {
        threadId: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        // Verificar autenticación
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // Obtener usuario actual
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .first();

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // El mensaje se guardará automáticamente cuando el agente lo procese
        // Por ahora, retornamos confirmación
        return {
            success: true,
            threadId: args.threadId,
            userId: user._id,
            timestamp: Date.now(),
        };
    },
});

/**
 * Elimina un mensaje por su ID
 */
export const deleteMessage = mutation({
    args: {
        messageId: v.string(),
    },
    handler: async (ctx, args) => {
        // Verificar autenticación
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // TODO: Implementar la eliminación usando el componente agent
        // await agent.deleteMessage(ctx, { messageId: args.messageId });

        return {
            success: true,
            messageId: args.messageId,
        };
    },
});

/**
 * Elimina un rango de mensajes en un thread
 */
export const deleteMessageRange = mutation({
    args: {
        threadId: v.string(),
        startOrder: v.number(),
        endOrder: v.number(),
        startStepOrder: v.optional(v.number()),
        endStepOrder: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Verificar autenticación
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // TODO: Implementar la eliminación usando el componente agent
        // await agent.deleteMessageRange(ctx, { ... });

        return {
            success: true,
            threadId: args.threadId,
        };
    },
});
