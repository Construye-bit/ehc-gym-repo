import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

// Queries auxiliares internas para createClientComplete

export const getUserByClerkId = internalQuery({
    args: {
        clerk_id: v.string(),
    },
    handler: async (ctx, { clerk_id }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", clerk_id))
            .first();
        return user;
    },
});

export const getUserRolesInternal = internalQuery({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        const roles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) => q.eq("user_id", userId).eq("active", true))
            .collect();
        return roles;
    },
});

export const getClientByIdInternal = internalQuery({
    args: {
        clientId: v.id("clients"),
    },
    handler: async (ctx, { clientId }) => {
        return await ctx.db.get(clientId);
    },
});

export const checkPersonByDocumentInternal = internalQuery({
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

export const getPersonByIdInternal = internalQuery({
    args: {
        personId: v.id("persons"),
    },
    handler: async (ctx, { personId }) => {
        return await ctx.db.get(personId);
    },
});

export const getUserByIdInternal = internalQuery({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        return await ctx.db.get(userId);
    },
});

export const getClientBranchLinks = internalQuery({
    args: {
        clientId: v.id("clients"),
    },
    handler: async (ctx, { clientId }) => {
        return await ctx.db
            .query("client_branches")
            .withIndex("by_client", (q) => q.eq("client_id", clientId))
            .filter((q) => q.eq(q.field("active"), true))
            .collect();
    },
});

export const getUserRoles = internalQuery({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) => q.eq("user_id", userId).eq("active", true))
            .collect();
    },
});

export const getEmergencyContacts = internalQuery({
    args: {
        personId: v.id("persons"),
    },
    handler: async (ctx, { personId }) => {
        return await ctx.db
            .query("emergency_contact")
            .withIndex("by_person", (q) => q.eq("person_id", personId))
            .filter((q) => q.eq(q.field("active"), true))
            .collect();
    },
});
