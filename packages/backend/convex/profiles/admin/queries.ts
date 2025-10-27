// convex/profiles/admin/queries.ts
import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getUserProfileByIdSchema, validateWithZod } from "./validations";
import { hasRole, isSuperAdmin } from "../common/utils";

// Devuelve un perfil agregado por user_id (ADMIN o SA)
export const getUserProfileById = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(
            getUserProfileByIdSchema,
            args.payload,
            "getUserProfileById"
        );

        const isSA = await isSuperAdmin(ctx);
        const isAdmin = await hasRole(ctx, "ADMIN");
        if (!isSA && !isAdmin) {
            throw new Error("Acceso denegado: requiere ADMIN o SUPER_ADMIN.");
        }

        const userId = data.user_id as Id<"users">;

        const user = await ctx.db.get(userId);
        if (!user) throw new Error("Usuario no encontrado.");

        const person = await ctx.db
            .query("persons")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .first();

        const roles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", userId).eq("active", true)
            )
            .collect();

        const client = await ctx.db
            .query("clients")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .first();

        const trainer = await ctx.db
            .query("trainers")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .first();

        const admin = await ctx.db
            .query("admins")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .first();

        // Enriquecimientos
        let preferences: any = null;
        let latestHealth: any = null;
        let activeContracts: any[] = [];

        if (client) {
            // Datos agregados del lado CLIENTE
            preferences = await ctx.db
                .query("client_preferences")
                .withIndex("by_client", (q) => q.eq("client_id", client._id))
                .first();

            latestHealth = await ctx.db
                .query("client_health_metrics")
                .withIndex("by_client_measured", (q) =>
                    q.eq("client_id", client._id).gte("measured_at", 0)
                )
                .order("desc")
                .first();

            activeContracts = await ctx.db
                .query("client_trainer_contracts")
                .withIndex("by_client_status", (q) =>
                    q.eq("client_id", client._id).eq("status", "ACTIVE")
                )
                .collect();
        } else if (trainer) {
            // Si no es client pero sí trainer, listamos contratos activos del lado TRAINER
            activeContracts = await ctx.db
                .query("client_trainer_contracts")
                .withIndex("by_trainer_status", (q) =>
                    q.eq("trainer_id", trainer._id).eq("status", "ACTIVE")
                )
                .collect();
        }

        return {
            user,
            person: person ?? null,
            roles,
            client: client ?? null,
            trainer: trainer ?? null,
            admin: admin ?? null,
            preferences,
            latestHealth,
            activeContracts,
        };
    },
});
