import { mutation } from "../_generated/server";
import { v } from "convex/values";
import {
  addHealthMetricValidator,
  deleteHealthMetricValidator,
  updateMyPhoneValidator,
  updateEmergencyContactValidator,
} from "./validations";

// ==========================================
// MUTATION: addHealthMetric
// Agrega una nueva métrica de salud para el cliente
// ==========================================
export const addHealthMetric = mutation({
  args: addHealthMetricValidator,
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
      throw new Error("FORBIDDEN: Solo clientes pueden agregar métricas");
    }

    // 4. Obtener el cliente asociado al usuario
    const client = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .filter((q) => q.eq(q.field("active"), true))
      .unique();

    if (!client) {
      throw new Error("NOT_FOUND: Cliente no encontrado");
    }

    // 5. Validaciones de negocio
    if (payload.weight_kg !== undefined && payload.weight_kg <= 0) {
      throw new Error("VALIDATION_ERROR: El peso debe ser mayor a 0");
    }

    if (payload.height_cm !== undefined && payload.height_cm <= 0) {
      throw new Error("VALIDATION_ERROR: La altura debe ser mayor a 0");
    }

    if (
      payload.body_fat_pct !== undefined &&
      (payload.body_fat_pct < 0 || payload.body_fat_pct > 100)
    ) {
      throw new Error(
        "VALIDATION_ERROR: El porcentaje de grasa debe estar entre 0 y 100"
      );
    }

    if (payload.measured_at > Date.now()) {
      throw new Error(
        "VALIDATION_ERROR: La fecha de medición no puede ser futura"
      );
    }

    // 6. Calcular IMC automáticamente si hay peso y altura
    let calculatedBMI = payload.bmi;
    if (
      payload.weight_kg !== undefined &&
      payload.height_cm !== undefined &&
      payload.height_cm > 0
    ) {
      const heightInMeters = payload.height_cm / 100;
      calculatedBMI = payload.weight_kg / (heightInMeters * heightInMeters);
    }

    // 7. Insertar la métrica
    const metricId = await ctx.db.insert("client_health_metrics", {
      client_id: client._id,
      measured_at: payload.measured_at,
      weight_kg: payload.weight_kg,
      height_cm: payload.height_cm,
      bmi: calculatedBMI,
      body_fat_pct: payload.body_fat_pct,
      notes: payload.notes,
      created_by_user_id: user._id,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return {
      status: "success",
      value: metricId,
    };
  },
});

// ==========================================
// MUTATION: deleteHealthMetric
// Elimina una métrica de salud del cliente
// ==========================================
export const deleteHealthMetric = mutation({
  args: deleteHealthMetricValidator,
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
      throw new Error("FORBIDDEN: Solo clientes pueden eliminar métricas");
    }

    // 4. Obtener la métrica
    const metric = await ctx.db.get(payload.metric_id);

    if (!metric) {
      throw new Error("NOT_FOUND: Métrica no encontrada");
    }

    // 5. Verificar que la métrica pertenezca al cliente
    const client = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .filter((q) => q.eq(q.field("active"), true))
      .unique();

    if (!client || metric.client_id !== client._id) {
      throw new Error("FORBIDDEN: No puedes eliminar esta métrica");
    }

    // 6. Eliminar la métrica
    await ctx.db.delete(payload.metric_id);

    return {
      status: "success",
      value: "ok",
    };
  },
});

// ==========================================
// MUTATION: updateMyPhone (CLIENT)
// Actualiza el teléfono personal del cliente
// ==========================================
export const updateMyPhone = mutation({
  args: updateMyPhoneValidator,
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
      throw new Error("FORBIDDEN: Solo clientes pueden actualizar su teléfono");
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

    // 5. Obtener la persona asociada
    const person = await ctx.db.get(client.person_id);

    if (!person) {
      throw new Error("NOT_FOUND: Persona no encontrada");
    }

    // 6. Validar el teléfono
    const trimmedPhone = payload.phone.trim();
    if (trimmedPhone.length === 0) {
      throw new Error("VALIDATION_ERROR: El teléfono no puede estar vacío");
    }

    // Validación básica de formato (opcional)
    // Puedes agregar regex más estricta según tus necesidades
    if (trimmedPhone.length < 7) {
      throw new Error(
        "VALIDATION_ERROR: El teléfono debe tener al menos 7 caracteres"
      );
    }

    // 7. Actualizar el teléfono en persons
    await ctx.db.patch(person._id, {
      phone: trimmedPhone,
      updated_at: Date.now(),
    });

    return {
      status: "success",
      value: "ok",
    };
  },
});

// ==========================================
// MUTATION: updateEmergencyContact (CLIENT)
// Actualiza o crea el contacto de emergencia del cliente
// ==========================================
export const updateEmergencyContact = mutation({
  args: updateEmergencyContactValidator,
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
      throw new Error(
        "FORBIDDEN: Solo clientes pueden actualizar contacto de emergencia"
      );
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

    // 5. Validaciones
    if (!payload.name.trim()) {
      throw new Error("VALIDATION_ERROR: El nombre no puede estar vacío");
    }

    if (!payload.phone.trim()) {
      throw new Error("VALIDATION_ERROR: El teléfono no puede estar vacío");
    }

    if (!payload.relationship.trim()) {
      throw new Error("VALIDATION_ERROR: El parentesco no puede estar vacío");
    }

    // 6. Buscar contacto de emergencia existente
    const existingContact = await ctx.db
      .query("emergency_contact")
      .withIndex("by_person_active", (q) =>
        q.eq("person_id", client.person_id).eq("active", true)
      )
      .unique();

    const now = Date.now();

    if (existingContact) {
      // Actualizar existente
      await ctx.db.patch(existingContact._id, {
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        relationship: payload.relationship.trim(),
        updated_at: now,
      });
    } else {
      // Crear nuevo
      await ctx.db.insert("emergency_contact", {
        person_id: client.person_id,
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        relationship: payload.relationship.trim(),
        active: true,
        created_at: now,
        updated_at: now,
      });
    }

    return {
      status: "success",
      value: "ok",
    };
  },
});