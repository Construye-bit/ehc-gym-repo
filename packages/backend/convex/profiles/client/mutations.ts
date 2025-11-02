import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
    upsertClientPreferencesSchema,
    addHealthMetricSchema,
    addProgressSchema,
    updateMyPhoneSchema,
    validateWithZod,
} from "./validations";

import {
    getCurrentUser,
    requireClientOwnershipOrAdmin,
    rateLimitRecentWrites,
} from "../common/utils";

// Upsert de preferencias del cliente
export const upsertClientPreferences = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            upsertClientPreferencesSchema,
            args.payload,
            "upsertClientPreferences"
        );
        const clientId = data.client_id as Id<"clients">;

        // Dueño (CLIENT) o ADMIN de su branch (o SA)
        await requireClientOwnershipOrAdmin(ctx, clientId);

        // ¿Existe registro de preferencias?
        const existing = await ctx.db
            .query("client_preferences")
            .withIndex("by_client", (q) => q.eq("client_id", clientId))
            .first();

        const now = Date.now();
        if (existing) {
            await ctx.db.patch(existing._id, {
                preferred_time_range: data.preferred_time_range,
                routine_type: data.routine_type,
                goal: data.goal,
                notes: data.notes,
                updated_at: now,
            });
            return existing._id;
        } else {
            const id = await ctx.db.insert("client_preferences", {
                client_id: clientId,
                preferred_time_range: data.preferred_time_range,
                routine_type: data.routine_type,
                goal: data.goal,
                notes: data.notes,
                created_at: now,
                updated_at: now,
            });
            return id;
        }
    },
});

// Agregar métrica de salud (rate limit simple)
export const addHealthMetric = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            addHealthMetricSchema,
            args.payload,
            "addHealthMetric"
        );
        const clientId = data.client_id as Id<"clients">;

        await requireClientOwnershipOrAdmin(ctx, clientId);

        const user = await getCurrentUser(ctx);
        // Rate limit: 10 escrituras / 60s por usuario
        await rateLimitRecentWrites(ctx, {
            table: "client_health_metrics",
            userId: user._id,
            windowMs: 60_000,
            max: 10,
        });

        const now = Date.now();
        const id = await ctx.db.insert("client_health_metrics", {
            client_id: clientId,
            measured_at: data.measured_at,
            weight_kg: data.weight_kg,
            height_cm: data.height_cm,
            bmi: data.bmi,
            body_fat_pct: data.body_fat_pct,
            notes: data.notes,
            created_by_user_id: user._id,
            created_at: now,
            updated_at: now,
        });
        return id;
    },
});

// Agregar progreso/hito (rate limit simple)
export const addProgress = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            addProgressSchema,
            args.payload,
            "addProgress"
        );
        const clientId = data.client_id as Id<"clients">;

        await requireClientOwnershipOrAdmin(ctx, clientId);

        const user = await getCurrentUser(ctx);
        await rateLimitRecentWrites(ctx, {
            table: "client_progress",
            userId: user._id,
            windowMs: 60_000,
            max: 10,
        });

        const now = Date.now();
        const id = await ctx.db.insert("client_progress", {
            client_id: clientId,
            kind: data.kind,
            metric_key: data.metric_key,
            metric_value: data.metric_value,
            title: data.title,
            description: data.description,
            recorded_at: data.recorded_at,
            created_by_user_id: user._id,
            created_at: now,
            updated_at: now,
        });
        return id;
    },
});
// Actualizar phone en persons (propio trainer o ADMIN/SA)
export const updateMyPhone = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            updateMyPhoneSchema,
            args.payload,
            "updateMyPhone"
        );
        const client_id = data.client_id as Id<"clients">;

        await requireClientOwnershipOrAdmin(ctx, client_id);

        const trainer = await ctx.db.get(client_id);
        if (!trainer) throw new Error("Entrenador no encontrado.");

        const person = await ctx.db.get(trainer.person_id as Id<"persons">);
        if (!person) throw new Error("Persona no encontrada para el entrenador.");

        const now = Date.now();
        await ctx.db.patch(person._id, {
            phone: data.phone,
            updated_at: now,
        });
        return person._id;
    },
});
