import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Unicidad lógica: (client_id, branch_id) con fila activa.
 * Lanza Error si ya existe.
 */
export async function assertUniqueClientBranch(
    ctx: QueryCtx,
    client_id: Id<"clients">,
    branch_id: Id<"branches">
): Promise<void> {
    const existing = await ctx.db
        .query("client_branches")
        .withIndex("by_client", (q) => q.eq("client_id", client_id))
        .filter((q) => q.eq(q.field("branch_id"), branch_id))
        .filter((q) => q.eq(q.field("active"), true))
        .first();

    if (existing) {
        throw new Error("El cliente ya está vinculado activamente a esta sede.");
    }
}
