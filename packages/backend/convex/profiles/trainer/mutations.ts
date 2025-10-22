import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
    updateTrainerSpecialtiesSchema,
    updateTrainerScheduleSchema,
    updateMyPhoneSchema,
    validateWithZod,
} from "./validations";
import {
    requireTrainerOwnershipOrAdmin,
    getCurrentUser,
} from "../common/utils";

// Actualizar specialties (propio trainer o ADMIN/SA)
export const updateTrainerSpecialties = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            updateTrainerSpecialtiesSchema,
            args.payload,
            "updateTrainerSpecialties"
        );
        const trainerId = data.trainer_id as Id<"trainers">;

        await requireTrainerOwnershipOrAdmin(ctx, trainerId);

        const trainer = await ctx.db.get(trainerId);
        if (!trainer) throw new Error("Entrenador no encontrado.");

        const now = Date.now();
        await ctx.db.patch(trainerId, {
            specialties: data.specialties,
            updated_at: now,
        });
        return trainerId;
    },
});

// Actualizar work_schedule (propio trainer o ADMIN/SA)
export const updateTrainerSchedule = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            updateTrainerScheduleSchema,
            args.payload,
            "updateTrainerSchedule"
        );
        const trainerId = data.trainer_id as Id<"trainers">;

        await requireTrainerOwnershipOrAdmin(ctx, trainerId);

        const trainer = await ctx.db.get(trainerId);
        if (!trainer) throw new Error("Entrenador no encontrado.");

        const now = Date.now();
        await ctx.db.patch(trainerId, {
            work_schedule: data.work_schedule,
            updated_at: now,
        });
        return trainerId;
    },
});

// Actualizar phone en persons (propio trainer o ADMIN/SA)
export const updateMyPhone = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            updateMyPhoneSchema,
            args.payload,
            "updateMyPhone"
        );
        const trainerId = data.trainer_id as Id<"trainers">;

        await requireTrainerOwnershipOrAdmin(ctx, trainerId);

        const trainer = await ctx.db.get(trainerId);
        if (!trainer) throw new Error("Entrenador no encontrado.");

        const person = await ctx.db.get(trainer.person_id as Id<"persons">);
        if (!person) throw new Error("Persona no encontrada para el entrenador.");

        const now = Date.now();
        await ctx.db.patch(person._id, {
            phone: data.phone,
            updated_at: now,
        });
        return person._id;
    },
});
