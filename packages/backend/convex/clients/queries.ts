import { query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mustGetCurrentUser } from "../users";
import {
    getClientSchema,
    listClientsByBranchSchema,
    validateWithZod,
} from "./validations";
import { getCurrentActiveAdmin } from "../admins/utils";

// helper: es SUPER_ADMIN?
async function isSuperAdmin(ctx: any): Promise<boolean> {
    const user = await mustGetCurrentUser(ctx);
    const roles = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q: any) => q.eq("user_id", user._id).eq("active", true))
        .collect();
    return roles.some((r: any) => r.role === "SUPER_ADMIN");
}

// Obtener cliente por id (SUPER_ADMIN libre - ADMIN solo si pertenece a su branch).
export const getClient = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(getClientSchema, args.payload, "getClient");
        const clientId = data.client_id as Id<"clients">;

        const client = await ctx.db.get(clientId);
        if (!client) throw new Error("Cliente no encontrado.");

        if (await isSuperAdmin(ctx)) {
            return client;
        }

        const admin = await getCurrentActiveAdmin(ctx);
        if (!admin || !admin.branch_id) {
            throw new Error("Acceso denegado: requiere ADMIN asignado a una sede.");
        }

        const link = await ctx.db
            .query("client_branches")
            .withIndex("by_client", (q) => q.eq("client_id", clientId))
            .filter((q) => q.eq(q.field("branch_id"), admin.branch_id as Id<"branches">))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (!link) throw new Error("Acceso denegado: el cliente no pertenece a la sede del ADMIN.");

        return client;
    },
});

// Listar clientes por branch (solo ADMIN de esa branch).
export const listClientsByBranch = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(listClientsByBranchSchema, args.payload, "listClientsByBranch");
        const branchId = data.branch_id as Id<"branches">;

        const admin = await getCurrentActiveAdmin(ctx);
        if (!admin || admin.branch_id !== branchId) {
            throw new Error("Acceso denegado: requiere ADMIN asignado a esta sede.");
        }

        const links = await ctx.db
            .query("client_branches")
            .withIndex("by_branch", (q) => q.eq("branch_id", branchId))
            .filter((q) => q.eq(q.field("active"), true))
            .collect();

        // Traer clientes y aplicar filtro opcional por status
        const clients = await Promise.all(
            links.map((l) => ctx.db.get(l.client_id as Id<"clients">))
        );

        const filtered = clients
            .filter((c): c is NonNullable<typeof c> => !!c)
            .filter((c) => (data.status ? c.status === data.status : true));

        return filtered;
    },
});
