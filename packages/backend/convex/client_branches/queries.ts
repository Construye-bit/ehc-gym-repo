import { query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { listClientBranchesSchema, validateWithZod } from "./validations";
import { getCurrentActiveAdmin } from "../admins/utils";
import { mustGetCurrentUser } from "../users";

// Listar vínculos branch de un cliente.
// - SUPER_ADMIN: ve todos los vínculos activos.
// - ADMIN: ve solo el vínculo activo con su branch (si existe).
export const listClientBranches = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(listClientBranchesSchema, args.payload, "listClientBranches");
        const clientId = data.client_id as Id<"clients">;

        // ¿SUPER_ADMIN?
        const user = await mustGetCurrentUser(ctx);
        const roles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) => q.eq("user_id", user._id).eq("active", true))
            .collect();
        const isSuper = roles.some((r) => r.role === "SUPER_ADMIN");

        if (isSuper) {
            return ctx.db
                .query("client_branches")
                .withIndex("by_client", (q) => q.eq("client_id", clientId))
                .filter((q) => q.eq(q.field("active"), true))
                .collect();
        }

        const admin = await getCurrentActiveAdmin(ctx);
        if (!admin || !admin.branch_id) {
            throw new Error("Acceso denegado: requiere ADMIN asignado a una sede.");
        }

        const link = await ctx.db
            .query("client_branches")
            .withIndex("by_client", (q) => q.eq("client_id", clientId))
            .filter((q) => q.eq(q.field("branch_id"), admin.branch_id as Id<"branches">))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        return link ? [link] : [];
    },
});
