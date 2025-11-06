// convex/profiles/admin/mutations.ts
import { mutation } from "../../_generated/server";
import { ensureAdmin } from "../common/utils"; // <-- Ruta actualizada
import { adminSetClientContractArgs } from "./validations";
import { ConvexError } from "convex/values";

/**
 * (Admin) Crea o actualiza un contrato entre un cliente y un entrenador.
 * Path: profiles/admin/mutations:adminSetClientContract
 */
export const adminSetClientContract = mutation({
  args: adminSetClientContractArgs,
  handler: async (ctx, args) => {
    const adminUser = await ensureAdmin(ctx);
    const now = Date.now();
    const { client_id, trainer_id, status } = args.payload;

    // Regla: no duplicar ACTIVE para misma pareja
    if (status === "ACTIVE") {
      const existingActiveContract = await ctx.db
        .query("client_trainer_contracts")
        .withIndex("by_pair", (q) =>
          q.eq("client_id", client_id).eq("trainer_id", trainer_id)
        )
        .filter((q) => q.eq(q.field("status"), "ACTIVE"))
        .first();

      if (existingActiveContract) {
        throw new ConvexError({
          message: "Ya existe un contrato activo para esta pareja.",
          code: 409, // 409 Conflict
        });
      }
    }

    const contractId = await ctx.db.insert("client_trainer_contracts", {
      ...args.payload,
      created_by_user_id: adminUser._id,
      created_at: now,
      updated_at: now,
    });

    return contractId;
  },
});