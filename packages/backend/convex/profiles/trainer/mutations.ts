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
const updateMyPhoneTrainerValidator = {
  payload: v.object({
    phone: v.string(),
  }),
};

// ==========================================
// MUTATION: updateMyPhone (TRAINER)
// Actualiza el teléfono personal del entrenador
// ==========================================
export const updateMyPhoneTrainer = mutation({
  args: updateMyPhoneTrainerValidator,
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

    // 3. Verificar que el usuario tenga rol TRAINER
    const trainerRole = await ctx.db
      .query("role_assignments")
      .withIndex("by_user_role", (q) =>
        q.eq("user_id", user._id).eq("role", "TRAINER")
      )
      .filter((q) => q.eq(q.field("active"), true))
      .unique();

    if (!trainerRole) {
      throw new Error(
        "FORBIDDEN: Solo entrenadores pueden actualizar su teléfono"
      );
    }

    // 4. Obtener el trainer asociado al usuario
    const trainer = await ctx.db
      .query("trainers")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .unique();

    if (!trainer) {
      throw new Error("NOT_FOUND: Entrenador no encontrado");
    }

    // 5. Obtener la persona asociada
    const person = await ctx.db.get(trainer.person_id);

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

    return {
      status: "success",
      value: "ok",
    };
  },
});