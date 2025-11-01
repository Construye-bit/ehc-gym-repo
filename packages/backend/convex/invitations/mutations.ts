import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mustGetCurrentUser } from "../users";
import {
    inviteFriendSchema,
    cancelInvitationSchema,
    redeemInvitationSchema,
    validateWithZod,
    MAX_INVITATIONS_PER_MONTH,
} from "./validations";
import { assertClientPaymentActive } from "./utils";
import { INVITATION_ERRORS } from "./errors";

// Verifica que el usuario tenga rol CLIENT activo.
async function requireClientRole(ctx: any): Promise<void> {
    const user = await mustGetCurrentUser(ctx);
    const roles = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q: any) => q.eq("user_id", user._id).eq("active", true))
        .collect();
    const isClient = roles.some((r: any) => r.role === "CLIENT");
    if (!isClient) throw new Error(INVITATION_ERRORS.ACCESS_DENIED_CLIENT);
}

// Verifica que el usuario tenga rol ADMIN o SUPER_ADMIN activo.
async function requireAdminRole(ctx: any): Promise<void> {
    const user = await mustGetCurrentUser(ctx);
    const roles = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q: any) => q.eq("user_id", user._id).eq("active", true))
        .collect();
    const isAdmin = roles.some((r: any) => r.role === "ADMIN" || r.role === "SUPER_ADMIN");
    if (!isAdmin) throw new Error(INVITATION_ERRORS.ACCESS_DENIED_ADMIN);
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
    throw new Error(INVITATION_ERRORS.TOKEN_GENERATION_FAILED);
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
            throw new Error(INVITATION_ERRORS.CLIENT_INVITER_NOT_FOUND);
        }
        if (inviterClient.user_id !== user._id) {
            throw new Error(INVITATION_ERRORS.CLIENT_UNAUTHORIZED);
        }

        await assertClientPaymentActive(ctx, inviterClientId);

        // Validar límite de invitaciones en el último mes
        const now = Date.now();
        const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000; // 30 días atrás
        const recentInvitations = await ctx.db
            .query("invitations")
            .filter((q: any) =>
                q.and(
                    q.eq(q.field("inviter_client_id"), inviterClientId),
                    q.gte(q.field("created_at"), oneMonthAgo),
                    q.eq(q.field("active"), true)
                )
            )
            .collect();

        if (recentInvitations.length >= MAX_INVITATIONS_PER_MONTH) {
            throw new Error(INVITATION_ERRORS.INVITATION_LIMIT_REACHED);
        }

        const token = await generateUniqueToken(ctx);
        const expiresAt = now + 10 * 24 * 60 * 60 * 1000; // 10 días

        const invitationId = await ctx.db.insert("invitations", {
            inviter_client_id: inviterClientId,
            invitee_name: data.invitee_name,
            invitee_email: data.invitee_email,
            invitee_phone: data.invitee_phone,
            invitee_document_number: data.invitee_document_number,
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
        if (!inv || inv.active !== true) throw new Error(INVITATION_ERRORS.INVITATION_NOT_FOUND);

        // Solo el cliente invitador puede cancelarla
        const inviterClient = await ctx.db.get(inv.inviter_client_id);
        if (!inviterClient || inviterClient.user_id !== user._id) {
            throw new Error(INVITATION_ERRORS.INVITATION_CANCEL_UNAUTHORIZED);
        }

        if (inv.status !== "PENDING") {
            throw new Error(INVITATION_ERRORS.INVITATION_CANCEL_NOT_PENDING);
        }

        await ctx.db.patch(invitationId, { status: "CANCELED", active: false, updated_at: Date.now() });
        return invitationId;
    },
});

export const redeemInvitation = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireAdminRole(ctx);

        const data = validateWithZod(redeemInvitationSchema, args.payload, "redeemInvitation");
        const invitationId = data.invitation_id as Id<"invitations">;

        const inv = await ctx.db.get(invitationId);
        if (!inv || inv.active !== true) {
            throw new Error(INVITATION_ERRORS.INVITATION_NOT_FOUND);
        }

        if (inv.status !== "PENDING") {
            throw new Error(INVITATION_ERRORS.INVITATION_REDEEM_NOT_PENDING);
        }

        // Verificar que no haya expirado
        const now = Date.now();
        if (inv.expires_at < now) {
            // Marcar como expirada
            await ctx.db.patch(invitationId, { status: "EXPIRED", updated_at: now });
            throw new Error(INVITATION_ERRORS.INVITATION_EXPIRED);
        }

        await ctx.db.patch(invitationId, { status: "REDEEMED", updated_at: now });
        return invitationId;
    },
});
