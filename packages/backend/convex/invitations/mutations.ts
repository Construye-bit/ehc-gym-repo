import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mustGetCurrentUser } from "../users";
import {
    inviteFriendSchema,
    cancelInvitationSchema,
    validateWithZod,
} from "./validations";
import { assertClientPaymentActive } from "./utils";

// Verifica que el usuario tenga rol CLIENT activo.
async function requireClientRole(ctx: any): Promise<void> {
    const user = await mustGetCurrentUser(ctx);
    const roles = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q: any) => q.eq("user_id", user._id).eq("active", true))
        .collect();
    const isClient = roles.some((r: any) => r.role === "CLIENT");
    if (!isClient) throw new Error("Acceso denegado: requiere rol CLIENT.");
}

// Garantiza token único.
async function generateUniqueToken(ctx: any): Promise<string> {
    for (let i = 0; i < 5; i++) {
        const token = crypto.randomUUID();
        const existing = await ctx.db
            .query("invitations")
            .withIndex("by_token", (q: any) => q.eq("token", token))
            .first();
        if (!existing) return token;
    }
    throw new Error("No fue posible generar un token único.");
}

export const inviteFriend = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireClientRole(ctx);

        const data = validateWithZod(inviteFriendSchema, args.payload, "inviteFriend");
        const inviterClientId = data.inviter_client_id as Id<"clients">;

        const user = await mustGetCurrentUser(ctx);
        const inviterClient = await ctx.db.get(inviterClientId);
        if (!inviterClient || inviterClient.active !== true) {
            throw new Error("Cliente invitador no encontrado o inactivo.");
        }
        if (inviterClient.user_id !== user._id) {
            throw new Error("No autorizado: el cliente invitador no pertenece al usuario actual.");
        }

        await assertClientPaymentActive(ctx, inviterClientId);

        const token = await generateUniqueToken(ctx);
        const now = Date.now();
        const expiresAt = now + 10 * 24 * 60 * 60 * 1000; // 10 días

        const invitationId = await ctx.db.insert("invitations", {
            inviter_client_id: inviterClientId,
            invitee_name: data.invitee_name,
            invitee_email: data.invitee_email,
            invitee_phone: data.invitee_phone,
            preferred_branch_id: data.preferred_branch_id
                ? (data.preferred_branch_id as Id<"branches">)
                : undefined,
            token,
            status: "PENDING",
            expires_at: expiresAt,
            active: true,
            created_at: now,
            updated_at: now,
        });

        // Stub de envío
        console.log("[inviteFriend] Enviar invitación:", {
            toEmail: data.invitee_email,
            toPhone: data.invitee_phone,
            token,
            preferred_branch_id: data.preferred_branch_id,
        });

        return { invitationId, token, expires_at: expiresAt };
    },
});

export const cancelInvitation = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireClientRole(ctx);

        const data = validateWithZod(cancelInvitationSchema, args.payload, "cancelInvitation");
        const invitationId = data.invitation_id as Id<"invitations">;

        const user = await mustGetCurrentUser(ctx);
        const inv = await ctx.db.get(invitationId);
        if (!inv || inv.active !== true) throw new Error("Invitación no encontrada o inactiva.");

        // Solo el cliente invitador puede cancelarla
        const inviterClient = await ctx.db.get(inv.inviter_client_id);
        if (!inviterClient || inviterClient.user_id !== user._id) {
            throw new Error("No autorizado para cancelar esta invitación.");
        }

        if (inv.status !== "PENDING") {
            throw new Error("Solo se pueden cancelar invitaciones en estado PENDING.");
        }

        await ctx.db.patch(invitationId, { status: "CANCELED", active: false, updated_at: Date.now() });
        return invitationId;
    },
});
