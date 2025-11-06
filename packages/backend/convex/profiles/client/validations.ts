import { v } from "convex/values";

// *** NUEVO: Argumentos para la mutación de perfil unificada ***
export const updateMyProfileArgs = v.object({
  payload: v.object({
    // 'phone' es opcional; si no se envía, no se actualiza.
    phone: v.optional(v.string()),
    // 'emergencyContact' es opcional
    emergencyContact: v.optional(
      v.object({
        name: v.string(), // Permitimos strings vacíos para lógica de borrado
        phone: v.string(),
        relationship: v.string(),
      })
    ),
  }),
});

// *** AÑADIDO: Argumentos para eliminar una métrica de salud ***
export const deleteHealthMetricArgs = v.object({
  payload: v.object({
    metric_id: v.id("client_health_metrics"),
  }),
});

// --- Validaciones existentes (sin cambios) ---

// Schema para upsertClientPreferences (basado en el README)
export const upsertClientPreferencesArgs = v.object({
  payload: v.object({
    preferred_time_range: v.optional(
      v.object({ start: v.string(), end: v.string() })
    ),
    routine_type: v.optional(
      v.union(
        v.literal("FUERZA"),
        v.literal("CARDIO"),
        v.literal("MIXTO"),
        v.literal("MOVILIDAD")
      )
    ),
    goal: v.optional(
      v.union(
        v.literal("BAJAR_PESO"),
        v.literal("TONIFICAR"),
        v.literal("GANAR_MASA"),
        v.literal("RESISTENCIA")
      )
    ),
    notes: v.optional(v.string()),
  }),
});

// Schema para addHealthMetric (basado en el README)
export const addHealthMetricArgs = v.object({
  payload: v.object({
    measured_at: v.number(),
    weight_kg: v.optional(v.number()),
    height_cm: v.optional(v.number()),
    bmi: v.optional(v.number()),
    body_fat_pct: v.optional(v.number()),
    notes: v.optional(v.string()),
  }),
});

// Schema para addProgress (basado en el README)
export const addProgressArgs = v.object({
  payload: v.object({
    kind: v.union(v.literal("MEDICION"), v.literal("HITO"), v.literal("RUTINA")),
    metric_key: v.optional(v.string()),
    metric_value: v.optional(v.number()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    recorded_at: v.number(),
  }),
});

// Schema para paginación genérica
const paginationArgs = v.object({
  from: v.optional(v.number()),
  to: v.optional(v.number()),
  cursor: v.optional(v.any()), // string | null
  limit: v.optional(v.number()),
});

export const listHealthMetricsArgs = v.object({
  payload: v.optional(paginationArgs),
});

export const listProgressArgs = v.object({
  payload: v.optional(paginationArgs),
});

export const listMyContractsArgs = v.object({
  payload: v.object({
    status: v.optional(
      v.union(
        v.literal("ACTIVE"),
        v.literal("INACTIVE"), // Ajustado a tu schema
        v.literal("BLOCKED")
      )
    ),
    limit: v.optional(v.number()),
    cursor: v.optional(v.any()), // string | null
  }),
});