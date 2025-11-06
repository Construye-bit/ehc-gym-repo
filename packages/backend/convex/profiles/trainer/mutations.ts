// convex/profiles/trainer/mutations.ts
import { mutation } from "../../_generated/server";
import { getAuthenticatedTrainerData } from "../common/utils"; // <-- Ruta actualizada
import {
  updateTrainerSpecialtiesArgs,
  updateTrainerScheduleArgs,
  updateMyPhoneArgs,
} from "./validations";

/**
 * (Trainer) Actualiza la lista de especialidades del entrenador.
 * Path: profiles/trainer/mutations:updateTrainerSpecialties
 */
export const updateTrainerSpecialties = mutation({
  args: updateTrainerSpecialtiesArgs,
  handler: async (ctx, args) => {
    const { trainer } = await getAuthenticatedTrainerData(ctx);
    const now = Date.now();

    await ctx.db.patch(trainer._id, {
      specialties: args.payload.specialties,
      updated_at: now,
    });

    return "ok";
  },
});

/**
 * (Trainer) Actualiza el horario de trabajo del entrenador.
 * Path: profiles/trainer/mutations:updateTrainerSchedule
 */
export const updateTrainerSchedule = mutation({
  args: updateTrainerScheduleArgs,
  handler: async (ctx, args) => {
    const { trainer } = await getAuthenticatedTrainerData(ctx);
    const now = Date.now();

    await ctx.db.patch(trainer._id, {
      work_schedule: args.payload.work_schedule,
      updated_at: now,
    });

    return "ok";
  },
});

/**
 * (Trainer) Actualiza el teléfono personal (en la tabla 'persons').
 * Path: profiles/trainer/mutations:updateMyPhone
 */
export const updateMyPhone = mutation({
  args: updateMyPhoneArgs,
  handler: async (ctx, args) => {
    const { person } = await getAuthenticatedTrainerData(ctx);
    const now = Date.now();

    // El teléfono está en la tabla 'persons', no en 'trainers'
    await ctx.db.patch(person._id, {
      phone: args.payload.phone,
      updated_at: now,
    });

    return "ok";
  },
});