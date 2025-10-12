import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { mustGetCurrentUser } from "../users";

/**
 * Requiere que el usuario actual sea ADMIN asignado a la branch indicada y activo.
 * Si no cumple, lanza Error.
 */
export async function requireAdminAssignedToBranch(
    ctx: QueryCtx,
    branchId: Id<"branches">
): Promise<void> {
    const user = await mustGetCurrentUser(ctx);

    const admin = await ctx.db
        .query("admins")
        .withIndex("by_user", (q) => q.eq("user_id", user._id))
        .filter((q) => q.eq(q.field("branch_id"), branchId))
        .filter((q) => q.eq(q.field("status"), "ACTIVE"))
        .filter((q) => q.eq(q.field("active"), true))
        .first();

    if (!admin) {
        throw new Error("Acceso denegado: el usuario no es un Administrador activo de esta sede.");
    }
}

/**
 * Devuelve el admin activo del usuario actual (si existe).
 */
export async function getCurrentActiveAdmin(ctx: QueryCtx) {
    const user = await mustGetCurrentUser(ctx);
    return ctx.db
        .query("admins")
        .withIndex("by_user", (q) => q.eq("user_id", user._id))
        .filter((q) => q.eq(q.field("status"), "ACTIVE"))
        .filter((q) => q.eq(q.field("active"), true))
        .first();
}
