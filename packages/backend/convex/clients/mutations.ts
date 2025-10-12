import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mustGetCurrentUser } from "../users";
import {
    createClientSchema,
    updateClientSchema,
    setClientPaymentActiveSchema,
    validateWithZod,
} from "./validations";
import { assertClientUniquePerson } from "./utils";
import { getCurrentActiveAdmin } from "../admins/utils";

// Helper: usuario actual es SUPER_ADMIN?
async function isSuperAdmin(ctx: any): Promise<boolean> {
    const user = await mustGetCurrentUser(ctx);
    const roles = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q: any) => q.eq("user_id", user._id).eq("active", true))
        .collect();
    return roles.some((r: any) => r.role === "SUPER_ADMIN");
}

// Crea cliente. Requiere: SUPER_ADMIN o ADMIN.
export const createClient = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const user = await mustGetCurrentUser(ctx);

        // permitir si es super_admin o si tiene un admin activo (cualquier branch)
        let allowed = await isSuperAdmin(ctx);
        if (!allowed) {
            const admin = await getCurrentActiveAdmin(ctx);
            if (admin) allowed = true;
        }
        if (!allowed) {
            throw new Error("Acceso denegado: requiere rol ADMIN o SUPER_ADMIN.");
        }

        const data = validateWithZod(createClientSchema, args.payload, "createClient");
        await assertClientUniquePerson(ctx, data.person_id as Id<"persons">);

        const now = Date.now();
        const clientId = await ctx.db.insert("clients", {
            person_id: data.person_id as Id<"persons">,
            user_id: data.user_id ? (data.user_id as Id<"users">) : undefined,
            status: data.status,
            is_payment_active: data.is_payment_active,
            join_date: data.join_date,
            end_date: data.end_date,
            created_by_user_id: user._id as Id<"users">,
            created_at: now,
            updated_at: now,
            active: true,
        });

        return clientId;
    },
});

// Actualiza cliente. Requiere ADMIN de alguna branch a la que el cliente esté vinculado.
export const updateClient = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(updateClientSchema, args.payload, "updateClient");
        const clientId = data.client_id as Id<"clients">;

        const client = await ctx.db.get(clientId);
        if (!client || client.active !== true) throw new Error("Cliente no encontrado o inactivo.");

        // Debe ser ADMIN de una branch relacionada al cliente
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

        if (!link) {
            throw new Error("Acceso denegado: el cliente no pertenece a la sede del ADMIN.");
        }

        const patch: any = {};
        if (data.status !== undefined) patch.status = data.status;
        if (data.is_payment_active !== undefined) patch.is_payment_active = data.is_payment_active;
        if (data.join_date !== undefined) patch.join_date = data.join_date;
        if (data.end_date !== undefined) patch.end_date = data.end_date;
        patch.updated_at = Date.now();

        await ctx.db.patch(clientId, patch);
        return clientId;
    },
});

// Cambia flag de pago activo. Requiere ADMIN de la sede a la que pertenece el cliente.
export const setClientPaymentActive = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(setClientPaymentActiveSchema, args.payload, "setClientPaymentActive");
        const clientId = data.client_id as Id<"clients">;

        const admin = await getCurrentActiveAdmin(ctx);
        if (!admin || !admin.branch_id) throw new Error("Acceso denegado: requiere ADMIN asignado a una sede.");

        const link = await ctx.db
            .query("client_branches")
            .withIndex("by_client", (q) => q.eq("client_id", clientId))
            .filter((q) => q.eq(q.field("branch_id"), admin.branch_id as Id<"branches">))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (!link) throw new Error("El cliente no pertenece a la sede del ADMIN.");

        await ctx.db.patch(clientId, { is_payment_active: data.is_payment_active, updated_at: Date.now() });
        return clientId;
    },
});
