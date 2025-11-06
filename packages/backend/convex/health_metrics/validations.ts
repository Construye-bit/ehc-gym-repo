// convex/health_metrics/validations.ts
import { v } from "convex/values";

/**
 * Argumentos para crear una nueva métrica de salud.
 * No pedimos el 'bmi' porque se calcula en el backend.
 */
export const createHealthMetricArgs = {
  client_id: v.id("clients"),
  measured_at: v.number(), // Timestamp de cuándo se tomó la medida
  weight_kg: v.optional(v.number()),
  height_cm: v.optional(v.number()),
  body_fat_pct: v.optional(v.number()),
  notes: v.optional(v.string()),
};

/**
 * Argumentos para actualizar una métrica de salud existente.
 * El ID es obligatorio, el resto es opcional.
 */
export const updateHealthMetricArgs = {
  metric_id: v.id("client_health_metrics"),
  measured_at: v.optional(v.number()),
  weight_kg: v.optional(v.number()),
  height_cm: v.optional(v.number()),
  body_fat_pct: v.optional(v.number()),
  notes: v.optional(v.string()),
};

/**
 * Argumentos para eliminar una métrica de salud.
 */
export const deleteHealthMetricArgs = {
  metric_id: v.id("client_health_metrics"),
};