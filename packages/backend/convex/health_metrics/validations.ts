import { v } from "convex/values";

// Validador para agregar métrica de salud
export const addHealthMetricValidator = {
  payload: v.object({
    measured_at: v.number(),
    weight_kg: v.optional(v.number()),
    height_cm: v.optional(v.number()),
    bmi: v.optional(v.number()),
    body_fat_pct: v.optional(v.number()),
    notes: v.optional(v.string()),
  }),
};

// Validador para listar métricas de salud
export const listHealthMetricsValidator = {
  payload: v.optional(
    v.object({
      from: v.optional(v.number()), // timestamp desde
      to: v.optional(v.number()), // timestamp hasta
      cursor: v.optional(v.number()), // timestamp para paginación
      limit: v.optional(v.number()), // límite de resultados
    })
  ),
};

// Validador para eliminar métrica
export const deleteHealthMetricValidator = {
  payload: v.object({
    metric_id: v.id("client_health_metrics"),
  }),
};

// Validador para actualizar teléfono
export const updateMyPhoneValidator = {
  payload: v.object({
    phone: v.string(),
  }),
};

// Validador para actualizar contacto de emergencia
export const updateEmergencyContactValidator = {
  payload: v.object({
    name: v.string(),
    phone: v.string(),
    relationship: v.string(),
  }),
};