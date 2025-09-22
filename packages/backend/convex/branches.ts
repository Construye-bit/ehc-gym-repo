import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addBranch = mutation({
    args: {
        name: v.string(),
        address_id: v.id("addresses"),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        opening_time: v.string(),
        closing_time: v.string(),
        max_capacity: v.number(),
        opening_date: v.optional(v.number()),
        manager_id: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        // Verificar autenticación
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // Buscar el usuario autenticado
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .first();

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Verificar si el usuario tiene rol de SUPER_ADMIN
        const roleAssignment = await ctx.db
            .query("role_assignments")
            .filter((q) => 
                q.and(
                    q.eq(q.field("user_id"), user._id),
                    q.eq(q.field("role"), "SUPER_ADMIN"),
                    q.eq(q.field("active"), true)
                )
            )
            .first();

        if (!roleAssignment) {
            throw new Error("No tienes permisos para crear sedes. Se requiere rol de SUPER_ADMIN.");
        }

        // Crear la nueva sede
        const now = Date.now();
        const branchId = await ctx.db.insert("branches", {
            name: args.name,
            address_id: args.address_id,
            phone: args.phone,
            email: args.email,
            opening_time: args.opening_time,
            closing_time: args.closing_time,
            max_capacity: args.max_capacity,
            current_capacity: 0,
            status: "ACTIVE",
            opening_date: args.opening_date,
            manager_id: args.manager_id,
            created_by_user_id: user._id,
            created_at: now,
            updated_at: now,
        });

        return {
            success: true,
            branchId,
            message: "Sede creada exitosamente"
        };
    },
});