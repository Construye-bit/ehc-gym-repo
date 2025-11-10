import { query } from "../../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { listUIMessages } from "@convex-dev/agent";
import { components } from "../../_generated/api";

/**
 * Lista los mensajes de un thread con formato UIMessage
 * Soporta paginación y streaming
 */
export const listThreadMessages = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
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

        // TODO: Verificar que el usuario tenga acceso a este thread
        // Por ahora, permitimos el acceso si está autenticado

        const paginated = await listUIMessages(ctx, components.agent, args);

        return paginated;
    },
});

/**
 * Obtiene los metadatos de un thread
 */
export const getThread = query({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        // Verificar autenticación
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // Obtener el thread del componente agent
        // Nota: Esto depende de cómo el componente agent exponga los threads
        // Por ahora retornamos el threadId como confirmación
        return {
            threadId: args.threadId,
            // Se pueden agregar más campos según la implementación del componente
        };
    },
});

/**
 * Lista todos los threads del usuario actual
 * Útil para mostrar un historial de conversaciones
 */
export const listUserThreads = query({
    args: {
        paginationOpts: paginationOptsValidator,
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

        // TODO: Implementar la lógica para listar threads del usuario
        // Esto dependerá de cómo se almacenan los threads en el componente agent
        return {
            page: [],
            isDone: true,
            continueCursor: "",
        };
    },
});
