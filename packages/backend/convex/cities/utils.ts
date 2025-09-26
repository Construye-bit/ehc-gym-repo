import { QueryCtx } from "../_generated/server";
import { mustGetCurrentUser } from "../users";
import { AccessDeniedError } from "./errors";

/**
 * Verifica que el usuario esté autenticado y tenga rol de SUPER_ADMIN.
 * Lanza un error si no cumple.
 */
export async function requireSuperAdmin(ctx: QueryCtx): Promise<void> {
    const user = await mustGetCurrentUser(ctx);

    const roleAssignment = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q) =>
            q.eq("user_id", user._id).eq("active", true)
        )
        .collect();

    const isSuperAdmin = roleAssignment.some(r => r.role === "SUPER_ADMIN");

    if (!isSuperAdmin) {
        throw new AccessDeniedError();
    }
}