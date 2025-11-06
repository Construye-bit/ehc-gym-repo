import { query } from "../../_generated/server";
import { getAuthenticatedClientData } from "../common/utils";
import {
  listHealthMetricsArgs,
  listProgressArgs,
  listMyContractsArgs,
} from "./validations";
import { Query } from "convex/server";
import { DataModel } from "../../_generated/dataModel";

/**
 * (Client) Obtiene el perfil del cliente autenticado.
 * Path: profiles/client/queries:getMyClientProfile
 * (ACTUALIZADO: Devuelve user y emergencyContact)
 */
export const getMyClientProfile = query({
  args: {}, // Sin payload
  handler: async (ctx) => {
    // 1. getAuthenticatedClientData nos da { user, client, person }
    const { user, client, person } = await getAuthenticatedClientData(ctx);

    // 2. Buscar preferencias
    const preferences = await ctx.db
      .query("client_preferences")
      .withIndex("by_client", (q) => q.eq("client_id", client._id))
      .first();

    // 3. Buscar última métrica de salud
    const latestHealth = await ctx.db
      .query("client_health_metrics")
      .withIndex("by_client_measured", (q) => q.eq("client_id", client._id))
      .order("desc")
      .first();

    // 4. *** NUEVO: Buscar contacto de emergencia activo ***
    const emergencyContact = await ctx.db
      .query("emergency_contact")
      .withIndex("by_person_active", (q) =>
        q.eq("person_id", person._id).eq("active", true)
      )
      .first();

    // 5. Retornar DTO completo
    return {
      user, // <-- Devuelto para el email
      person,
      client,
      preferences: preferences || null,
      latestHealth: latestHealth || null,
      emergencyContact: emergencyContact || null, // <-- Devuelto para el formulario
    };
  },
});

/* --- El resto de queries (listHealthMetrics, listProgress, listMyContracts) --- */
/* --- permanecen idénticas a la versión corregida anterior. --- */

/**
 * (Client) Lista las métricas de salud del cliente (paginado).
 * Path: profiles/client/queries:listHealthMetrics
 */
export const listHealthMetrics = query({
  args: listHealthMetricsArgs,
  handler: async (ctx, args) => {
    const { client } = await getAuthenticatedClientData(ctx);
    const from = args.payload?.from ?? 0;
    const to = args.payload?.to ?? Date.now();
    const limit = args.payload?.limit ?? 20;
    const results = await ctx.db
      .query("client_health_metrics")
      .withIndex("by_client_measured", (q) =>
        q
          .eq("client_id", client._id)
          .gte("measured_at", from)
          .lte("measured_at", to)
      )
      .order("desc")
      .paginate({ numItems: limit, cursor: args.payload?.cursor ?? null });
    return {
      items: results.page,
      nextCursor: results.isDone ? null : results.continueCursor,
    };
  },
});

/**
 * (Client) Lista el progreso del cliente (paginado).
 * Path: profiles/client/queries:listProgress
 */
export const listProgress = query({
  args: listProgressArgs,
  handler: async (ctx, args) => {
    const { client } = await getAuthenticatedClientData(ctx);
    const from = args.payload?.from ?? 0;
    const to = args.payload?.to ?? Date.now();
    const limit = args.payload?.limit ?? 20;
    const results = await ctx.db
      .query("client_progress")
      .withIndex("by_client_time", (q) =>
        q
          .eq("client_id", client._id)
          .gte("recorded_at", from)
          .lte("recorded_at", to)
      )
      .order("desc")
      .paginate({ numItems: limit, cursor: args.payload?.cursor ?? null });
    return {
      items: results.page,
      nextCursor: results.isDone ? null : results.continueCursor,
    };
  },
});

/**
 * (Client) Lista los contratos del cliente (paginado).
 * Path: profiles/client/queries:listMyContracts
 */
export const listMyContracts = query({
  args: listMyContractsArgs,
  handler: async (ctx, args) => {
    const { client } = await getAuthenticatedClientData(ctx);
    const limit = args.payload?.limit ?? 20;
    const status = args.payload?.status;

    let query: Query<DataModel["client_trainer_contracts"]>;

    if (status) {
      query = ctx.db
        .query("client_trainer_contracts")
        .withIndex("by_client_status", (q) =>
          q.eq("client_id", client._id).eq("status", status)
        );
    } else {
      query = ctx.db
        .query("client_trainer_contracts")
        .withIndex("by_client_status", (q) => q.eq("client_id", client._id));
    }
    const results = await query
      .order("desc")
      .paginate({ numItems: limit, cursor: args.payload?.cursor ?? null });
    return {
      items: results.page,
      nextCursor: results.isDone ? null : results.continueCursor,
    };
  },
});