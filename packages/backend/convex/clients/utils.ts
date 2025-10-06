import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Unicidad lógica: máximo 1 cliente activo por person_id.
 * Lanza Error si ya existe.
 */
export async function assertClientUniquePerson(
    ctx: QueryCtx,
    person_id: Id<"persons">
): Promise<void> {
    const existing = await ctx.db
        .query("clients")
        .withIndex("by_person", (q) => q.eq("person_id", person_id))
        .filter((q) => q.eq(q.field("active"), true))
        .first();

    if (existing) {
        throw new Error("Ya existe un cliente activo para esta persona.");
    }
}
