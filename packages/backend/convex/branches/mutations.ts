import { mutation } from "../_generated/server";
import { requireSuperAdmin } from "./utils";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

export const deleteBranch = mutation({
    args: { branchId: v.string() },
    handler: async (ctx, { branchId }) => {
        requireSuperAdmin(ctx);
        // Aquí puedes agregar lógica de autorización si es necesario
        await ctx.db.delete(branchId as Id<"branches">);
        return { success: true };
    }
});
