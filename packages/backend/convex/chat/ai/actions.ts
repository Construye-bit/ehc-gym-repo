import { type ActionCtx, action } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { chatAgent } from "./index";
import type { Id } from "../../_generated/dataModel";

interface GenerateResponseResult {
    success: boolean;
    threadId: string;
    text: string;
    messageId?: string;
    usage?: unknown;
}

/**
 * Genera una respuesta del agente de forma asíncrona
 * El agente procesará el mensaje y generará una respuesta usando las tools disponibles
 */
export const generateResponse = action({
    args: {
        threadId: v.string(),
        prompt: v.string(),
        promptMessageId: v.optional(v.string()),
    },
    async handler(ctx: ActionCtx, args: { threadId: string; prompt: string; promptMessageId?: string }): Promise<GenerateResponseResult> {
        // Verificar autenticación
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // Obtener usuario actual
        const user = await ctx.runQuery(internal.users.getUserByClerkId, {
            clerk_id: identity.subject,
        }) as { _id: Id<"users"> } | null;

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        try {
            // Crear o continuar el thread
            const { thread } = await chatAgent.continueThread(ctx as any, {
                threadId: args.threadId,
                userId: user._id,
            }) as { thread: any };

            // Generar la respuesta del agente
            const result = await thread.generateText({
                prompt: args.prompt,
                promptMessageId: args.promptMessageId,
            }) as { text: string; messageId?: string; usage?: unknown };

            return {
                success: true,
                threadId: args.threadId,
                text: result.text,
                messageId: result.messageId,
                usage: result.usage,
            };
        } catch (error) {
            console.error("Error generating response:", error);
            throw new Error(
                `Error al generar respuesta: ${error instanceof Error ? error.message : "Error desconocido"}`
            );
        }
    },
});

interface StreamingResponseResult {
    success: boolean;
    threadId: string;
    messageId?: string;
}

/**
 * Genera una respuesta del agente con streaming
 * Permite mostrar la respuesta en tiempo real mientras se genera
 */
export const generateStreamingResponse = action({
    args: {
        threadId: v.string(),
        prompt: v.string(),
        promptMessageId: v.optional(v.string()),
    },
    async handler(ctx: ActionCtx, args: { threadId: string; prompt: string; promptMessageId?: string }): Promise<StreamingResponseResult> {
        // Verificar autenticación
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // Obtener usuario actual
        const user = await ctx.runQuery(internal.users.getUserByClerkId, {
            clerk_id: identity.subject,
        }) as { _id: Id<"users"> } | null;

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        try {
            // Crear o continuar el thread
            const { thread } = await chatAgent.continueThread(ctx as any, {
                threadId: args.threadId,
                userId: user._id,
            }) as { thread: any };

            // Generar la respuesta con streaming
            const result = await thread.streamText({
                prompt: args.prompt,
                promptMessageId: args.promptMessageId,
            }) as { messageId?: string };

            return {
                success: true,
                threadId: args.threadId,
                messageId: result.messageId,
                // El streaming se maneja en el cliente
            };
        } catch (error) {
            console.error("Error generating streaming response:", error);
            throw new Error(
                `Error al generar respuesta con streaming: ${error instanceof Error ? error.message : "Error desconocido"}`
            );
        }
    },
});

interface StartConversationResult {
    success: boolean;
    threadId: string;
    text: string;
    messageId?: string;
    usage?: unknown;
}

/**
 * Crea un nuevo thread y genera la primera respuesta
 * Útil para iniciar una nueva conversación
 */
export const startConversation = action({
    args: {
        prompt: v.string(),
        metadata: v.optional(
            v.object({
                title: v.optional(v.string()),
                description: v.optional(v.string()),
            })
        ),
    },
    async handler(ctx: ActionCtx, args: { prompt: string; metadata?: { title?: string; description?: string } }): Promise<StartConversationResult> {
        // Verificar autenticación
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // Obtener usuario actual
        const user = await ctx.runQuery(internal.users.getUserByClerkId, {
            clerk_id: identity.subject,
        }) as { _id: Id<"users"> } | null;

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        try {
            // Crear un nuevo thread
            const { thread } = await chatAgent.createThread(ctx as any, {
                userId: user._id,
            }) as { thread: any };

            // Generar la primera respuesta
            const result = await thread.generateText({
                prompt: args.prompt,
            }) as { text: string; messageId?: string; usage?: unknown };

            return {
                success: true,
                threadId: thread.threadId as string,
                text: result.text,
                messageId: result.messageId,
                usage: result.usage,
            };
        } catch (error) {
            console.error("Error starting conversation:", error);
            throw new Error(
                `Error al iniciar conversación: ${error instanceof Error ? error.message : "Error desconocido"}`
            );
        }
    },
});
