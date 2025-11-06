// convex/profiles/admin/queries.ts
import { query } from "../../_generated/server";
import { ensureAdmin } from "../common/utils";
import { getUserProfileByIdArgs } from "./validations";
import { ConvexError } from "convex/values";
import { Doc } from "../../_generated/dataModel"; // <-- **FIX 2: Importar Doc**

/**
 * (Admin) Obtiene el perfil completo de cualquier usuario por su ID.
 * Path: profiles/admin/queries:getUserProfileById
 */
export const getUserProfileById = query({
  args: getUserProfileByIdArgs,
  handler: async (ctx, args) => {
    await ensureAdmin(ctx);

    const { user_id } = args.payload;
    const user = await ctx.db.get(user_id);
    if (!user) {
      throw new ConvexError({ message: "NOT_FOUND: Usuario no encontrado", code: 404 });
    }

    // Buscar todos los perfiles asociados
    const person = await ctx.db
      .query("persons")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .unique();
    
    // <-- **FIX 1: Usar el índice correcto 'by_user_role' (o 'by_user_active')**
    const roles = await ctx.db
      .query("role_assignments")
      .withIndex("by_user_role", (q) => q.eq("user_id", user._id))
      .collect();

    const client = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .unique();
    const trainer = await ctx.db
      .query("trainers")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .unique();
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .unique();

    let preferences = null;
    let latestHealth = null;
    
    // <-- **FIX 2: Añadir tipo explícito a la variable**
    let activeContracts: Doc<"client_trainer_contracts">[] = [];

    if (client) {
      preferences = await ctx.db
        .query("client_preferences")
        .withIndex("by_client", (q) => q.eq("client_id", client._id))
        .first();

      latestHealth = await ctx.db
        .query("client_health_metrics")
        .withIndex("by_client_measured", (q) => q.eq("client_id", client._id))
        .order("desc")
        .first();

      activeContracts = await ctx.db
        .query("client_trainer_contracts")
        .withIndex("by_client_status", (q) =>
          q.eq("client_id", client._id).eq("status", "ACTIVE")
        )
        .collect();
    }

    return {
      user,
      person,
      roles,
      client,
      trainer,
      admin,
      preferences,
      latestHealth,
      activeContracts,
    };
  },
});