import { mutation } from "../../_generated/server";
import { getAuthenticatedClientData } from "../common/utils";
import {
  upsertClientPreferencesArgs,
  addHealthMetricArgs,
  addProgressArgs,
  updateMyProfileArgs,
  deleteHealthMetricArgs, // <-- Importación añadida
} from "./validations";
import { ConvexError } from "convex/values";

/**
 * (Client) Actualiza el teléfono (en 'persons') y el contacto de emergencia.
 * Path: profiles/client/mutations:updateMyProfile
 */
export const updateMyProfile = mutation({
  args: updateMyProfileArgs,
  handler: async (ctx, args) => {
    const { person } = await getAuthenticatedClientData(ctx);
    const now = Date.now();
    const { phone, emergencyContact } = args.payload;

    // 1. Actualizar Contacto de Emergencia (lógica de Upsert/Deactivate)
    if (emergencyContact !== undefined) {
      const existingContact = await ctx.db
        .query("emergency_contact")
        .withIndex("by_person", (q) => q.eq("person_id", person._id))
        .first();

      const { name, phone: ecPhone, relationship } = emergencyContact;

      // Caso A: Datos completos -> Crear o Actualizar (y activar)
      if (name && ecPhone && relationship) {
        if (existingContact) {
          await ctx.db.patch(existingContact._id, {
            name,
            phone: ecPhone,
            relationship,
            active: true,
            updated_at: now,
          });
        } else {
          await ctx.db.insert("emergency_contact", {
            person_id: person._id,
            name,
            phone: ecPhone,
            relationship,
            active: true,
            created_at: now,
            updated_at: now,
          });
        }
      }
      // Caso B: Datos vacíos -> Desactivar (si existe)
      else if (!name && !ecPhone && !relationship) {
        if (existingContact) {
          await ctx.db.patch(existingContact._id, {
            active: false,
            updated_at: now,
          });
        }
      }
      // Caso C: Datos incompletos -> Error
      else {
        throw new ConvexError(
          "Para el contacto de emergencia, todos los campos deben estar llenos o todos deben estar vacíos."
        );
      }
    }

    // 2. Actualizar Teléfono (en la tabla 'persons')
    if (phone !== undefined) {
      await ctx.db.patch(person._id, {
        phone: phone, // El trim se hace en el front
        updated_at: now,
      });
    }

    return true; // Éxito
  },
});

/**
 * (Client) Elimina un registro de métrica de salud.
 * Path: profiles/client/mutations:deleteHealthMetric
 */
export const deleteHealthMetric = mutation({
  args: deleteHealthMetricArgs,
  handler: async (ctx, args) => {
    const { client } = await getAuthenticatedClientData(ctx);
    const { metric_id } = args.payload;

    // 1. Obtener la métrica
    const metric = await ctx.db.get(metric_id);
    if (!metric) {
      throw new ConvexError({ message: "Métrica no encontrada.", code: 404 });
    }

    // 2. CORRECCIÓN: Verificar que el documento es una métrica (type guard)
    if (!("client_id" in metric)) {
      throw new ConvexError({
        message: "ID no corresponde a una métrica de salud.",
        code: 400, // Bad Request
      });
    }

    // 3. Seguridad: Verificar que la métrica pertenece al cliente autenticado
    if (metric.client_id !== client._id) {
      throw new ConvexError({
        message: "FORBIDDEN: No tienes permiso para eliminar esta métrica.",
        code: 403,
      });
    }

    // 3. Eliminar la métrica
    await ctx.db.delete(metric_id);
    return true; // Éxito
  },
});

/**
 * (Client) Crea o actualiza las preferencias del cliente.
 * Path: profiles/client/mutations:upsertClientPreferences
 */
export const upsertClientPreferences = mutation({
  args: upsertClientPreferencesArgs,
  handler: async (ctx, args) => {
    const { client } = await getAuthenticatedClientData(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("client_preferences")
      .withIndex("by_client", (q) => q.eq("client_id", client._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args.payload,
        updated_at: now,
      });
      return existing._id;
    } else {
      const newId = await ctx.db.insert("client_preferences", {
        ...args.payload,
        client_id: client._id,
        created_at: now,
        updated_at: now,
      });
      return newId;
    }
  },
});

/**
 * (Client) Añade un nuevo registro de métrica de salud.
 * Path: profiles/client/mutations:addHealthMetric
 */
export const addHealthMetric = mutation({
  args: addHealthMetricArgs,
  handler: async (ctx, args) => {
    const { user, client } = await getAuthenticatedClientData(ctx);
    const now = Date.now();

    const metricId = await ctx.db.insert("client_health_metrics", {
      ...args.payload,
      client_id: client._id,
      created_by_user_id: user._id,
      created_at: now,
      updated_at: now,
    });

    return metricId;
  },
});

/**
 * (Client) Añade un nuevo registro de progreso.
 * Path: profiles/client/mutations:addProgress
 */
export const addProgress = mutation({
  args: addProgressArgs,
  handler: async (ctx, args) => {
    const { user, client } = await getAuthenticatedClientData(ctx);
    const now = Date.now();

    const progressId = await ctx.db.insert("client_progress", {
      ...args.payload,
      client_id: client._id,
      created_by_user_id: user._id,
      created_at: now,
      updated_at: now,
    });

    return progressId;
  },
});