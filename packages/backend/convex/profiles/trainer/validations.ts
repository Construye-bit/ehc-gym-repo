// convex/profiles/trainer/validations.ts
import { v } from "convex/values";

// Horario de trabajo (copiado de tu schema.ts)
const workScheduleSchema = v.object({
  monday: v.optional(v.object({ start: v.string(), end: v.string() })),
  tuesday: v.optional(v.object({ start: v.string(), end: v.string() })),
  wednesday: v.optional(v.object({ start: v.string(), end: v.string() })),
  thursday: v.optional(v.object({ start: v.string(), end: v.string() })),
  friday: v.optional(v.object({ start: v.string(), end: v.string() })),
  saturday: v.optional(v.object({ start: v.string(), end: v.string() })),
  sunday: v.optional(v.object({ start: v.string(), end: v.string() })),
});

export const updateTrainerSpecialtiesArgs = v.object({
  payload: v.object({
    specialties: v.array(v.string()),
  }),
});

export const updateTrainerScheduleArgs = v.object({
  payload: v.object({
    work_schedule: workScheduleSchema,
  }),
});

export const updateMyPhoneArgs = v.object({
  payload: v.object({
    phone: v.string(),
  }),
});