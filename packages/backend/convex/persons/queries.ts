import { query } from "../_generated/server";
import { v } from "convex/values";

// Query para obtener persona por ID
export const getPersonById = query({
    args: {
        personId: v.id("persons"),
    },
    handler: async (ctx, { personId }) => {
        return await ctx.db.get(personId);
    },
});

// Query para obtener persona por usuario ID
export const getPersonByUserId = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("persons")
            .filter((q) => q.eq(q.field("user_id"), userId))
            .first();
    },
});

// Query para verificar si existe una persona con un documento específico
export const checkPersonByDocument = query({
    args: {
        document_number: v.string(),
    },
    handler: async (ctx, { document_number }) => {
        return await ctx.db
            .query("persons")
            .filter((q) => q.eq(q.field("document_number"), document_number))
            .first();
    },
});