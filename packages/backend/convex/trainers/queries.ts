import { internalQuery, query } from "../_generated/server";
import { requireSuperAdmin } from "./utils";
import type { Id } from '../_generated/dataModel';
import { v } from "convex/values";

export const getAllWithDetails = query({
    args: {},
    handler: async (ctx) => {
        await requireSuperAdmin(ctx);

        const trainers = await ctx.db.query("trainers").collect();
        const trainersWithDetails = [];

        for (const trainer of trainers) {
            const person = trainer.person_id
                ? await ctx.db.get(trainer.person_id)
                : null;

            const branch = trainer.branch_id
                ? await ctx.db.get(trainer.branch_id)
                : null;

            trainersWithDetails.push({
                ...trainer,
                person: person
                    ? {
                        name: person.name,
                        last_name: person.last_name,
                        document_type: person.document_type,
                        document_number: person.document_number,
                        phone: person.phone,
                    }
                    : null,
                branch: branch
                    ? {
                        name: branch.name,
                    }
                    : null,
            });
        }

        return trainersWithDetails;
    },
});

export const getTrainersByBranch = internalQuery({
    args: {
        branchId: v.string(),
    },
    handler: async (ctx, { branchId }) => {
        await requireSuperAdmin(ctx);

        const trainers = await ctx.db
            .query("trainers")
            .withIndex("by_branch", (q) => q.eq("branch_id", branchId as Id<"branches">))
            .collect();

        const trainersWithDetails = [];

        for (const trainer of trainers) {
            const person = trainer.person_id
                ? await ctx.db.get(trainer.person_id)
                : null;

            trainersWithDetails.push({
                ...trainer,
                person: person
                    ? {
                        name: person.name,
                        last_name: person.last_name,
                        document_type: person.document_type,
                        document_number: person.document_number,
                        phone: person.phone,
                    }
                    : null,
            });
        }

        return trainersWithDetails;
    },
});

// Queries auxiliares para mutations
export const checkPersonByDocument = query({
    args: {
        document_number: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("persons")
            .filter((q) => q.eq(q.field("document_number"), args.document_number))
            .first();
    },
});

export const getBranchByName = query({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("branches")
            .filter((q) => q.eq(q.field("name"), args.name))
            .first();
    },
});

export const getBranchById = query({
    args: {
        branchId: v.id("branches"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.branchId);
    },
});

export const getUserByClerkId = query({
    args: {
        clerk_id: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", args.clerk_id))
            .first();
    },
});

export const checkAdminPermissions = query({
    args: {
        clerk_id: v.string(),
    },
    handler: async (ctx, args) => {
        // Buscar usuario por clerk_id
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", args.clerk_id))
            .first();

        if (!currentUser) {
            return { hasPermission: false, user: null };
        }

        // Buscar rol de admin
        const adminRole = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) => q.eq("user_id", currentUser._id).eq("active", true))
            .filter((q) => q.or(
                q.eq(q.field("role"), "ADMIN"),
                q.eq(q.field("role"), "SUPER_ADMIN")
            ))
            .first();

        return {
            hasPermission: !!adminRole,
            user: currentUser,
        };
    },
});

// Query para obtener trainer por ID
export const getTrainerById = query({
    args: {
        trainerId: v.id("trainers"),
    },
    handler: async (ctx, { trainerId }) => {
        return await ctx.db.get(trainerId);
    },
});

// Query para obtener detalles completos de un entrenador específico
export const getTrainerDetails = query({
    args: {
        trainerId: v.id("trainers"),
    },
    handler: async (ctx, { trainerId }) => {
        await requireSuperAdmin(ctx);

        // Obtener trainer
        const trainer = await ctx.db.get(trainerId);
        if (!trainer) {
            return null;
        }

        // Obtener persona asociada
        const person = trainer.person_id
            ? await ctx.db.get(trainer.person_id)
            : null;

        // Obtener usuario asociado
        const user = person?.user_id
            ? await ctx.db.get(person.user_id)
            : null;

        // Obtener sede asociada
        const branch = trainer.branch_id
            ? await ctx.db.get(trainer.branch_id)
            : null;

        // Obtener roles del usuario
        const roles = user
            ? await ctx.db
                .query("role_assignments")
                .withIndex("by_user_active", (q) =>
                    q.eq("user_id", user._id).eq("active", true)
                )
                .collect()
            : [];

        return {
            ...trainer,
            person: person
                ? {
                    _id: person._id,
                    name: person.name,
                    last_name: person.last_name,
                    born_date: person.born_date,
                    document_type: person.document_type,
                    document_number: person.document_number,
                    phone: person.phone,
                    created_at: person.created_at,
                    updated_at: person.updated_at,
                    active: person.active,
                }
                : null,
            user: user
                ? {
                    _id: user._id,
                    clerk_id: user.clerk_id,
                    name: user.name,
                    email: user.email,
                    active: user.active,
                }
                : null,
            branch: branch
                ? {
                    _id: branch._id,
                    name: branch.name,
                    address_id: branch.address_id,
                    phone: branch.phone,
                    email: branch.email,
                    opening_time: branch.opening_time,
                    closing_time: branch.closing_time,
                    status: branch.status,
                    max_capacity: branch.max_capacity,
                    current_capacity: branch.current_capacity,
                }
                : null,
            roles: roles.map(role => ({
                _id: role._id,
                role: role.role,
                assigned_at: role.assigned_at,
            })),
        };
    },
});

// Query para obtener roles por usuario ID
export const getRolesByUserId = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", userId).eq("active", true)
            )
            .collect();
    },
});