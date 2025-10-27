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

/**
 * Verifies that the user is authenticated and has admin privileges (ADMIN or SUPER_ADMIN role).
 * Throws an error if the requirements are not met.
 */
export async function requireAdmin(ctx: QueryCtx): Promise<void> {
    const user = await mustGetCurrentUser(ctx);

    const roleAssignment = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q) =>
            q.eq("user_id", user._id).eq("active", true)
        )
        .collect();

    const isAdmin = roleAssignment.some(r => r.role === "ADMIN" || r.role === "SUPER_ADMIN");

    if (!isAdmin) {
        throw new AccessDeniedError();
    }
}