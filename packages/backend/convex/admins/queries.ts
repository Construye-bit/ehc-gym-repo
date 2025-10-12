import { query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { requireSuperAdmin } from "../branches/utils";
import { mustGetCurrentUser } from "../users";
import { getAdminSchema, validateWithZod } from "./validations";

// Obtener un admin por id. Solo SUPER_ADMIN.
export const getAdmin = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);
        const data = validateWithZod(getAdminSchema, args.payload, "getAdmin");
        const admin = await ctx.db.get(data.admin_id as Id<"admins">);
        if (!admin) throw new Error("Admin no encontrado.");
        return admin;
    },
});

// Listar admins sin sede asignada (branch_id undefined). Solo SUPER_ADMIN.
export const listAdminsUnassigned = query({
    args: {},
    handler: async (ctx) => {
        await requireSuperAdmin(ctx);
        const admins = await ctx.db
            .query("admins")
            .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
            .filter((q) => q.eq(q.field("active"), true))
            .filter((q) => q.eq(q.field("branch_id"), undefined as unknown as Id<"branches">))
            .collect();
        return admins;
    },
});

// Obtener admin del usuario actual (si existe y activo). Requiere sesión.
export const getAdminByUser = query({
    args: {},
    handler: async (ctx) => {
        const user = await mustGetCurrentUser(ctx);
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .filter((q) => q.eq(q.field("status"), "ACTIVE"))
            .filter((q) => q.eq(q.field("active"), true))
            .first();
        return admin ?? null;
    },
});

// === Obtener la sede del admin autenticado ===
export const getMyBranch = query({
    args: {},
    handler: async (ctx) => {
        const user = await mustGetCurrentUser(ctx);

        // Buscar admin activo del usuario actual
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .filter((q) => q.eq(q.field("status"), "ACTIVE"))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (!admin || !admin.branch_id) {
            return null;
        }

        const branch = await ctx.db.get(admin.branch_id);
        return branch ?? null;
    },
});