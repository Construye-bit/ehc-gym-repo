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