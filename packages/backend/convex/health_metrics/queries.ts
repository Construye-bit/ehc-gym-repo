import { query } from "../_generated/server";
import { listHealthMetricsValidator } from "./validations";

// ==========================================
// QUERY: listHealthMetrics
// Lista las métricas de salud del cliente con paginación
// ==========================================
export const listHealthMetrics = query({
  args: listHealthMetricsValidator,
  handler: async (ctx, { payload }) => {
    // 1. Verificar autenticación
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("UNAUTHORIZED: Debes estar autenticado");
    }

    // 2. Obtener user_id desde clerk_id
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .unique();

    if (!user) {
      throw new Error("NOT_FOUND: Usuario no encontrado");
    }

    // 3. Verificar que el usuario tenga rol CLIENT
    const clientRole = await ctx.db
      .query("role_assignments")
      .withIndex("by_user_role", (q) =>
        q.eq("user_id", user._id).eq("role", "CLIENT")
      )
      .filter((q) => q.eq(q.field("active"), true))
      .unique();

    if (!clientRole) {
      throw new Error("FORBIDDEN: Solo clientes pueden ver sus métricas");
    }

    // 4. Obtener el cliente
    const client = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .filter((q) => q.eq(q.field("active"), true))
      .unique();

    if (!client) {
      throw new Error("NOT_FOUND: Cliente no encontrado");
    }

    // 5. Parámetros de paginación
    const limit = payload?.limit || 20;
    const cursor = payload?.cursor || 0;
    const from = payload?.from || 0;
    const to = payload?.to || Date.now() + 86400000; // +1 día para incluir hoy

    // 6. Query con filtros y paginación
    let metricsQuery = ctx.db
      .query("client_health_metrics")
      .withIndex("by_client_measured", (q) => q.eq("client_id", client._id))
      .filter((q) =>
        q.and(
          q.gte(q.field("measured_at"), from),
          q.lte(q.field("measured_at"), to),
          q.lt(q.field("measured_at"), cursor === 0 ? to : cursor)
        )
      )
      .order("desc") // Más recientes primero
      .take(limit + 1); // +1 para saber si hay más páginas

    const metrics = await metricsQuery;

    // 7. Determinar si hay más páginas
    const hasMore = metrics.length > limit;
    const items = hasMore ? metrics.slice(0, limit) : metrics;
    const nextCursor = hasMore ? items[items.length - 1].measured_at : null;

    return {
      status: "success",
      value: {
        items,
        nextCursor,
      },
    };
  },
});

// ==========================================
// QUERY: getMyClientProfile (ACTUALIZADO)
// Incluye contacto de emergencia
// ==========================================
export const getMyClientProfile = query({
  args: {},
  handler: async (ctx) => {
    // 1. Verificar autenticación
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("UNAUTHORIZED: Debes estar autenticado");
    }

    // 2. Obtener user_id desde clerk_id
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .unique();

    if (!user) {
      throw new Error("NOT_FOUND: Usuario no encontrado");
    }

    // 3. Verificar que el usuario tenga rol CLIENT
    const clientRole = await ctx.db
      .query("role_assignments")
      .withIndex("by_user_role", (q) =>
        q.eq("user_id", user._id).eq("role", "CLIENT")
      )
      .filter((q) => q.eq(q.field("active"), true))
      .unique();

    if (!clientRole) {
      throw new Error("FORBIDDEN: Solo clientes pueden ver su perfil");
    }

    // 4. Obtener datos del cliente
    const client = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .filter((q) => q.eq(q.field("active"), true))
      .unique();

    if (!client) {
      return {
        status: "success",
        value: {
          person: null,
          client: null,
          preferences: null,
          latestHealth: null,
          emergencyContact: null,
        },
      };
    }

    // 5. Obtener persona
    const person = await ctx.db.get(client.person_id);

    // 6. Obtener preferencias
    const preferences = await ctx.db
      .query("client_preferences")
      .withIndex("by_client", (q) => q.eq("client_id", client._id))
      .unique();

    // 7. Obtener última métrica de salud
    const latestHealth = await ctx.db
      .query("client_health_metrics")
      .withIndex("by_client_measured", (q) => q.eq("client_id", client._id))
      .order("desc")
      .first();

    // 8. Obtener contacto de emergencia
    const emergencyContact = person
      ? await ctx.db
          .query("emergency_contact")
          .withIndex("by_person_active", (q) =>
            q.eq("person_id", person._id).eq("active", true)
          )
          .unique()
      : null;

    return {
      status: "success",
      value: {
        person,
        client,
        preferences,
        latestHealth,
        emergencyContact,
      },
    };
  },
});