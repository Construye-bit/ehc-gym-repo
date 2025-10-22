import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
    adminSetClientContractSchema,
    adminEditPersonSchema,
    adminEditTrainerSchema,
    adminSetRoleAssignmentSchema,
    validateWithZod,
} from "./validations";
import {
    getCurrentUser,
    isSuperAdmin,
    hasRole,
    requireAdminForClientBranch,
    rateLimitRecentWrites,
    getMyAdminRecord,
} from "../common/utils";

// Crear/actualizar contrato client↔trainer (enforce 1 ACTIVE por pareja)
export const adminSetClientContract = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            adminSetClientContractSchema,
            args.payload,
            "adminSetClientContract"
        );

        const user = await getCurrentUser(ctx);
        const isSA = await isSuperAdmin(ctx);
        const isAdmin = await hasRole(ctx, "ADMIN");
        if (!isSA && !isAdmin) {
            throw new Error("Acceso denegado: requiere ADMIN o SUPER_ADMIN.");
        }

        const clientId = data.client_id as Id<"clients">;
        const trainerId = data.trainer_id as Id<"trainers">;

        // Si es ADMIN (no SA), validar alcance por branch del CLIENT
        if (!isSA) {
            await requireAdminForClientBranch(ctx, clientId);
        }

        // Rate limit escrituras
        await rateLimitRecentWrites(ctx, {
            table: "client_trainer_contracts",
            userId: user._id,
            windowMs: 60_000,
            max: 10,
        });

        const now = Date.now();

        // Buscar contrato existente por pareja
        const existing = await ctx.db
            .query("client_trainer_contracts")
            .withIndex("by_pair", (q) =>
                q.eq("client_id", clientId).eq("trainer_id", trainerId)
            )
            .first();

        // Enforce: No permitir dos ACTIVE simultáneos por pareja.
        if (data.status === "ACTIVE") {
            const active = await ctx.db
                .query("client_trainer_contracts")
                .withIndex("by_pair", (q) =>
                    q.eq("client_id", clientId).eq("trainer_id", trainerId)
                )
                .filter((q) => q.eq(q.field("status"), "ACTIVE"))
                .first();
            if (active && (!existing || active._id !== existing._id)) {
                throw new Error("Ya existe un contrato ACTIVE para esta pareja client↔trainer.");
            }
        }

        if (existing) {
            await ctx.db.patch(existing._id, {
                status: data.status,
                start_at: data.start_at,
                end_at: data.end_at,
                notes: data.notes,
                updated_at: now,
            });
            return existing._id;
        } else {
            const id = await ctx.db.insert("client_trainer_contracts", {
                client_id: clientId,
                trainer_id: trainerId,
                status: data.status,
                start_at: data.start_at,
                end_at: data.end_at,
                notes: data.notes,
                created_by_user_id: user._id,
                created_at: now,
                updated_at: now,
            });
            return id;
        }
    },
});

// Editar datos de persons (ADMIN o SA)
export const adminEditPerson = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            adminEditPersonSchema,
            args.payload,
            "adminEditPerson"
        );

        const isSA = await isSuperAdmin(ctx);
        const isAdmin = await hasRole(ctx, "ADMIN");
        if (!isSA && !isAdmin) {
            throw new Error("Acceso denegado: requiere ADMIN o SUPER_ADMIN.");
        }

        const personId = data.person_id as Id<"persons">;
        const person = await ctx.db.get(personId);
        if (!person) throw new Error("Persona no encontrada.");

        await ctx.db.patch(personId, {
            ...data.patch,
            updated_at: Date.now(),
        });
        return personId;
    },
});

// Editar trainer (ADMIN de la branch del trainer o SA)
export const adminEditTrainer = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            adminEditTrainerSchema,
            args.payload,
            "adminEditTrainer"
        );

        const isSA = await isSuperAdmin(ctx);
        const isAdmin = await hasRole(ctx, "ADMIN");
        if (!isSA && !isAdmin) {
            throw new Error("Acceso denegado: requiere ADMIN o SUPER_ADMIN.");
        }

        const trainerId = data.trainer_id as Id<"trainers">;
        const trainer = await ctx.db.get(trainerId);
        if (!trainer) throw new Error("Entrenador no encontrado.");

        // Si es ADMIN (no SA), validar que el trainer sea de su branch
        if (!isSA) {
            const myAdmin = await getMyAdminRecord(ctx);
            if (!myAdmin || !myAdmin.branch_id || trainer.branch_id !== myAdmin.branch_id) {
                throw new Error("Acceso denegado: el entrenador no pertenece a tu sede.");
            }
        }

        await ctx.db.patch(trainerId, {
            ...data.patch,
            updated_at: Date.now(),
        });
        return trainerId;
    },
});

// Upsert de role_assignment (ADMIN/SA). Crea o cambia active de uno existente.
export const adminSetRoleAssignment = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            adminSetRoleAssignmentSchema,
            args.payload,
            "adminSetRoleAssignment"
        );

        const user = await getCurrentUser(ctx);
        const isSA = await isSuperAdmin(ctx);
        const isAdmin = await hasRole(ctx, "ADMIN");
        if (!isSA && !isAdmin) {
            throw new Error("Acceso denegado: requiere ADMIN o SUPER_ADMIN.");
        }

        const targetUserId = data.user_id as Id<"users">;
        const now = Date.now();

        // Buscar por user+role y filtrar branch (si aplica)
        const existing = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_role", (q) => q.eq("user_id", targetUserId).eq("role", data.role))
            .filter((q) =>
                data.branch_id ? q.eq(q.field("branch_id"), data.branch_id) : q.eq(q.field("branch_id"), undefined as unknown as Id<"branches">)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                active: data.active,
                updated_at: now, // si existe en tu schema; si no, omítelo
            } as any);
            return existing._id;
        } else {
            const id = await ctx.db.insert("role_assignments", {
                user_id: targetUserId,
                role: data.role,
                branch_id: data.branch_id ? (data.branch_id as unknown as Id<"branches">) : undefined,
                assigned_at: now,
                assigned_by_user_id: user._id,
                expires_at: undefined,
                active: data.active,
            });
            return id;
        }
    },
});
