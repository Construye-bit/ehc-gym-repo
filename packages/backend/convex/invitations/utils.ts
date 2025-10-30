import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { INVITATION_ERRORS } from "./errors";

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
        throw new Error(INVITATION_ERRORS.CLIENT_NOT_FOUND);
    }
    if (client.active !== true || client.status !== "ACTIVE") {
        throw new Error(INVITATION_ERRORS.CLIENT_INACTIVE);
    }
    if (client.is_payment_active !== true) {
        throw new Error(INVITATION_ERRORS.CLIENT_PAYMENT_NOT_ACTIVE);
    }
}
