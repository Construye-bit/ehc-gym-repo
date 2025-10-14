import { query } from "../_generated/server";
import { requireSuperAdmin, requireAdmin } from "./utils";
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
                    // Search containing the term (LIKE simulation)
                    q.and(
                        q.gte(q.field("name"), searchTerm),
                        q.lt(q.field("name"), searchTerm + "\uffff")
                    )
                )
            )
            .collect();
    },
});

// === QUERIES FOR ADMINISTRATORS (without requiring super admin) ===

// List all cities (for regular admins)
export const listForAdmins = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return await ctx.db.query("cities").collect();
    },
});

// Search cities by country and state/region (for regular admins)
export const getByCountryAndStateForAdmins = query({
    args: {
        country: v.string(),
        state_region: v.string(),
    },
    handler: async (ctx, { country, state_region }) => {
        await requireAdmin(ctx);

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