import { mutation } from "../_generated/server";
import { requireSuperAdmin } from "./utils";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { mustGetCurrentUser } from "../users";
import {
    createBranchSchema,
    updateBranchSchema,
    deleteBranchSchema,
    validateWithZod
} from './validations';

export const create = mutation({
    args: {
        name: v.string(),
        address_id: v.id("addresses"),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        opening_time: v.string(), // "06:00"
        closing_time: v.string(), // "22:00"
        max_capacity: v.number(),
        manager_id: v.optional(v.id("users")),
        status: v.optional(v.union(
            v.literal("ACTIVE"),
            v.literal("INACTIVE"),
            v.literal("UNDER_CONSTRUCTION"),
            v.literal("TEMPORARILY_CLOSED")
        )),
        opening_date: v.optional(v.number()),
        metadata: v.optional(v.object({
            has_parking: v.optional(v.boolean()),
            has_pool: v.optional(v.boolean()),
            has_sauna: v.optional(v.boolean()),
            has_spa: v.optional(v.boolean()),
            has_locker_rooms: v.optional(v.boolean()),
            wifi_available: v.optional(v.boolean()),
        })),
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);
        const user = await mustGetCurrentUser(ctx);

        // Validar datos de entrada con Zod
        const validatedData = validateWithZod(createBranchSchema, args, "create branch");

        // Verificar que no existe una sede con el mismo nombre
        const existingBranch = await ctx.db
            .query("branches")
            .filter((q) => q.eq(q.field("name"), validatedData.name))
            .first();

        if (existingBranch) {
            throw new Error("Ya existe una sede con ese nombre");
        }

        // Verificar que la dirección existe
        const address = await ctx.db.get(validatedData.address_id as Id<"addresses">);
        if (!address) {
            throw new Error("Dirección no encontrada");
        }

        // Verificar que el manager existe si se proporciona
        if (validatedData.manager_id) {
            const manager = await ctx.db.get(validatedData.manager_id as Id<"users">);
            if (!manager) {
                throw new Error("Usuario administrador no encontrado");
            }
        }

        const now = Date.now();

        const branchId = await ctx.db.insert("branches", {
            name: validatedData.name,
            address_id: validatedData.address_id as Id<"addresses">,
            phone: validatedData.phone,
            email: validatedData.email,
            opening_time: validatedData.opening_time,
            closing_time: validatedData.closing_time,
            max_capacity: validatedData.max_capacity,
            current_capacity: 0, // Iniciar en 0
            status: validatedData.status,
            opening_date: validatedData.opening_date,
            manager_id: validatedData.manager_id as Id<"users"> | undefined,
            created_by_user_id: user._id,
            created_at: now,
            updated_at: now,
            metadata: validatedData.metadata,
        });

        return { success: true, branchId };
    },
});

export const update = mutation({
    args: {
        branchId: v.id("branches"),
        name: v.optional(v.string()),
        address_id: v.optional(v.id("addresses")),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        opening_time: v.optional(v.string()),
        closing_time: v.optional(v.string()),
        max_capacity: v.optional(v.number()),
        manager_id: v.optional(v.id("users")),
        status: v.optional(v.union(
            v.literal("ACTIVE"),
            v.literal("INACTIVE"),
            v.literal("UNDER_CONSTRUCTION"),
            v.literal("TEMPORARILY_CLOSED")
        )),
        opening_date: v.optional(v.number()),
        metadata: v.optional(v.object({
            has_parking: v.optional(v.boolean()),
            has_pool: v.optional(v.boolean()),
            has_sauna: v.optional(v.boolean()),
            has_spa: v.optional(v.boolean()),
            has_locker_rooms: v.optional(v.boolean()),
            wifi_available: v.optional(v.boolean()),
        })),
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);

        // Validar datos de entrada con Zod
        const validatedData = validateWithZod(updateBranchSchema, args, "update branch");
        const { branchId, ...updates } = validatedData;

        const branch = await ctx.db.get(branchId as Id<"branches">);
        if (!branch) {
            throw new Error("Sede no encontrada");
        }

        // Verificar nombre único si se está actualizando
        if (updates.name && updates.name !== branch.name) {
            const existingBranch = await ctx.db
                .query("branches")
                .filter((q) =>
                    q.and(
                        q.eq(q.field("name"), updates.name!),
                        q.neq(q.field("_id"), branchId as Id<"branches">)
                    )
                )
                .first();

            if (existingBranch) {
                throw new Error("Ya existe una sede con ese nombre");
            }
        }

        // Verificar que la nueva dirección existe si se está actualizando
        if (updates.address_id) {
            const address = await ctx.db.get(updates.address_id as Id<"addresses">);
            if (!address) {
                throw new Error("Dirección no encontrada");
            }
        }

        // Verificar que el nuevo manager existe si se está actualizando
        if (updates.manager_id) {
            const manager = await ctx.db.get(updates.manager_id as Id<"users">);
            if (!manager) {
                throw new Error("Usuario administrador no encontrado");
            }
        }

        await ctx.db.patch(branchId as Id<"branches">, {
            ...updates,
            address_id: updates.address_id as Id<"addresses"> | undefined,
            manager_id: updates.manager_id as Id<"users"> | undefined,
            updated_at: Date.now(),
        });

        return { success: true };
    },
});

export const deleteBranch = mutation({
    args: { branchId: v.string() },
    handler: async (ctx, { branchId }) => {
        await requireSuperAdmin(ctx);

        // Verificar si hay entrenadores asignados a esta sede
        const trainersInBranch = await ctx.db
            .query("trainers")
            .withIndex("by_branch", (q) => q.eq("branch_id", branchId as Id<"branches">))
            .first();

        if (trainersInBranch) {
            throw new Error("No se puede eliminar la sede porque tiene entrenadores asignados");
        }

        await ctx.db.delete(branchId as Id<"branches">);
        return { success: true };
    }
});
