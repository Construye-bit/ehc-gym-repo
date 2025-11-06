// convex/health_metrics/queries.ts
import { ConvexError, v } from "convex/values";
import { QueryCtx, query } from "../_generated/server";

/**
 * Helper para obtener el usuario autenticado (versión para Queries)
 */
const getAuthenticatedUser = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null; // En queries, es mejor no lanzar error, solo devolver null/vacío
  }
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
    .unique();
};

/**
 * Obtiene todos los registros de métricas de salud para un cliente específico.
 * Ordenados por fecha de medición (más reciente primero).
 */
export const getMetricsForClient = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return []; // No autenticado, devuelve array vacío
    }

    // Opcional: Validar permisos.
    // (¿El 'user' actual es el cliente 'client_id' o su entrenador?)
    // Por simplicidad, si está autenticado, puede verlos.

    return await ctx.db
      .query("client_health_metrics")
      .withIndex("by_client_measured", (q) =>
        q.eq("client_id", args.client_id)
      )
      .order("desc") // 'desc' para que 'measured_at' más reciente aparezca primero
      .collect();
  },
});

/**
 * Obtiene el registro de métrica de salud MÁS RECIENTE para un cliente.
 * Útil para dashboards.
 */
export const getLatestMetricForClient = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    // Usamos el mismo índice y orden, pero solo tomamos el primero (first())
    const latestMetric = await ctx.db
      .query("client_health_metrics")
      .withIndex("by_client_measured", (q) =>
        q.eq("client_id", args.client_id)
      )
      .order("desc")
      .first(); // .first() devuelve el primer elemento o null

    return latestMetric;
  },
});

/**
 * Obtiene una métrica de salud específica por su ID.
 */
export const getMetricById = query({
  args: { metric_id: v.id("client_health_metrics") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const metric = await ctx.db.get(args.metric_id);

    // Opcional: Validar permisos (¿puede este usuario ver esta métrica?)

    return metric;
  },
});