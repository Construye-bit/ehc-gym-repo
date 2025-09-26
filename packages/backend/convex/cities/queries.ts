import { query } from "../_generated/server";
import { requireSuperAdmin } from "./utils";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        await requireSuperAdmin(ctx);
        return await ctx.db.query("cities").collect();
    },
});

export const getByCountryAndState = query({
    args: {
        country: v.string(),
        state_region: v.string(),
    },
    handler: async (ctx, { country, state_region }) => {
        await requireSuperAdmin(ctx);

        return await ctx.db
            .query("cities")
            .filter((q) =>
                q.and(
                    q.eq(q.field("country"), country),
                    q.eq(q.field("state_region"), state_region)
                )
            )
            .collect();
    },
});

export const searchByName = query({
    args: {
        searchTerm: v.string(),
    },
    handler: async (ctx, { searchTerm }) => {
        await requireSuperAdmin(ctx);

        return await ctx.db
            .query("cities")
            .filter((q) =>
                q.or(
                    q.eq(q.field("name"), searchTerm),
                    // Búsqueda que contenga el término (simulación de LIKE)
                    q.and(
                        q.gte(q.field("name"), searchTerm),
                        q.lt(q.field("name"), searchTerm + "\uffff")
                    )
                )
            )
            .collect();
    },
});