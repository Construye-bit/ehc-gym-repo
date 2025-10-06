import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mustGetCurrentUser } from "../users";
import { requireSuperAdmin } from "../branches/utils";
import {
    createAdminSchema,
    assignAdminToBranchSchema,
    revokeAdminFromBranchSchema,
    updateAdminStatusSchema,
    validateWithZod,
} from "./validations";

// Crea un admin (sin sede). Solo SUPER_ADMIN.
export const createAdmin = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);

        const data = validateWithZod(createAdminSchema, args.payload, "createAdmin");
        const current = await mustGetCurrentUser(ctx);

        const now = Date.now();
        const adminId = await ctx.db.insert("admins", {
            person_id: data.person_id as Id<"persons">,
            user_id: data.user_id ? (data.user_id as Id<"users">) : undefined,
            branch_id: undefined,
            status: "ACTIVE",
            created_by_user_id: current._id as Id<"users">,
            created_at: now,
            updated_at: now,
            active: true,
        });

        return adminId;
    },
});

// Asigna admin a sede (1:1). Solo SUPER_ADMIN.
export const assignAdminToBranch = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);

        const data = validateWithZod(assignAdminToBranchSchema, args.payload, "assignAdminToBranch");
        const adminId = data.admin_id as Id<"admins">;
        const branchId = data.branch_id as Id<"branches">;

        const admin = await ctx.db.get(adminId);
        if (!admin || admin.active !== true) {
            throw new Error("Admin no encontrado o inactivo.");
        }

        // Enforce 1:1: la branch no debe tener otro admin asignado activo
        const already = await ctx.db
            .query("admins")
            .withIndex("by_branch", (q) => q.eq("branch_id", branchId))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (already && already._id !== adminId) {
            throw new Error("La sede ya tiene un administrador asignado.");
        }

        await ctx.db.patch(adminId, { branch_id: branchId, updated_at: Date.now() });
        return adminId;
    },
});

// Quita la sede del admin. Solo SUPER_ADMIN.
export const revokeAdminFromBranch = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);

        const data = validateWithZod(revokeAdminFromBranchSchema, args.payload, "revokeAdminFromBranch");
        const adminId = data.admin_id as Id<"admins">;

        const admin = await ctx.db.get(adminId);
        if (!admin || admin.active !== true) {
            throw new Error("Admin no encontrado o inactivo.");
        }

        await ctx.db.patch(adminId, { branch_id: undefined, updated_at: Date.now() });
        return adminId;
    },
});

// Actualiza estado del admin. Solo SUPER_ADMIN.
export const updateAdminStatus = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);
        const data = validateWithZod(updateAdminStatusSchema, args.payload, "updateAdminStatus");

        const adminId = data.admin_id as Id<"admins">;
        const admin = await ctx.db.get(adminId);
        if (!admin) throw new Error("Admin no encontrado.");

        await ctx.db.patch(adminId, { status: data.status, updated_at: Date.now() });
        return adminId;
    },
});
