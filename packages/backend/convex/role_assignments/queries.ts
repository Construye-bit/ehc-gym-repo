import { query } from "../_generated/server";
import { v } from "convex/values";

// Query para obtener todos los roles activos de un usuario
export const getUserRoles = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        const roles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", userId).eq("active", true)
            )
            .collect();

        return roles;
    },
});

// Query para obtener los nombres de los roles de un usuario (simplificado)
export const getUserRoleNames = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        const roles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", userId).eq("active", true)
            )
            .collect();

        return roles.map((r) => r.role);
    },
});

// Query para verificar si un usuario tiene un rol específico
export const userHasRole = query({
    args: {
        userId: v.id("users"),
        role: v.union(
            v.literal("CLIENT"),
            v.literal("TRAINER"),
            v.literal("ADMIN"),
            v.literal("SUPER_ADMIN")
        ),
    },
    handler: async (ctx, { userId, role }) => {
        const roleAssignment = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_role", (q) =>
                q.eq("user_id", userId).eq("role", role)
            )
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        return roleAssignment !== null;
    },
});

// Query para obtener información completa del usuario autenticado con roles
export const getCurrentUserWithRoles = query({
    handler: async (ctx) => {
        // Obtener la identidad del usuario autenticado
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        // Buscar el usuario en la base de datos
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .unique();

        if (!user) {
            return null;
        }

        // Obtener los roles del usuario
        const roles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", user._id).eq("active", true)
            )
            .collect();

        // Obtener la persona asociada al usuario
        const person = await ctx.db
            .query("persons")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        return {
            user,
            person,
            roles: roles.map((r) => r.role),
            roleAssignments: roles,
        };
    },
});
