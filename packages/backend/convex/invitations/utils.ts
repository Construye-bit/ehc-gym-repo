import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Valida que el cliente invitador exista, esté activo y con pagos al día.
 * Lanza Error si no cumple.
 */
export async function assertClientPaymentActive(
    ctx: QueryCtx,
    inviter_client_id: Id<"clients">
): Promise<void> {
    const client = await ctx.db.get(inviter_client_id);
    if (!client) {
        throw new Error("Cliente no encontrado.");
    }
    if (client.active !== true || client.status !== "ACTIVE") {
        throw new Error("Cliente inactivo.");
    }
    if (client.is_payment_active !== true) {
        throw new Error("El cliente no está al día con los pagos.");
    }
}
