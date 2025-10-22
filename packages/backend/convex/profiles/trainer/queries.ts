import { query } from "../../_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "../common/utils";

// Perfil del trainer autenticado (DTO simple)
export const getMyTrainerProfile = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);

        const trainer = await ctx.db
            .query("trainers")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .first();
        if (!trainer) return null;

        const person = await ctx.db
            .query("persons")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .first();

        return {
            person: person ?? null,
            trainer,
        };
    },
});
