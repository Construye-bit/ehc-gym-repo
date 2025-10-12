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

// === Crear administrador completo (user + person + admin + role_assignment) ===
export const createAdministratorComplete = mutation({
    args: {
        userData: v.object({
            name: v.string(),
            email: v.string(),
            phone: v.string(),
        }),
        personalData: v.object({
            name: v.string(),
            last_name: v.string(),
            document_type: v.string(),
            document_number: v.string(),
            born_date: v.string(),
        }),
        workData: v.object({
            branchId: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);
        const current = await mustGetCurrentUser(ctx);
        const now = Date.now();

        try {
            // 1. Crear usuario
            const userId = await ctx.db.insert("users", {
                clerk_id: "", // Se debe integrar con Clerk en producción
                name: args.userData.name,
                email: args.userData.email,
                updated_at: now,
                active: true,
            });

            // 2. Crear persona
            const personId = await ctx.db.insert("persons", {
                user_id: userId,
                name: args.personalData.name,
                last_name: args.personalData.last_name,
                born_date: args.personalData.born_date,
                document_type: args.personalData.document_type as "CC" | "TI" | "CE" | "PASSPORT",
                document_number: args.personalData.document_number,
                phone: args.userData.phone,
                created_at: now,
                updated_at: now,
                active: true,
            });

            // 3. Crear admin
            const adminId = await ctx.db.insert("admins", {
                person_id: personId,
                user_id: userId,
                branch_id: args.workData.branchId ? (args.workData.branchId as Id<"branches">) : undefined,
                status: "ACTIVE",
                created_by_user_id: current._id,
                created_at: now,
                updated_at: now,
                active: true,
            });

            // 4. Crear role_assignment
            await ctx.db.insert("role_assignments", {
                user_id: userId,
                role: "ADMIN",
                branch_id: args.workData.branchId ? (args.workData.branchId as Id<"branches">) : undefined,
                assigned_at: now,
                assigned_by_user_id: current._id,
                active: true,
            });

            return {
                success: true,
                message: "Administrador creado exitosamente",
                adminId,
            };
        } catch (error) {
            console.error("Error al crear administrador completo:", error);
            throw new Error("Error al crear el administrador: " + (error instanceof Error ? error.message : "Error desconocido"));
        }
    },
});

// === Actualizar administrador completo ===
export const updateAdministratorComplete = mutation({
    args: {
        administratorId: v.id("admins"),
        userData: v.object({
            name: v.string(),
            email: v.string(),
            phone: v.string(),
        }),
        personalData: v.object({
            name: v.string(),
            last_name: v.string(),
            document_type: v.string(),
            document_number: v.string(),
            born_date: v.string(),
        }),
        workData: v.object({
            branchId: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);
        const now = Date.now();

        try {
            // 1. Obtener admin
            const admin = await ctx.db.get(args.administratorId);
            if (!admin) {
                throw new Error("Administrador no encontrado");
            }

            // 2. Actualizar usuario
            if (admin.user_id) {
                await ctx.db.patch(admin.user_id, {
                    name: args.userData.name,
                    email: args.userData.email,
                    updated_at: now,
                });
            }

            // 3. Actualizar persona
            if (admin.person_id) {
                await ctx.db.patch(admin.person_id, {
                    name: args.personalData.name,
                    last_name: args.personalData.last_name,
                    born_date: args.personalData.born_date,
                    document_type: args.personalData.document_type as "CC" | "TI" | "CE" | "PASSPORT",
                    document_number: args.personalData.document_number,
                    phone: args.userData.phone,
                    updated_at: now,
                });
            }

            // 4. Actualizar admin
            await ctx.db.patch(args.administratorId, {
                branch_id: args.workData.branchId ? (args.workData.branchId as Id<"branches">) : undefined,
                updated_at: now,
            });

            // 5. Actualizar role_assignment
            if (admin.user_id) {
                const userId = admin.user_id; // Capturar en variable local para type narrowing
                const roleAssignment = await ctx.db
                    .query("role_assignments")
                    .withIndex("by_user_role", (q) => q.eq("user_id", userId).eq("role", "ADMIN"))
                    .filter((q) => q.eq(q.field("active"), true))
                    .first();

                if (roleAssignment) {
                    await ctx.db.patch(roleAssignment._id, {
                        branch_id: args.workData.branchId ? (args.workData.branchId as Id<"branches">) : undefined,
                    });
                }
            }

            return {
                success: true,
                message: "Administrador actualizado exitosamente",
            };
        } catch (error) {
            console.error("Error al actualizar administrador:", error);
            throw new Error("Error al actualizar el administrador: " + (error instanceof Error ? error.message : "Error desconocido"));
        }
    },
});

// === Eliminar administrador completo ===
export const deleteAdministratorComplete = mutation({
    args: {
        administratorId: v.id("admins"),
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);
        const now = Date.now();

        try {
            // 1. Obtener admin
            const admin = await ctx.db.get(args.administratorId);
            if (!admin) {
                throw new Error("Administrador no encontrado");
            }

            // 2. Desactivar admin (soft delete)
            await ctx.db.patch(args.administratorId, {
                active: false,
                status: "INACTIVE",
                updated_at: now,
            });

            // 3. Desactivar usuario
            if (admin.user_id) {
                await ctx.db.patch(admin.user_id, {
                    active: false,
                    updated_at: now,
                });
            }

            // 4. Desactivar persona
            if (admin.person_id) {
                await ctx.db.patch(admin.person_id, {
                    active: false,
                    updated_at: now,
                });
            }

            // 5. Desactivar role_assignments
            if (admin.user_id) {
                const userId = admin.user_id; // Capturar en variable local para type narrowing
                const roleAssignments = await ctx.db
                    .query("role_assignments")
                    .withIndex("by_user_active", (q) => q.eq("user_id", userId).eq("active", true))
                    .collect();

                for (const roleAssignment of roleAssignments) {
                    await ctx.db.patch(roleAssignment._id, {
                        active: false,
                    });
                }
            }

            return {
                success: true,
                message: "Administrador eliminado exitosamente",
            };
        } catch (error) {
            console.error("Error al eliminar administrador:", error);
            throw new Error("Error al eliminar el administrador: " + (error instanceof Error ? error.message : "Error desconocido"));
        }
    },
});
