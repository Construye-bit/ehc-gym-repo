import { query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mustGetCurrentUser } from "../users";
import {
    listInvitationsByBranchSchema,
    listInvitationsByInviterSchema,
    validateWithZod,
} from "./validations";

// helper: es CLIENT?
async function requireClientRole(ctx: any): Promise<void> {
    const user = await mustGetCurrentUser(ctx);
    const roles = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q: any) => q.eq("user_id", user._id).eq("active", true))
        .collect();
    const isClient = roles.some((r: any) => r.role === "CLIENT");
    if (!isClient) throw new Error("Acceso denegado: requiere rol CLIENT.");
}

// helper: es ADMIN asignado a branch?
async function requireAdminOfBranch(ctx: any, branchId: Id<"branches">): Promise<void> {
    const user = await mustGetCurrentUser(ctx);
    const admin = await ctx.db
        .query("admins")
        .withIndex("by_user", (q: any) => q.eq("user_id", user._id))
        .filter((q: any) => q.eq(q.field("status"), "ACTIVE"))
        .filter((q: any) => q.eq(q.field("active"), true))
        .filter((q: any) => q.eq(q.field("branch_id"), branchId))
        .first();
    if (!admin) throw new Error("Acceso denegado: requiere ADMIN de esta sede.");
}

// Listar invitaciones relacionadas a una branch:
// - Incluye invitaciones con preferred_branch_id = branch
// - Incluye invitaciones creadas por clientes vinculados a la branch
export const listInvitationsByBranch = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(listInvitationsByBranchSchema, args.payload, "listInvitationsByBranch");
        const branchId = data.branch_id as Id<"branches">;

        await requireAdminOfBranch(ctx, branchId);

        // 1) Invitaciones dirigidas explícitamente a la branch
        const directed = await ctx.db
            .query("invitations")
            .withIndex("by_preferred_branch", (q) => q.eq("preferred_branch_id", branchId))
            .filter((q) => q.eq(q.field("active"), true))
            .collect();

        // 2) Invitaciones de clientes de la branch
        const links = await ctx.db
            .query("client_branches")
            .withIndex("by_branch", (q) => q.eq("branch_id", branchId))
            .filter((q) => q.eq(q.field("active"), true))
            .collect();

        // Por cada client, traer invitaciones
        const byClientsArrays = await Promise.all(
            links.map((l) =>
                ctx.db
                    .query("invitations")
                    .withIndex("by_inviter_client", (q) => q.eq("inviter_client_id", l.client_id as Id<"clients">))
                    .filter((q) => q.eq(q.field("active"), true))
                    .collect()
            )
        );

        const byClients = byClientsArrays.flat();

        // Unir sin duplicar por _id
        const map = new Map<string, any>();
        [...directed, ...byClients].forEach((inv) => map.set(inv._id as unknown as string, inv));
        return Array.from(map.values());
    },
});

// Listar invitaciones de un cliente (el dueño debe ser el usuario actual).
export const listInvitationsByInviter = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireClientRole(ctx);

        const data = validateWithZod(
            listInvitationsByInviterSchema,
            args.payload,
            "listInvitationsByInviter"
        );

        const user = await mustGetCurrentUser(ctx);
        const client = await ctx.db.get(data.inviter_client_id as Id<"clients">);
        if (!client) throw new Error("Cliente no encontrado.");
        if (client.user_id !== user._id) {
            throw new Error("No autorizado: el cliente no pertenece al usuario actual.");
        }

        const invitations = await ctx.db
            .query("invitations")
            .withIndex("by_inviter_client", (q) =>
                q.eq("inviter_client_id", data.inviter_client_id as Id<"clients">)
            )
            .collect();

        return invitations;
    },
});
