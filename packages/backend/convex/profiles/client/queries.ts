// packages/backend/convex/profiles/client/queries.ts
import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
    listHealthMetricsSchema,
    listProgressSchema,
    listMyContractsSchema,
    validateWithZod,
} from "./validations";
import {
    getCurrentUser,
    requireClientOwnershipOrAdmin,
    clampLimit,
    normalizeRange,
} from "../common/utils";

// Devuelve el perfil del CLIENT autenticado (DTO agregado)
export const getMyClientProfile = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);

        // Buscar client por user_id
        const client = await ctx.db
            .query("clients")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .first();

        if (!client) return null;

        // Person
        const person = await ctx.db
            .query("persons")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .first();

        // Preferences
        const preferences = await ctx.db
            .query("client_preferences")
            .withIndex("by_client", (q) => q.eq("client_id", client._id))
            .first();

        // Latest health metric
        const latestHealth = await ctx.db
            .query("client_health_metrics")
            .withIndex("by_client_measured", (q) =>
                q.eq("client_id", client._id).gte("measured_at", 0)
            )
            .order("desc")
            .first();

        // Active contracts
        const activeContracts = await ctx.db
            .query("client_trainer_contracts")
            .withIndex("by_client_status", (q) =>
                q.eq("client_id", client._id).eq("status", "ACTIVE")
            )
            .collect();

        return {
            person: person ?? null,
            client,
            preferences: preferences ?? null,
            latestHealth: latestHealth ?? null,
            activeContracts,
        };
    },
});

// Listar métricas de salud con ventana temporal y paginación por timestamp (cursor = último measured_at)
export const listHealthMetrics = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            listHealthMetricsSchema,
            args.payload,
            "listHealthMetrics"
        );
        const clientId = data.client_id as Id<"clients">;
        await requireClientOwnershipOrAdmin(ctx, clientId);

        const { from, to } = normalizeRange(data.from, data.to);
        const limit = clampLimit(data.limit, 50, 200);

        const q = ctx.db
            .query("client_health_metrics")
            .withIndex("by_client_measured", (q) =>
                q.eq("client_id", clientId).gte("measured_at", from)
            )
            .filter((qq) => qq.lte(qq.field("measured_at"), to))
            .order("asc");

        const items = await q.take(limit);
        const nextCursor = items.length === limit ? items[items.length - 1].measured_at : null;

        return { items, nextCursor };
    },
});

// Listar progreso con ventana temporal y paginación por timestamp (cursor = último recorded_at)
export const listProgress = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            listProgressSchema,
            args.payload,
            "listProgress"
        );
        const clientId = data.client_id as Id<"clients">;
        await requireClientOwnershipOrAdmin(ctx, clientId);

        const { from, to } = normalizeRange(data.from, data.to);
        const limit = clampLimit(data.limit, 50, 200);

        const q = ctx.db
            .query("client_progress")
            .withIndex("by_client_time", (q) =>
                q.eq("client_id", clientId).gte("recorded_at", from)
            )
            .filter((qq) => qq.lte(qq.field("recorded_at"), to))
            .order("asc");

        const items = await q.take(limit);
        const nextCursor = items.length === limit ? items[items.length - 1].recorded_at : null;

        return { items, nextCursor };
    },
});

// Listar contratos del cliente (opcionalmente por status)
export const listMyContracts = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            listMyContractsSchema,
            args.payload,
            "listMyContracts"
        );
        const clientId = data.client_id as Id<"clients">;
        await requireClientOwnershipOrAdmin(ctx, clientId);

        const limit = clampLimit(data.limit, 50, 200);

        if (data.status) {
            // Camino con índice cuando hay filtro por status
            const items = await ctx.db
                .query("client_trainer_contracts")
                .withIndex("by_client_status", (q) =>
                    q.eq("client_id", clientId).eq("status", data.status!)
                )
                .take(limit);

            return { items, nextCursor: null };
        } else {
            // Camino sin status: filtramos por client_id (sin withIndex para evitar choque de tipos)
            const items = await ctx.db
                .query("client_trainer_contracts")
                .filter((q) => q.eq(q.field("client_id"), clientId))
                .take(limit);

            return { items, nextCursor: null };
        }
    },
});
