// ==========================================
// ARCHIVO: convex/profiles/client/mutations.ts
// ==========================================

import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// ==========================================
// VALIDADORES - Usando solo Convex
// ==========================================

const addHealthMetricValidator = {
  payload: v.object({
    measured_at: v.number(),
    weight_kg: v.optional(v.number()),
    height_cm: v.optional(v.number()),
    bmi: v.optional(v.number()),
    body_fat_pct: v.optional(v.number()),
    notes: v.optional(v.string()),
  }),
};

const deleteHealthMetricValidator = {
  payload: v.object({
    metric_id: v.id("client_health_metrics"),
  }),
};

const updateMyPhoneValidator = {
  payload: v.object({
    phone: v.string(),
  }),
};

const updateEmergencyContactValidator = {
  payload: v.object({
    name: v.string(),
    phone: v.string(),
    relationship: v.string(),
  }),
};

const upsertClientPreferencesValidator = {
  payload: v.object({
    preferred_time_range: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    routine_type: v.optional(v.union(
      v.literal("FUERZA"),
      v.literal("CARDIO"),
      v.literal("MIXTO"),
      v.literal("MOVILIDAD")
    )),
    goal: v.optional(v.union(
      v.literal("BAJAR_PESO"),
      v.literal("TONIFICAR"),
      v.literal("GANAR_MASA"),
      v.literal("RESISTENCIA")
    )),
    notes: v.optional(v.string()),
  }),
};

// ==========================================
// MUTATION: addHealthMetric
// Agrega una nueva métrica de salud para el cliente
// ==========================================
export const addHealthMetric = mutation({
  args: addHealthMetricValidator,
  handler: async (ctx, { payload }) => {
    console.log("🔵 addHealthMetric iniciado");
    console.log("📦 Payload recibido:", JSON.stringify(payload, null, 2));

    // 1. Verificar autenticación
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error("❌ No hay identidad");
      throw new Error("UNAUTHORIZED: Debes estar autenticado");
    }
    console.log("✅ Usuario autenticado:", identity.subject);

    // 2. Obtener user_id desde clerk_id
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .unique();

    if (!user) {
      console.error("❌ Usuario no encontrado en DB");
      throw new Error("NOT_FOUND: Usuario no encontrado");
    }
    console.log("✅ Usuario encontrado:", user._id);

    // 3. Verificar que el usuario tenga rol CLIENT
    const clientRole = await ctx.db
      .query("role_assignments")
      .withIndex("by_user_role", (q) =>
        q.eq("user_id", user._id).eq("role", "CLIENT")
      )
      .filter((q) => q.eq(q.field("active"), true))
      .unique();

    if (!clientRole) {
      console.error("❌ Usuario no tiene rol CLIENT");
      throw new Error("FORBIDDEN: Solo clientes pueden agregar métricas");
    }
    console.log("✅ Rol CLIENT verificado");

    // 4. Obtener el cliente asociado al usuario
    const client = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .filter((q) => q.eq(q.field("active"), true))
      .unique();

    if (!client) {
      console.error("❌ Cliente no encontrado");
      throw new Error("NOT_FOUND: Cliente no encontrado");
    }
    console.log("✅ Cliente encontrado:", client._id);

    // 5. Validaciones de negocio
    if (payload.weight_kg !== undefined && payload.weight_kg <= 0) {
      console.error("❌ Peso inválido:", payload.weight_kg);
      throw new Error("VALIDATION_ERROR: El peso debe ser mayor a 0");
    }

    if (payload.height_cm !== undefined && payload.height_cm <= 0) {
      console.error("❌ Altura inválida:", payload.height_cm);
      throw new Error("VALIDATION_ERROR: La altura debe ser mayor a 0");
    }

    if (
      payload.body_fat_pct !== undefined &&
      (payload.body_fat_pct < 0 || payload.body_fat_pct > 100)
    ) {
      console.error("❌ Porcentaje de grasa inválido:", payload.body_fat_pct);
      throw new Error(
        "VALIDATION_ERROR: El porcentaje de grasa debe estar entre 0 y 100"
      );
    }

    if (payload.measured_at > Date.now()) {
      console.error("❌ Fecha futura:", payload.measured_at);
      throw new Error(
        "VALIDATION_ERROR: La fecha de medición no puede ser futura"
      );
    }

    console.log("✅ Validaciones de negocio pasadas");

    // 6. Calcular IMC automáticamente si hay peso y altura
    let calculatedBMI = payload.bmi;
    if (
      payload.weight_kg !== undefined &&
      payload.height_cm !== undefined &&
      payload.height_cm > 0
    ) {
      const heightInMeters = payload.height_cm / 100;
      calculatedBMI = payload.weight_kg / (heightInMeters * heightInMeters);
      console.log("✅ IMC calculado:", calculatedBMI);
    }

    // 7. Preparar datos para insertar
    const now = Date.now();
    const dataToInsert = {
      client_id: client._id,
      measured_at: payload.measured_at,
      weight_kg: payload.weight_kg,
      height_cm: payload.height_cm,
      bmi: calculatedBMI,
      body_fat_pct: payload.body_fat_pct,
      notes: payload.notes,
      created_by_user_id: user._id,
      created_at: now,
      updated_at: now,
    };

    console.log("📝 Datos a insertar:", JSON.stringify(dataToInsert, null, 2));

    // 8. Insertar la métrica
    try {
      const metricId = await ctx.db.insert("client_health_metrics", dataToInsert);
      console.log("✅ Métrica insertada con éxito:", metricId);

      return {
        status: "success",
        value: metricId,
      };
    } catch (insertError: any) {
      console.error("❌ Error al insertar en DB:", insertError);
      throw new Error(`Error al guardar métrica: ${insertError.message}`);
    }
  },
});

// ==========================================
// MUTATION: deleteHealthMetric
// Elimina una métrica de salud del cliente
// ==========================================
export const deleteHealthMetric = mutation({
  args: deleteHealthMetricValidator,
  handler: async (ctx, { payload }) => {
    console.log("🔵 deleteHealthMetric iniciado");
    console.log("📦 Payload:", payload.metric_id);

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
    console.log("✅ Métrica eliminada con éxito");

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
    console.log("🔵 updateMyPhone (CLIENT) iniciado");
    console.log("📦 Payload:", payload.phone);

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

    console.log("✅ Teléfono actualizado con éxito");

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
    console.log("🔵 updateEmergencyContact iniciado");

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
      console.log("✅ Contacto de emergencia actualizado");
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
      console.log("✅ Contacto de emergencia creado");
    }

    return {
      status: "success",
      value: "ok",
    };
  },
});

// ==========================================
// MUTATION: upsertClientPreferences
// Crea o actualiza las preferencias del cliente
// ==========================================
export const upsertClientPreferences = mutation({
  args: upsertClientPreferencesValidator,
  handler: async (ctx, { payload }) => {
    console.log("🔵 upsertClientPreferences iniciado");

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
      throw new Error("FORBIDDEN: Solo clientes pueden actualizar preferencias");
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

    // 5. Buscar preferencias existentes
    const existing = await ctx.db
      .query("client_preferences")
      .withIndex("by_client", (q) => q.eq("client_id", client._id))
      .unique();

    const now = Date.now();

    if (existing) {
      // Actualizar existente
      await ctx.db.patch(existing._id, {
        preferred_time_range: payload.preferred_time_range,
        routine_type: payload.routine_type,
        goal: payload.goal,
        notes: payload.notes,
        updated_at: now,
      });
      console.log("✅ Preferencias actualizadas");
      return {
        status: "success",
        value: existing._id,
      };
    } else {
      // Crear nuevo
      const id = await ctx.db.insert("client_preferences", {
        client_id: client._id,
        preferred_time_range: payload.preferred_time_range,
        routine_type: payload.routine_type,
        goal: payload.goal,
        notes: payload.notes,
        created_at: now,
        updated_at: now,
      });
      console.log("✅ Preferencias creadas");
      return {
        status: "success",
        value: id,
      };
    }
  },
});