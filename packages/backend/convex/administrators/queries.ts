import { query } from "../_generated/server";
import { QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { requireSuperAdmin } from "./utils";
import { AdminInactiveError, AdminNotFoundError } from "./errors";

export const getAllWithDetails = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        await requireSuperAdmin(ctx);

        const administrators = await ctx.db
            .query("administrators")
            .collect();

        // Obtener todas las personas y usuarios relacionados
        const personIds = administrators.map(admin => admin.person_id);
        const persons = await ctx.db
            .query("persons")
            .filter(q => q.and(...personIds.map(id => q.eq(q.field("_id"), id))))
            .collect();

        const userIds = persons.map(person => person.user_id);
        const users = await ctx.db
            .query("users")
            .filter(q => q.and(...userIds.map(id => q.eq(q.field("_id"), id))))
            .collect();

        // Obtener todas las sucursales relacionadas
        const branchIds = administrators
            .map(admin => admin.branch_id)
            .filter((id): id is Id<"branches"> => id !== undefined);

        const branches = branchIds.length > 0
            ? await ctx.db
                .query("branches")
                .filter(q => q.and(...branchIds.map(id => q.eq(q.field("_id"), id))))
                .collect()
            : [];

        // Construir respuesta detallada
        return administrators.map(admin => {
            const person = persons.find(p => p._id === admin.person_id);
            const user = person ? users.find(u => u._id === person.user_id) : null;
            const branch = admin.branch_id ? branches.find(b => b._id === admin.branch_id) : null;

            return {
                ...admin,
                person_data: person || null,
                user_data: user || null,
                branch_data: branch || null
            };
        });
    }
});

/**
 * Obtiene los detalles de un administrador específico
 */
export const getById = query({
    args: { admin_id: v.id("administrators") },
    handler: async (ctx: QueryCtx, args) => {
        await requireSuperAdmin(ctx);

        const admin = await ctx.db.get(args.admin_id);
        if (!admin) {
            throw new AdminNotFoundError();
        }

        if (admin.status !== "ACTIVE") {
            throw new AdminInactiveError();
        }

        const person = await ctx.db.get(admin.person_id);
        const user = person ? await ctx.db.get(person.user_id) : null;
        const branch = admin.branch_id ? await ctx.db.get(admin.branch_id) : null;

        return {
            ...admin,
            person_data: person || null,
            user_data: user || null,
            branch_data: branch || null
        };
    }
});

/**
 * Obtiene los administradores por sucursal
 */
export const getByBranch = query({
    args: { branch_id: v.id("branches") },
    handler: async (ctx: QueryCtx, args) => {
        await requireSuperAdmin(ctx);

        const administrators = await ctx.db
            .query("administrators")
            .withIndex("by_branch", (q) => q.eq("branch_id", args.branch_id))
            .collect();

        // Obtener personas y usuarios relacionados
        const personIds = administrators.map(admin => admin.person_id);
        const persons = await ctx.db
            .query("persons")
            .filter(q => q.and(...personIds.map(id => q.eq(q.field("_id"), id))))
            .collect();

        const userIds = persons.map(person => person.user_id);
        const users = await ctx.db
            .query("users")
            .filter(q => q.and(...userIds.map(id => q.eq(q.field("_id"), id))))
            .collect();

        // Construir respuesta
        return administrators.map(admin => {
            const person = persons.find(p => p._id === admin.person_id);
            const user = person ? users.find(u => u._id === person.user_id) : null;

            return {
                ...admin,
                person_data: person || null,
                user_data: user || null
            };
        });
    }
});