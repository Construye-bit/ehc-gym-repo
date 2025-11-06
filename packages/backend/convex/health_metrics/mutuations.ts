// convex/health_metrics/mutations.ts
import { ConvexError, v } from "convex/values";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  mutation,
} from "../_generated/server";
import {
  createHealthMetricArgs,
  updateHealthMetricArgs,
  deleteHealthMetricArgs,
} from "./validations";

// --- Helpers ---

/**
 * Helper para obtener el usuario autenticado (basado en tu schema 'users')
 */
const getAuthenticatedUser = async (ctx: MutationCtx | QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Usuario no autenticado.");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
    .unique();

  if (!user) {
    throw new ConvexError("Usuario no encontrado en la base de datos.");
  }
  return user;
};

/**
 * Función auxiliar para calcular el Índice de Masa Corporal (IMC).
 * Fórmula: peso (kg) / (altura (m))^2
 */
const calculateBMI = (
  weight_kg?: number,
  height_cm?: number
): number | undefined => {
  if (weight_kg && height_cm && height_cm > 0) {
    const height_m = height_cm / 100;
    // Redondeamos a 2 decimales
    return Math.round((weight_kg / (height_m * height_m)) * 100) / 100;
  }
  return undefined;
};

// --- Mutaciones ---

/**
 * Crea un nuevo registro de métrica de salud para un cliente.
 * Calcula el IMC automáticamente.
 */
export const create = mutation({
  args: createHealthMetricArgs,
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const now = Date.now();

    // Calcular el IMC basado en los argumentos proporcionados
    const bmi = calculateBMI(args.weight_kg, args.height_cm);

    const metric_id = await ctx.db.insert("client_health_metrics", {
      client_id: args.client_id,
      measured_at: args.measured_at,
      weight_kg: args.weight_kg,
      height_cm: args.height_cm,
      body_fat_pct: args.body_fat_pct,
      notes: args.notes,
      bmi: bmi, // Almacenamos el IMC calculado
      created_by_user_id: user._id, // Guardamos quién creó el registro
      created_at: now,
      updated_at: now,
    });

    return metric_id;
  },
});

/**
 * Actualiza un registro de métrica de salud existente.
 * Recalcula el IMC si el peso o la altura cambian.
 */
export const update = mutation({
  args: updateHealthMetricArgs,
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx); // Solo verificar autenticación
    const now = Date.now();
    const { metric_id, ...rest } = args;

    // 1. Obtener la métrica existente
    const existingMetric = await ctx.db.get(metric_id);
    if (!existingMetric) {
      throw new ConvexError("Métrica no encontrada.");
    }

    // 2. Determinar los nuevos valores (los de 'rest' o los existentes)
    const new_weight_kg = rest.weight_kg ?? existingMetric.weight_kg;
    const new_height_cm = rest.height_cm ?? existingMetric.height_cm;

    let new_bmi = existingMetric.bmi;

    // 3. Recalcular el IMC solo si el peso o la altura cambiaron
    if (rest.weight_kg !== undefined || rest.height_cm !== undefined) {
      new_bmi = calculateBMI(new_weight_kg, new_height_cm);
    }

    // 4. Aplicar el parche (actualización)
    await ctx.db.patch(metric_id, {
      ...rest,
      bmi: new_bmi, // Actualizar el IMC
      updated_at: now,
    });

    return true;
  },
});

/**
 * Elimina (borrado físico) un registro de métrica de salud.
 */
export const remove = mutation({
  args: deleteHealthMetricArgs,
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx); // Verificar autenticación

    const existingMetric = await ctx.db.get(args.metric_id);
    if (!existingMetric) {
      throw new ConvexError("Métrica no encontrada.");
    }

    // Opcional: Validar permisos (¿Es admin, entrenador de este cliente, o el creador?)
    // Por simplicidad, aquí solo borramos si está autenticado.
    
    await ctx.db.delete(args.metric_id);
    return true;
  },
});