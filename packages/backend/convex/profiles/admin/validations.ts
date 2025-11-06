// convex/profiles/admin/validations.ts
import { v } from "convex/values";

export const getUserProfileByIdArgs = v.object({
  payload: v.object({
    user_id: v.id("users"),
  }),
});

export const adminSetClientContractArgs = v.object({
  payload: v.object({
    client_id: v.id("clients"),
    trainer_id: v.id("trainers"),
    status: v.union(
      v.literal("ACTIVE"),
      v.literal("BLOCKED"),
      v.literal("INACTIVE") // Ajustado al schema (README decía ENDED)
    ),
    start_at: v.number(),
    end_at: v.optional(v.number()),
    notes: v.optional(v.string()),
  }),
});